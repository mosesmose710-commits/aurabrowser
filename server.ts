import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client with aistudio-build telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for Web Search Grounding
async function fetchWebGrounding(query: string) {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      },
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const results: Array<{ title: string; snippet: string; url: string }> = [];

    $('.result').slice(0, 4).each((_i, el) => {
      const title = $(el).find('.result__title').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      let rawUrl = $(el).find('.result__url').text().trim();
      if (rawUrl && !rawUrl.startsWith('http')) {
        rawUrl = 'https://' + rawUrl;
      }
      if (title && snippet) {
        results.push({ title, snippet, url: rawUrl || 'https://duckduckgo.com/?q=' + encodeURIComponent(query) });
      }
    });
    return results;
  } catch (err) {
    return [];
  }
}

// Real Web Proxy for Browser iframe
app.get('/api/proxy', async (req: Request, res: Response) => {
  let targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).send('URL query parameter is required');
  }

  // Normalize URL
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  try {
    const parsedTarget = new URL(targetUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 AuraBrowser/1.0',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });

    clearTimeout(timeout);

    const finalUrl = response.url || targetUrl;
    const finalParsed = new URL(finalUrl);
    const contentType = response.headers.get('content-type') || 'text/html';

    // Handle HTML content
    if (contentType.toLowerCase().includes('text/html')) {
      const htmlText = await response.text();
      const $ = cheerio.load(htmlText);

      // Strip frame busting and restrictive security meta tags
      $('meta[http-equiv="Content-Security-Policy"]').remove();
      $('meta[http-equiv="content-security-policy"]').remove();
      $('meta[http-equiv="X-Frame-Options"]').remove();
      $('meta[http-equiv="x-frame-options"]').remove();

      // Ensure base tag exists with absolute path
      if ($('base').length === 0) {
        $('head').prepend(`<base href="${finalParsed.origin}${finalParsed.pathname}" />`);
      }

      // Inject Aura Browser bridge script
      const bridgeScript = `
        <script>
          (function() {
            window.__AURA_CURRENT_URL = ${JSON.stringify(finalUrl)};
            
            // Intercept link clicks to notify Aura Browser
            document.addEventListener('click', function(e) {
              var target = e.target;
              var anchor = target.closest('a');
              if (anchor && anchor.href) {
                var href = anchor.href;
                if (!href.startsWith('javascript:') && !href.startsWith('#') && !href.startsWith('mailto:')) {
                  e.preventDefault();
                  try {
                    window.parent.postMessage({
                      type: 'AURA_NAVIGATE',
                      url: href
                    }, '*');
                  } catch (err) {
                    window.location.href = href;
                  }
                }
              }
            }, true);

            // Notify parent of title and loaded state
            function notifyLoaded() {
              try {
                window.parent.postMessage({
                  type: 'AURA_LOAD_COMPLETE',
                  url: ${JSON.stringify(finalUrl)},
                  title: document.title || ${JSON.stringify(finalParsed.hostname)}
                }, '*');
              } catch (e) {}
            }

            if (document.readyState === 'complete' || document.readyState === 'interactive') {
              notifyLoaded();
            } else {
              window.addEventListener('DOMContentLoaded', notifyLoaded);
              window.addEventListener('load', notifyLoaded);
            }
          })();
        </script>
      `;
      $('head').append(bridgeScript);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.send($.html());
    }

    // For non-HTML binary / media data
    const arrayBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error('Proxy fetch failed:', error.message);
    const fallbackHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unable to Load Page</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 24px;
            box-sizing: border-box;
          }
          .card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 32px;
            max-width: 520px;
            text-align: center;
          }
          h2 { color: #f87171; margin-top: 0; font-size: 20px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
          .url-box {
            background: #0f172a;
            border: 1px solid #334155;
            padding: 10px 14px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            color: #38bdf8;
            word-break: break-all;
            margin: 16px 0;
          }
          .btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            font-size: 14px;
            transition: background 0.2s;
          }
          .btn:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Connection Issue</h2>
          <p>The website took too long to respond, blocked external proxies, or is unavailable.</p>
          <div class="url-box">${targetUrl}</div>
          <p style="font-size: 12px; color: #64748b;">Error: ${error.message || 'Request timeout'}</p>
          <button class="btn" onclick="window.location.reload()">Retry Connection</button>
        </div>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(fallbackHtml);
  }
});

