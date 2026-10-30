export type OrdionMode = 'fast' | 'hybrid' | 'code' | 'page' | 'deep' | 'web';

export interface OrdionWebSource {
  title: string;
  snippet: string;
  url: string;
}

export interface OrdionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  mode?: OrdionMode;
  sources?: OrdionWebSource[];
  latencyMs?: number;
  model?: string;
  isStreaming?: boolean;
}

export interface PageContext {
  url?: string;
  title?: string;
  content?: string;
}
