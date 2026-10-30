import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Play, RotateCcw, Trophy, Volume2, VolumeX } from 'lucide-react';

export const ArcadePage: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'snake' | '2048' | 'runner'>('snake');

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100 flex flex-col items-center p-6 select-none">
      {/* Top Arcade Header */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Aura Arcade</h1>
            <p className="text-xs text-slate-400">Offline mini-games built directly into the browser</p>
          </div>
        </div>

        {/* Game Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveGame('snake')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeGame === 'snake' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Retro Snake
          </button>
          <button
            onClick={() => setActiveGame('2048')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeGame === '2048' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            2048 Puzzle
          </button>
          <button
            onClick={() => setActiveGame('runner')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeGame === 'runner' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cyber Dino Runner
          </button>
        </div>
      </div>

      {/* Game Stage */}
      <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center">
        {activeGame === 'snake' && <SnakeGame />}
        {activeGame === '2048' && <Game2048 />}
        {activeGame === 'runner' && <DinoRunner />}
      </div>
    </div>
  );
};

/* --- Retro Snake Game --- */
const GRID_SIZE = 20;

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<[number, number][]>([[10, 10], [10, 11], [10, 12]]);
  const [food, setFood] = useState<[number, number]>([5, 5]);
  const [dir, setDir] = useState<[number, number]>([0, -1]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('snake_high_score') || 0));
  const [running, setRunning] = useState(false);
  const dirRef = useRef(dir);
  dirRef.current = dir;

  const spawnFood = () => {
    const rx = Math.floor(Math.random() * GRID_SIZE);
    const ry = Math.floor(Math.random() * GRID_SIZE);
    setFood([rx, ry]);
  };

  const resetGame = () => {
    setSnake([[10, 10], [10, 11], [10, 12]]);
    setDir([0, -1]);
    dirRef.current = [0, -1];
    setScore(0);
    setGameOver(false);
    spawnFood();
    setRunning(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const [dx, dy] = dirRef.current;
      if (['ArrowUp', 'KeyW'].includes(e.code) && dy === 0) {
        setDir([0, -1]);
      } else if (['ArrowDown', 'KeyS'].includes(e.code) && dy === 0) {
        setDir([0, 1]);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code) && dx === 0) {
        setDir([-1, 0]);
      } else if (['ArrowRight', 'KeyD'].includes(e.code) && dx === 0) {
        setDir([1, 0]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!running || gameOver) return;

    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const [dx, dy] = dirRef.current;
        const newHead: [number, number] = [head[0] + dx, head[1] + dy];

        // Wall collisions
        if (newHead[0] < 0 || newHead[0] >= GRID_SIZE || newHead[1] < 0 || newHead[1] >= GRID_SIZE) {
          setGameOver(true);
          setRunning(false);
          return prev;
        }

        // Self collision
        if (prev.some((seg) => seg[0] === newHead[0] && seg[1] === newHead[1])) {
          setGameOver(true);
          setRunning(false);
          return prev;
        }

        const newSnake = [newHead, ...prev];

        // Food eaten
        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          setScore((s) => {
            const nextScore = s + 10;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('snake_high_score', nextScore.toString());
            }
            return nextScore;
          });
          spawnFood();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 110);

    return () => clearInterval(interval);
  }, [running, gameOver, food, highScore]);

  return (
    <div className="flex flex-col items-center">
      {/* Scoreboard */}
      <div className="flex items-center gap-6 mb-4 text-xs font-mono">
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
          <span className="text-slate-400">Score:</span>
          <span className="text-emerald-400 font-bold text-sm tabular-nums">{score}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">High Score:</span>
          <span className="text-amber-400 font-bold text-sm tabular-nums">{highScore}</span>
        </div>
        <button
          onClick={resetGame}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{gameOver ? 'Play Again' : running ? 'Restart' : 'Start'}</span>
        </button>
      </div>

      {/* Grid Canvas */}
      <div className="relative w-[340px] h-[340px] sm:w-[400px] sm:h-[400px] bg-slate-900 border-2 border-slate-800 rounded-2xl p-1 shadow-2xl grid grid-cols-20 grid-rows-20 gap-0.5">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isHead = snake[0][0] === x && snake[0][1] === y;
          const isBody = snake.slice(1).some((seg) => seg[0] === x && seg[1] === y);
          const isFood = food[0] === x && food[1] === y;

          let cellClass = 'bg-slate-950/40 rounded-sm';
          if (isHead) cellClass = 'bg-emerald-400 rounded-sm shadow-md shadow-emerald-500/50';
          else if (isBody) cellClass = 'bg-emerald-600/80 rounded-sm';
          else if (isFood) cellClass = 'bg-rose-500 rounded-full animate-pulse shadow-sm shadow-rose-500';

          return <div key={i} className={cellClass} />;
        })}

        {/* Overlay when game over or not started */}
        {(!running || gameOver) && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              {gameOver ? 'Game Over!' : 'Retro Snake'}
            </h3>
            <p className="text-xs text-slate-400 mb-4 max-w-xs">
              Use Arrow Keys or WASD to navigate. Eat the red pixels and avoid walls.
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              {gameOver ? 'Try Again' : 'Start Playing'}
            </button>
          </div>
        )}
      </div>
      <p className="text-[11px] text-slate-500 mt-3 font-mono">Controls: Arrow keys / WASD</p>
    </div>
  );
};