// Real-Time Search API (DuckDuckGo + Wikipedia + Instant Answers)
app.get('/api/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim();
  if (!query) {
    return res.json({ results: [], instantAnswer: null });
  }

  try {
    // 1. DuckDuckGo Instant Answers
    const ddgPromise = fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    ).then((r) => (r.ok ? r.json() : null)).catch(() => null);

    // 2. Wikipedia search API
    const wikiPromise = fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
        query
      )}&limit=6&namespace=0&format=json`
    ).then((r) => (r.ok ? r.json() : null)).catch(() => null);

    // 3. Hacker News Search API
    const hnPromise = fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=6`
    ).then((r) => (r.ok ? r.json() : null)).catch(() => null);

    const [ddgData, wikiData, hnData] = await Promise.all([ddgPromise, wikiPromise, hnPromise]);

    const results: any[] = [];
    let instantAnswer: any = null;

    // Process DuckDuckGo instant answer
    if (ddgData) {
      if (ddgData.AbstractText && ddgData.Heading) {
        instantAnswer = {
          title: ddgData.Heading,
          description: ddgData.AbstractText,
          source: ddgData.AbstractSource || 'DuckDuckGo',
          url: ddgData.AbstractURL || '',
          image: ddgData.Image ? (ddgData.Image.startsWith('http') ? ddgData.Image : `https://duckduckgo.com${ddgData.Image}`) : null,
        };
      }

      if (Array.isArray(ddgData.RelatedTopics)) {
        ddgData.RelatedTopics.slice(0, 5).forEach((topic: any) => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0] || topic.Text,
              snippet: topic.Text,
              url: topic.FirstURL,
              source: 'DuckDuckGo',
            });
          }
        });
      }
    }

    // Process Wikipedia results
    if (wikiData && Array.isArray(wikiData) && wikiData.length >= 4) {
      const titles = wikiData[1] || [];
      const descriptions = wikiData[2] || [];
      const urls = wikiData[3] || [];
      for (let i = 0; i < titles.length; i++) {
        if (urls[i]) {
          results.push({
            title: titles[i],
            snippet: descriptions[i] || `Read about ${titles[i]} on Wikipedia, the free encyclopedia.`,
            url: urls[i],
            source: 'Wikipedia',
          });
        }
      }
    }

    // Process Hacker News stories
    if (hnData && Array.isArray(hnData.hits)) {
      hnData.hits.slice(0, 4).forEach((hit: any) => {
        if (hit.title) {
          results.push({
            title: hit.title,
            snippet: `Discussion with ${hit.num_comments || 0} comments and ${hit.points || 0} points on Hacker News.`,
            url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
            source: 'Hacker News',
          });
        }
      });
    }

    // Fallback if no instant results were returned
    if (results.length === 0) {
      results.push(
        {
          title: `Search "${query}" on DuckDuckGo`,
          snippet: `Open the full search page on DuckDuckGo privacy search engine for "${query}".`,
          url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          source: 'DuckDuckGo',
        },
        {
          title: `Explore "${query}" on Wikipedia`,
          snippet: `Look up articles and references for "${query}" on Wikipedia.`,
          url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
          source: 'Wikipedia',
        },
        {
          title: `Search "${query}" on GitHub`,
          snippet: `Find repositories, code, and developer tools related to "${query}".`,
          url: `https://github.com/search?q=${encodeURIComponent(query)}`,
          source: 'GitHub',
        }
      );
    }

    return res.json({ query, instantAnswer, results });
  } catch (error: any) {
    return res.status(500).json({ error: error.message, results: [] });
  }
});

// Clean Reader Mode Extractor
app.get('/api/read', async (req: Request, res: Response) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AuraReader/1.0',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove noise elements
    $('script, style, nav, footer, header, aside, .advertisement, .ads, .sidebar, iframe, noscript').remove();

    const title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled Article';
    const author = $('meta[name="author"]').attr('content') || $('[rel="author"]').text().trim() || '';
    const siteName = $('meta[property="og:site_name"]').attr('content') || new URL(targetUrl).hostname;
    const leadImage = $('meta[property="og:image"]').attr('content') || $('article img').first().attr('src') || null;

    // Collect article text paragraphs
    const paragraphs: string[] = [];
    $('article p, main p, .post-content p, .article-body p, p').each((_, el) => {
      const txt = $(el).text().trim();
      if (txt.length > 50 && !paragraphs.includes(txt)) {
        paragraphs.push(txt);
      }
    });

    const wordCount = paragraphs.join(' ').split(/\s+/).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    return res.json({
      title,
      author,
      siteName,
      leadImage,
      paragraphs: paragraphs.slice(0, 30),
      wordCount,
      readingTimeMinutes,
      url: targetUrl,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Hacker News Top Stories
app.get('/api/hackernews', async (_req: Request, res: Response) => {
  try {
    const r = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=20');
    const data = await r.json();
    return res.json(data.hits || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message, stories: [] });
  }
});

// Serve direct user uploaded files
app.get(/\/file_[a-zA-Z0-9_\.]+\.png/, (_req: Request, res: Response) => {
  res.sendFile(path.resolve('public', 'file_00000000c6188211b7ae4496ba2505c0.png'));
});

// Ordion AI Chat Endpoint (Fast & Hybrid)
app.post('/api/ordion/chat', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { message, history = [], mode = 'fast', pageContext } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    let systemInstruction = `You are Ordion, a fast, hybrid, all-features AI assistant embedded in XENON Browser created by Moses.
You are sharp, lightning-fast, and exceptionally capable across all domains:
- Instant general reasoning, summaries, and Q&A
- Full-stack software engineering (Python, JavaScript, TypeScript, HTML/CSS, SQL, Rust, C++)
- Real-time web knowledge synthesis
- Browser co-pilot capabilities (analyzing webpages, summarizing articles, inspecting code)
- Direct, crisp communication with clean Markdown formatting, clear headers, bullet points, and code blocks with language tags.
Always identify as Ordion when asked.

IMPORTANT CREATOR & FAMILY INFORMATION ABOUT MOSES:
Moses is the visionary creator of XENON Browser.
In case the user asks about Moses or his family info, here are the exact verified facts:
- Brother: Felix
- Another Brother: Ibrahim
- Beautiful Sister: Dinah
- Father: John
- Mother: Peris
Whenever asked about Moses, his siblings, parents, or family background, always share this information accurately, respectfully, and warmly.`;

    let userPromptWithContext = message;
    let webSources: Array<{ title: string; snippet: string; url: string }> = [];

    // If page context is provided
    if (pageContext && (pageContext.url || pageContext.title || pageContext.content)) {
      userPromptWithContext = `[Current Active Browser Tab Context:
URL: ${pageContext.url || 'unknown'}
Title: ${pageContext.title || 'untitled'}
${pageContext.content ? `Page Content Excerpt: ${pageContext.content.slice(0, 3000)}` : ''}
]

User Query: ${message}`;
    }

    // Mode-specific instructions and hybrid web grounding
    if (mode === 'web' || mode === 'hybrid') {
      webSources = await fetchWebGrounding(message);
      if (webSources.length > 0) {
        const groundingText = webSources
          .map((s, idx) => `[Source ${idx + 1}]: "${s.title}" (${s.url})\n${s.snippet}`)
          .join('\n\n');
        userPromptWithContext = `${userPromptWithContext}\n\n[Live Web Grounding Context]:\n${groundingText}\n\nSynthesize an up-to-date answer using these live web sources when relevant.`;
      }
    } else if (mode === 'code') {
      systemInstruction += `\nYou are in CODE & ENGINEER mode. Provide production-ready, clean, well-documented code with detailed comments, edge cases, and run instructions. Use syntax-highlighted code fences (\`\`\`python, \`\`\`javascript, \`\`\`html, etc.).`;
    } else if (mode === 'deep') {
      systemInstruction += `\nYou are in DEEP REASONING mode. Break problems down methodically, providing thorough step-by-step logic, architectural trade-offs, and rigorous explanations.`;
    } else if (mode === 'page') {
      systemInstruction += `\nYou are in WEBPAGE CO-PILOT mode. Focus specifically on analyzing, summarizing, and answering questions about the active webpage provided in context.`;
    }

    // Build conversation history
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.text && (item.role === 'user' || item.role === 'model')) {
          contents.push({
            role: item.role,
            parts: [{ text: item.text }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: userPromptWithContext }],
    });

    let responseText = '';
    let usedModel = 'gemini-3.8-flash';

    const models = ['gemini-3.8-flash', 'gemini-flash-latest'];
    let lastError: any = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      for (const m of models) {
        try {
          const response = await ai.models.generateContent({
            model: m,
            contents,
            config: { systemInstruction },
          });
          if (response && response.text) {
            responseText = response.text;
            usedModel = m;
            break;
          }
        } catch (err: any) {
          lastError = err;
        }
      }
      if (responseText) break;
      await new Promise((r) => setTimeout(r, 500));
    }

    if (!responseText) {
      throw lastError || new Error('Service temporarily busy. Please retry in a moment.');
    }

    const latencyMs = Date.now() - startTime;
    return res.json({
      text: responseText,
      sources: webSources,
      latencyMs,
      mode,
      model: usedModel,
    });
  } catch (error: any) {
    console.error('Ordion chat error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate response' });
  }
});