/* --- 2048 Puzzle Game --- */
const Game2048: React.FC = () => {
  const [board, setBoard] = useState<number[][]>([
    [0, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 2, 0],
    [0, 0, 0, 0],
  ]);
  const [score, setScore] = useState(0);

  const initBoard = () => {
    const newB = [
      [0, 0, 0, 0],
      [0, 2, 0, 0],
      [0, 0, 2, 0],
      [0, 0, 0, 0],
    ];
    setBoard(newB);
    setScore(0);
  };

  const getTileColor = (val: number) => {
    const colors: Record<number, string> = {
      2: 'bg-slate-800 text-slate-200',
      4: 'bg-indigo-900/60 text-indigo-200 border-indigo-700/50',
      8: 'bg-amber-900/60 text-amber-200 border-amber-600/50',
      16: 'bg-orange-800/80 text-orange-100 border-orange-500/50',
      32: 'bg-rose-800 text-rose-100 border-rose-500/50',
      64: 'bg-pink-700 text-white font-bold',
      128: 'bg-yellow-600 text-white font-bold shadow-lg shadow-yellow-600/30',
      256: 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/40',
      512: 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/40',
      1024: 'bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-400/50',
      2048: 'bg-indigo-400 text-slate-950 font-black shadow-lg shadow-indigo-400/60',
    };
    return colors[val] || 'bg-slate-900 text-slate-400';
  };

  // Move helper
  const slide = (row: number[]) => {
    let arr = row.filter((x) => x !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        setScore((s) => s + arr[i]);
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter((x) => x !== 0);
    while (arr.length < 4) arr.push(0);
    return arr;
  };

  const addRandomTile = (currentBoard: number[][]) => {
    const emptyCells: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push([r, c]);
      }
    }
    if (emptyCells.length === 0) return currentBoard;
    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    currentBoard[r][c] = Math.random() > 0.1 ? 2 : 4;
    return [...currentBoard];
  };

  const moveLeft = () => {
    const newBoard = board.map((row) => slide(row));
    setBoard(addRandomTile(newBoard));
  };

  const moveRight = () => {
    const newBoard = board.map((row) => slide([...row].reverse()).reverse());
    setBoard(addRandomTile(newBoard));
  };

  const moveUp = () => {
    let newBoard = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    for (let c = 0; c < 4; c++) {
      const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
      const slid = slide(col);
      for (let r = 0; r < 4; r++) newBoard[r][c] = slid[r];
    }
    setBoard(addRandomTile(newBoard));
  };

  const moveDown = () => {
    let newBoard = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    for (let c = 0; c < 4; c++) {
      const col = [board[3][c], board[2][c], board[1][c], board[0][c]];
      const slid = slide(col);
      for (let r = 0; r < 4; r++) newBoard[3 - r][c] = slid[r];
    }
    setBoard(addRandomTile(newBoard));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) moveLeft();
      if (['ArrowRight', 'KeyD'].includes(e.code)) moveRight();
      if (['ArrowUp', 'KeyW'].includes(e.code)) moveUp();
      if (['ArrowDown', 'KeyS'].includes(e.code)) moveDown();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-4 text-xs font-mono">
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
          <span className="text-slate-400">Score:</span>
          <span className="text-amber-400 font-bold text-sm tabular-nums">{score}</span>
        </div>
        <button
          onClick={initBoard}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Game</span>
        </button>
      </div>

      <div className="w-[320px] h-[320px] sm:w-[360px] sm:h-[360px] bg-slate-900 border-2 border-slate-800 rounded-2xl p-3 grid grid-cols-4 gap-2.5 shadow-2xl">
        {board.flat().map((val, idx) => (
          <div
            key={idx}
            className={`rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold border transition-transform duration-100 ${getTileColor(
              val
            )}`}
          >
            {val > 0 ? val : ''}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-500 mt-3 font-mono">Use Arrow Keys or WASD to slide tiles</p>
    </div>
  );
};

/* --- Dino Cyber Runner --- */
const DinoRunner: React.FC = () => {
  const [dinoY, setDinoY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacleX, setObstacleX] = useState(500);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(false);

  const jump = () => {
    if (isJumping || gameOver) return;
    setIsJumping(true);
    let up = 0;
    const jumpInterval = setInterval(() => {
      up += 6;
      setDinoY(Math.sin((up * Math.PI) / 100) * 80);
      if (up >= 100) {
        clearInterval(jumpInterval);
        setDinoY(0);
        setIsJumping(false);
      }
    }, 16);
  };

  const startRunner = () => {
    setScore(0);
    setGameOver(false);
    setObstacleX(500);
    setDinoY(0);
    setRunning(true);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp'].includes(e.code)) {
        e.preventDefault();
        if (!running || gameOver) startRunner();
        else jump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [running, gameOver, isJumping]);

  useEffect(() => {
    if (!running || gameOver) return;
    const timer = setInterval(() => {
      setObstacleX((x) => {
        if (x <= -30) {
          setScore((s) => s + 10);
          return 500;
        }
        // Collision check
        if (x > 30 && x < 70 && dinoY < 35) {
          setGameOver(true);
          setRunning(false);
        }
        return x - 7;
      });
    }, 20);
    return () => clearInterval(timer);
  }, [running, gameOver, dinoY]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-4 text-xs font-mono">
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
          <span className="text-slate-400">Score:</span>
          <span className="text-cyan-400 font-bold text-sm tabular-nums">{score}</span>
        </div>
      </div>

      <div
        onClick={running ? jump : startRunner}
        className="relative w-[340px] sm:w-[500px] h-[220px] bg-slate-900 border-2 border-slate-800 rounded-2xl overflow-hidden cursor-pointer shadow-2xl flex flex-col justify-end p-4"
      >
        {/* Ground */}
        <div className="w-full h-1 bg-slate-700"></div>

        {/* Dino */}
        <div
          className="absolute left-10 text-3xl transition-transform"
          style={{ bottom: `${20 + dinoY}px` }}
        >
          🦖
        </div>

        {/* Obstacle Cactus / Drone */}
        <div
          className="absolute text-2xl"
          style={{ left: `${obstacleX}px`, bottom: '20px' }}
        >
          🌵
        </div>

        {/* Start / Game Over Overlay */}
        {(!running || gameOver) && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <h3 className="text-lg font-bold text-white mb-1">
              {gameOver ? 'Crashed!' : 'Cyber Dino Jump'}
            </h3>
            <p className="text-xs text-slate-400 mb-3">Press Spacebar or Click to Jump</p>
            <button
              onClick={startRunner}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20"
            >
              {gameOver ? 'Play Again' : 'Start Jump'}
            </button>
          </div>
        )}
      </div>
      <p className="text-[11px] text-slate-500 mt-3 font-mono">Press Space or Click to Jump</p>
    </div>
  );
};