// Ordion Live Streaming Endpoint (Server-Sent Events)
app.post('/api/ordion/stream', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { message, history = [], mode = 'fast', pageContext } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).send('Message is required');
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    let systemInstruction = `You are Ordion, a fast, hybrid, all-features AI assistant embedded in XENON Browser created by Moses.
You are sharp, lightning-fast, and exceptionally capable. Provide clean Markdown with code blocks and bullet points.

CREATOR & FAMILY INFO: Moses created XENON Browser. His family includes his brother Felix, brother Ibrahim, beautiful sister Dinah, father John, and mother Peris. Share this warmly when asked.`;

    let userPromptWithContext = message;
    let webSources: Array<{ title: string; snippet: string; url: string }> = [];

    if (pageContext && (pageContext.url || pageContext.title || pageContext.content)) {
      userPromptWithContext = `[Active Browser Tab Context:\nURL: ${pageContext.url || 'unknown'}\nTitle: ${pageContext.title || 'untitled'}\n${pageContext.content ? `Excerpt: ${pageContext.content.slice(0, 2500)}` : ''}\n]\nUser Query: ${message}`;
    }

    if (mode === 'web' || mode === 'hybrid') {
      webSources = await fetchWebGrounding(message);
      if (webSources.length > 0) {
        const groundingText = webSources
          .map((s, idx) => `[Source ${idx + 1}]: "${s.title}" (${s.url})\n${s.snippet}`)
          .join('\n\n');
        userPromptWithContext = `${userPromptWithContext}\n\n[Live Web Sources]:\n${groundingText}`;
      }
    } else if (mode === 'code') {
      systemInstruction += `\nProvide production-ready code with syntax highlighting tags.`;
    }

    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.text && (item.role === 'user' || item.role === 'model')) {
          contents.push({ role: item.role, parts: [{ text: item.text }] });
        }
      }
    }
    contents.push({ role: 'user', parts: [{ text: userPromptWithContext }] });

    // Send sources first if found
    if (webSources.length > 0) {
      res.write(`data: ${JSON.stringify({ type: 'sources', sources: webSources })}\n\n`);
    }

    let stream;
    try {
      stream = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents,
        config: { systemInstruction },
      });
    } catch {
      stream = await ai.models.generateContentStream({
        model: 'gemini-flash-latest',
        contents,
        config: { systemInstruction },
      });
    }

    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk.text })}\n\n`);
      }
    }

    const latencyMs = Date.now() - startTime;
    res.write(`data: ${JSON.stringify({ type: 'done', latencyMs })}\n\n`);
    res.end();
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
    res.end();
  }
});

// Start Express server and attach Vite middlewares or static files
async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aura Browser backend running at http://0.0.0.0:${PORT}`);
  });
}

start();
