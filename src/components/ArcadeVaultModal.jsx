import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Trophy,
  X,
  Play,
  Pause,
  RotateCcw,
  Wallet,
  Layers,
  TrendingUp,
  Heart,
  Zap,
  Sparkles,
} from 'lucide-react';

const ARCADE_GAMES = [
  { id: 'snake', title: 'Snake', icon: Gamepad2 },
  { id: 'catch', title: 'Catch', icon: Wallet },
  { id: '2048', title: '2048', icon: Layers },
  { id: 'runner', title: 'Runner', icon: TrendingUp },
];

// ==========================================
// 1. SNAKE GAME VIEW
// ==========================================
function SnakeGameView({ currency = '₹', onUpdateScore, onGameOver, onGameStart, isPaused }) {
  const GRID_COLS = 16;
  const GRID_ROWS = 20;

  const startX = Math.floor(GRID_COLS / 2);
  const startY = Math.floor(GRID_ROWS / 2);

  const [snake, setSnake] = useState([
    { x: startX, y: startY },
    { x: startX, y: startY + 1 },
    { x: startX, y: startY + 2 },
  ]);
  const [direction, setDirection] = useState('UP');
  const nextDirRef = useRef('UP');
  const [food, setFood] = useState({ x: startX, y: Math.max(2, startY - 5) });
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('IDLE');
  const [speed, setSpeed] = useState(120);

  const touchStartRef = useRef({ x: 0, y: 0 });
  const stateRef = useRef('IDLE');

  const getRandomFood = (currentSnake) => {
    let newFood;
    let attempts = 0;
    while (attempts < 200) {
      newFood = {
        x: Math.floor(Math.random() * GRID_COLS),
        y: Math.floor(Math.random() * GRID_ROWS),
      };
      if (!currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y)) return newFood;
      attempts++;
    }
    return { x: 2, y: 2 };
  };

  const startGame = (initialDir = 'UP') => {
    const init = [
      { x: startX, y: startY },
      { x: startX, y: startY + 1 },
      { x: startX, y: startY + 2 },
    ];
    setSnake(init);
    setDirection(initialDir);
    nextDirRef.current = initialDir;
    setFood(getRandomFood(init));
    setScore(0);
    onUpdateScore(0);
    setSpeed(120);
    setGameState('PLAYING');
    stateRef.current = 'PLAYING';
    onGameStart();
  };

  const changeDirection = (dir) => {
    const current = nextDirRef.current;
    if (dir === 'UP' && current !== 'DOWN') nextDirRef.current = 'UP';
    if (dir === 'DOWN' && current !== 'UP') nextDirRef.current = 'DOWN';
    if (dir === 'LEFT' && current !== 'RIGHT') nextDirRef.current = 'LEFT';
    if (dir === 'RIGHT' && current !== 'LEFT') nextDirRef.current = 'RIGHT';
  };

  const handleAction = (dir) => {
    if (stateRef.current === 'IDLE' || stateRef.current === 'GAME_OVER') {
      startGame(dir);
    } else if (stateRef.current === 'PLAYING') {
      changeDirection(dir);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        handleAction('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        handleAction('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        handleAction('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        handleAction('RIGHT');
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (stateRef.current === 'IDLE' || stateRef.current === 'GAME_OVER') startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch handlers
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const THRESHOLD = 14;

    if (Math.abs(dx) > THRESHOLD || Math.abs(dy) > THRESHOLD) {
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) handleAction('RIGHT');
        else handleAction('LEFT');
      } else {
        if (dy > 0) handleAction('DOWN');
        else handleAction('UP');
      }
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  // Game loop
  useEffect(() => {
    if (gameState !== 'PLAYING' || isPaused) return;

    const timer = setInterval(() => {
      const dir = nextDirRef.current;
      setDirection(dir);

      setSnake((prev) => {
        const head = { ...prev[0] };
        if (dir === 'UP') head.y -= 1;
        if (dir === 'DOWN') head.y += 1;
        if (dir === 'LEFT') head.x -= 1;
        if (dir === 'RIGHT') head.x += 1;

        // Wrap around borders
        if (head.x < 0) head.x = GRID_COLS - 1;
        else if (head.x >= GRID_COLS) head.x = 0;
        if (head.y < 0) head.y = GRID_ROWS - 1;
        else if (head.y >= GRID_ROWS) head.y = 0;

        // Self collision
        if (prev.some((seg) => seg.x === head.x && seg.y === head.y)) {
          setGameState('GAME_OVER');
          stateRef.current = 'GAME_OVER';
          onGameOver(score);
          return prev;
        }

        const nextSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          onUpdateScore(newScore);
          setFood(getRandomFood(nextSnake));
          if (newScore % 40 === 0 && speed > 60) setSpeed((s) => Math.max(60, s - 6));
        } else {
          nextSnake.pop();
        }
        return nextSnake;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [gameState, isPaused, food, score, speed]);

  return (
    <div
      className="relative w-full h-full bg-[#0F0F13] border-2 border-[#202028] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onClick={() => {
        if (gameState === 'IDLE' || gameState === 'GAME_OVER') startGame();
      }}
    >
      <div
        className="w-full h-full relative"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
        }}
      >
        {/* Food */}
        <div
          className="absolute bg-[#F59E0B] rounded-full flex items-center justify-center font-black text-black shadow-lg animate-pulse z-10"
          style={{
            left: `${(food.x / GRID_COLS) * 100}%`,
            top: `${(food.y / GRID_ROWS) * 100}%`,
            width: `${(1 / GRID_COLS) * 100}%`,
            height: `${(1 / GRID_ROWS) * 100}%`,
            fontSize: '11px',
          }}
        >
          {currency}
        </div>

        {/* Snake Segments */}
        {snake.map((seg, idx) => {
          const isHead = idx === 0;
          return (
            <div
              key={idx}
              className={`absolute transition-all ${
                isHead ? 'bg-[#FFFFFF] rounded-md shadow-md z-20' : 'bg-[#9E9EA8] rounded-sm'
              }`}
              style={{
                left: `${(seg.x / GRID_COLS) * 100}%`,
                top: `${(seg.y / GRID_ROWS) * 100}%`,
                width: `${(1 / GRID_COLS) * 100}%`,
                height: `${(1 / GRID_ROWS) * 100}%`,
                opacity: Math.max(0.45, 1 - idx * 0.025),
              }}
            />
          );
        })}
      </div>

      {/* Overlays */}
      {gameState === 'IDLE' && (
        <div className="absolute inset-0 bg-[#09090C]/90 flex flex-col items-center justify-center p-6 text-center z-30 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#181822] border border-[#2D2D3C] flex items-center justify-center text-[#FFFFFF]">
            <Gamepad2 size={24} />
          </div>
          <h4 className="text-lg font-extrabold text-[#FFFFFF]">Balance Snake</h4>
          <p className="text-xs text-[#A0A0AA] max-w-[220px]">
            Swipe anywhere or use Arrow keys to glide through borders!
          </p>
          <button className="px-6 py-2.5 bg-[#FFFFFF] hover:bg-[#EAEAEA] text-[#090909] font-black text-xs rounded-full flex items-center space-x-1.5 shadow-lg active:scale-95 cursor-pointer mt-2">
            <Play size={14} fill="#090909" />
            <span>START GAME</span>
          </button>
        </div>
      )}

      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 bg-[#09090C]/90 flex flex-col items-center justify-center p-6 text-center z-30 space-y-3">
          <h4 className="text-xl font-black text-[#FF6B6B]">GAME OVER</h4>
          <p className="text-xs text-[#D6D6D6]">
            Final Score: <strong className="text-[#FFFFFF]">{currency}{score * 100}</strong>
          </p>
          <button className="px-6 py-2.5 bg-[#FFFFFF] hover:bg-[#EAEAEA] text-[#090909] font-black text-xs rounded-full flex items-center space-x-1.5 shadow-lg active:scale-95 cursor-pointer mt-2">
            <RotateCcw size={14} strokeWidth={2.5} />
            <span>PLAY AGAIN</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. COIN CATCH GAME VIEW
// ==========================================
function CoinCatchGameView({ currency = '₹', onUpdateScore, onGameOver, onGameStart, isPaused }) {
  const [basketX, setBasketX] = useState(50); // percentage 0-100%
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isBullRun, setIsBullRun] = useState(false);
  const [gameState, setGameState] = useState('IDLE');

  const containerRef = useRef(null);
  const basketXRef = useRef(50);
  basketXRef.current = basketX;
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const stateRef = useRef('IDLE');

  const startGame = () => {
    setBasketX(50);
    setItems([]);
    setScore(0);
    scoreRef.current = 0;
    setLives(3);
    livesRef.current = 3;
    setIsBullRun(false);
    setGameState('PLAYING');
    stateRef.current = 'PLAYING';
    onUpdateScore(0);
    onGameStart();
  };

  const handlePointerMove = (e) => {
    if (!containerRef.current || stateRef.current !== 'PLAYING') return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (!clientX) return;
    const pct = Math.max(8, Math.min(92, ((clientX - rect.left) / rect.width) * 100));
    setBasketX(pct);
  };

  // Keyboard controls for web
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        setBasketX((prev) => Math.max(8, prev - 6));
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        setBasketX((prev) => Math.min(92, prev + 6));
      } else if (e.code === 'Space') {
        if (stateRef.current === 'IDLE' || stateRef.current === 'GAME_OVER') startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Physics loop
  useEffect(() => {
    if (gameState !== 'PLAYING' || isPaused) return;

    let frameCount = 0;
    const interval = setInterval(() => {
      frameCount++;

      if (frameCount % 24 === 0) {
        const rand = Math.random();
        let type = 'coin';
        let val = 100;
        let color = '#F59E0B';

        if (rand > 0.88) {
          type = 'lightning';
          color = '#10B981';
        } else if (rand > 0.72) {
          type = 'gem';
          val = 500;
          color = '#60A5FA';
        } else if (rand > 0.50) {
          type = 'tax';
          val = -150;
          color = '#EF4444';
        }

        const newItem = {
          id: Date.now() + Math.random(),
          type,
          val,
          color,
          x: Math.random() * 84 + 8, // percentage 8% to 92%
          y: -5,
          speed: Math.random() * 0.4 + 1.2,
        };
        setItems((prev) => [...prev, newItem]);
      }

      setItems((prevItems) => {
        const nextItems = [];
        const curBasketX = basketXRef.current;

        for (const item of prevItems) {
          const newY = item.y + item.speed;

          // Catch collision at bottom (~88% to 94%)
          const isCaught = newY >= 88 && newY <= 95 && Math.abs(item.x - curBasketX) <= 12;

          if (isCaught) {
            if (item.type === 'coin' || item.type === 'gem') {
              const add = isBullRun ? item.val * 2 : item.val;
              scoreRef.current += add;
              setScore(scoreRef.current);
              onUpdateScore(scoreRef.current);
            } else if (item.type === 'lightning') {
              setIsBullRun(true);
              scoreRef.current += 200;
              setScore(scoreRef.current);
              onUpdateScore(scoreRef.current);
              setTimeout(() => setIsBullRun(false), 5000);
            } else if (item.type === 'tax') {
              livesRef.current -= 1;
              setLives(livesRef.current);
              scoreRef.current = Math.max(0, scoreRef.current - 150);
              setScore(scoreRef.current);
              onUpdateScore(scoreRef.current);

              if (livesRef.current <= 0) {
                setGameState('GAME_OVER');
                stateRef.current = 'GAME_OVER';
                onGameOver(scoreRef.current);
                return [];
              }
            }
          } else if (newY < 105) {
            nextItems.push({ ...item, y: newY });
          }
        }
        return nextItems;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [gameState, isPaused, isBullRun]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handlePointerMove}
      onTouchMove={handlePointerMove}
      onClick={() => {
        if (gameState === 'IDLE' || gameState === 'GAME_OVER') startGame();
      }}
      className={`relative w-full h-full border-2 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center select-none transition-colors ${
        isBullRun ? 'bg-[#0A1410] border-[#10B981]' : 'bg-[#0F0F13] border-[#202028]'
      }`}
    >
      {/* Top Lives & Bull Run Indicator */}
      <div className="absolute top-3 inset-x-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} size={14} className={i < lives ? 'text-red-500 fill-red-500' : 'text-zinc-600'} />
          ))}
        </div>

        {isBullRun && (
          <div className="bg-emerald-500 text-black px-2.5 py-0.5 rounded-full flex items-center space-x-1 text-[10px] font-black">
            <Zap size={11} fill="currentColor" />
            <span>2X BULL RUN</span>
          </div>
        )}
      </div>

      {/* Falling Items */}
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            backgroundColor: item.color,
            color: item.type === 'coin' || item.type === 'lightning' ? '#000' : '#fff',
          }}
        >
          {item.type === 'coin' && <span>{currency}</span>}
          {item.type === 'gem' && <Sparkles size={14} />}
          {item.type === 'lightning' && <Zap size={14} fill="currentColor" />}
          {item.type === 'tax' && <span className="text-[10px] font-black">%</span>}
        </div>
      ))}

      {/* Vault / Basket */}
      <div
        className={`absolute bottom-3.5 w-18 h-4.5 rounded-xl bg-white border-2 flex items-center justify-center shadow-lg transform -translate-x-1/2 transition-all duration-75 ${
          isBullRun ? 'border-emerald-400' : 'border-zinc-300'
        }`}
        style={{ left: `${basketX}%` }}
      >
        <div className="w-10 h-1 bg-black rounded-full" />
      </div>

      {/* Overlays */}
      {gameState === 'IDLE' && (
        <div className="absolute inset-0 bg-[#09090C]/90 flex flex-col items-center justify-center p-6 text-center z-30 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#181822] border border-[#2D2D3C] flex items-center justify-center text-[#FFFFFF]">
            <Wallet size={24} />
          </div>
          <h4 className="text-lg font-extrabold text-[#FFFFFF]">Coin Catch</h4>
          <p className="text-xs text-[#A0A0AA] max-w-[220px]">
            Slide your mouse, touch, or use Arrow keys to catch coins & dodge tax bombs!
          </p>
          <button className="px-6 py-2.5 bg-[#FFFFFF] hover:bg-[#EAEAEA] text-[#090909] font-black text-xs rounded-full flex items-center space-x-1.5 shadow-lg active:scale-95 cursor-pointer mt-2">
            <Play size={14} fill="#090909" />
            <span>START CATCHING</span>
          </button>
        </div>
      )}

      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 bg-[#09090C]/90 flex flex-col items-center justify-center p-6 text-center z-30 space-y-3">
          <h4 className="text-xl font-black text-[#FF6B6B]">GAME OVER</h4>
          <p className="text-xs text-[#D6D6D6]">
            Total Assets Captured: <strong className="text-[#FFFFFF]">{currency}{score}</strong>
          </p>
          <button className="px-6 py-2.5 bg-[#FFFFFF] hover:bg-[#EAEAEA] text-[#090909] font-black text-xs rounded-full flex items-center space-x-1.5 shadow-lg active:scale-95 cursor-pointer mt-2">
            <RotateCcw size={14} strokeWidth={2.5} />
            <span>PLAY AGAIN</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. 2048 WEALTH PUZZLE VIEW
// ==========================================
function Wealth2048GameView({ currency = '₹', onUpdateScore, onGameOver, onGameStart }) {
  const [grid, setGrid] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('IDLE');

  const touchStartRef = useRef({ x: 0, y: 0 });
  const stateRef = useRef('IDLE');

  const getEmptyCells = (g) => {
    const empty = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) empty.push({ r, c });
      }
    }
    return empty;
  };

  const spawnRandomTile = (g) => {
    const empty = getEmptyCells(g);
    if (empty.length === 0) return g;
    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    const val = Math.random() > 0.15 ? 2 : 4;
    const next = g.map((row) => [...row]);
    next[r][c] = val;
    return next;
  };

  const startGame = () => {
    let g = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    g = spawnRandomTile(g);
    g = spawnRandomTile(g);
    setGrid(g);
    setScore(0);
    setGameState('PLAYING');
    stateRef.current = 'PLAYING';
    onUpdateScore(0);
    onGameStart();
  };

  const slideAndMergeRow = (row) => {
    let filtered = row.filter((v) => v !== 0);
    let gained = 0;
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        gained += filtered[i];
        filtered[i + 1] = 0;
      }
    }
    filtered = filtered.filter((v) => v !== 0);
    while (filtered.length < 4) filtered.push(0);
    return { row: filtered, gained };
  };

  const rotateGridClockwise = (g) => {
    const next = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        next[c][3 - r] = g[r][c];
      }
    }
    return next;
  };

  const move = (dir) => {
    if (stateRef.current !== 'PLAYING') return;

    let rotations = 0;
    if (dir === 'UP') rotations = 3;
    if (dir === 'RIGHT') rotations = 2;
    if (dir === 'DOWN') rotations = 1;

    let working = grid.map((r) => [...r]);
    for (let i = 0; i < rotations; i++) working = rotateGridClockwise(working);

    let totalGained = 0;
    let changed = false;
    const newGrid = [];

    for (let r = 0; r < 4; r++) {
      const { row: nextRow, gained } = slideAndMergeRow(working[r]);
      totalGained += gained;
      if (nextRow.some((val, idx) => val !== working[r][idx])) changed = true;
      newGrid.push(nextRow);
    }

    if (!changed) return;

    let finalGrid = newGrid;
    for (let i = 0; i < (4 - rotations) % 4; i++) finalGrid = rotateGridClockwise(finalGrid);

    const withSpawn = spawnRandomTile(finalGrid);
    setGrid(withSpawn);

    const nextScore = score + totalGained;
    setScore(nextScore);
    onUpdateScore(nextScore);

    if (getEmptyCells(withSpawn).length === 0) {
      let canMove = false;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (r < 3 && withSpawn[r][c] === withSpawn[r + 1][c]) canMove = true;
          if (c < 3 && withSpawn[r][c] === withSpawn[r][c + 1]) canMove = true;
        }
      }
      if (!canMove) {
        setGameState('GAME_OVER');
        stateRef.current = 'GAME_OVER';
        onGameOver(nextScore);
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        move('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        move('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        move('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        move('RIGHT');
      } else if (e.code === 'Space') {
        if (stateRef.current === 'IDLE' || stateRef.current === 'GAME_OVER') startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [grid, score]);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    if (stateRef.current === 'IDLE' || stateRef.current === 'GAME_OVER') {
      startGame();
      return;
    }
    if (Math.abs(dx) > 15 || Math.abs(dy) > 15) {
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) move('RIGHT');
        else move('LEFT');
      } else {
        if (dy > 0) move('DOWN');
        else move('UP');
      }
    }
  };

  const getTileClasses = (val) => {
    if (val === 0) return 'bg-[#17171E] text-transparent';
    if (val === 2) return 'bg-[#252530] text-white';
    if (val === 4) return 'bg-[#333342] text-white';
    if (val === 8) return 'bg-[#2B3A4A] text-blue-400';
    if (val === 16) return 'bg-[#1E3A5F] text-blue-300';
    if (val === 32) return 'bg-[#134E4A] text-teal-300';
    if (val === 64) return 'bg-[#065F46] text-emerald-300';
    if (val === 128) return 'bg-[#047857] text-emerald-200';
    if (val === 256) return 'bg-[#78350F] text-amber-200';
    if (val === 512) return 'bg-[#92400E] text-amber-300';
    if (val === 1024) return 'bg-[#B45309] text-white';
    if (val === 2048) return 'bg-[#D97706] text-black font-black';
    return 'bg-rose-700 text-white';
  };

  const getTileLabel = (val) => {
    if (val === 0) return '';
    if (val >= 10000000) return `${currency}1Cr`;
    if (val >= 100000) return `${currency}1L`;
    if (val >= 1000) return `${currency}${Math.round(val / 1000)}K`;
    return `${currency}${val}`;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        if (gameState === 'IDLE' || gameState === 'GAME_OVER') startGame();
      }}
      className="relative w-full h-full bg-[#0F0F13] border-2 border-[#202028] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center p-3 select-none"
    >
      <div className="w-full max-w-[320px] aspect-square bg-[#131318] rounded-2xl p-2.5 grid grid-cols-4 grid-rows-4 gap-2">
        {grid.map((row, rIdx) =>
          row.map((val, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              className={`rounded-xl flex items-center justify-center font-black text-xs transition-all ${getTileClasses(
                val
              )}`}
            >
              {getTileLabel(val)}
            </div>
          ))
        )}
      </div>

      {/* Overlays */}
      {gameState === 'IDLE' && (
        <div className="absolute inset-0 bg-[#09090C]/90 flex flex-col items-center justify-center p-6 text-center z-30 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#181822] border border-[#2D2D3C] flex items-center justify-center text-[#FFFFFF]">
            <Layers size={24} />
          </div>
          <h4 className="text-lg font-extrabold text-[#FFFFFF]">2048 Wealth</h4>
          <p className="text-xs text-[#A0A0AA] max-w-[220px]">
            Swipe in 4 directions to merge matching wealth tiles up to ₹1 Crore!
          </p>
          <button className="px-6 py-2.5 bg-[#FFFFFF] hover:bg-[#EAEAEA] text-[#090909] font-black text-xs rounded-full flex items-center space-x-1.5 shadow-lg active:scale-95 cursor-pointer mt-2">
            <Play size={14} fill="#090909" />
            <span>PLAY 2048</span>
          </button>
        </div>
      )}

      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 bg-[#09090C]/90 flex flex-col items-center justify-center p-6 text-center z-30 space-y-3">
          <h4 className="text-xl font-black text-[#FF6B6B]">NO MORE MOVES</h4>
          <p className="text-xs text-[#D6D6D6]">
            Net Wealth Score: <strong className="text-[#FFFFFF]">{currency}{score}</strong>
          </p>
          <button className="px-6 py-2.5 bg-[#FFFFFF] hover:bg-[#EAEAEA] text-[#090909] font-black text-xs rounded-full flex items-center space-x-1.5 shadow-lg active:scale-95 cursor-pointer mt-2">
            <RotateCcw size={14} strokeWidth={2.5} />
            <span>PLAY AGAIN</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. MARKET RUNNER (FLAPPY COIN) VIEW
// ==========================================
function MarketRunnerGameView({ currency = '₹', onUpdateScore, onGameOver, onGameStart, isPaused }) {
  const [coinY, setCoinY] = useState(50); // percentage 0-100%
  const [candlesticks, setCandlesticks] = useState([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('IDLE');

  const coinYRef = useRef(50);
  coinYRef.current = coinY;
  const velRef = useRef(0);
  const scoreRef = useRef(0);
  const stateRef = useRef('IDLE');

  const startGame = () => {
    setCoinY(50);
    coinYRef.current = 50;
    velRef.current = -1.5;
    setCandlesticks([]);
    setScore(0);
    scoreRef.current = 0;
    setGameState('PLAYING');
    stateRef.current = 'PLAYING';
    onUpdateScore(0);
    onGameStart();
  };

  const jump = () => {
    if (stateRef.current === 'IDLE' || stateRef.current === 'GAME_OVER') {
      startGame();
      return;
    }
    velRef.current = -2.2;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Physics loop
  useEffect(() => {
    if (gameState !== 'PLAYING' || isPaused) return;

    let frameCount = 0;
    const interval = setInterval(() => {
      frameCount++;

      // Gravity
      velRef.current += 0.12;
      const nextY = coinYRef.current + velRef.current;
      coinYRef.current = nextY;
      setCoinY(nextY);

      // Floor & ceiling crash
      if (nextY <= 0 || nextY >= 95) {
        setGameState('GAME_OVER');
        stateRef.current = 'GAME_OVER';
        onGameOver(scoreRef.current);
        return;
      }

      // Spawner
      if (frameCount % 60 === 0) {
        const topH = Math.random() * 40 + 15; // 15% to 55%
        const gap = 34; // 34% gap
        const bottomH = 100 - topH - gap;
        setCandlesticks((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: 105,
            topHeight: topH,
            bottomHeight: bottomH,
            passed: false,
          },
        ]);
      }

      // Move Candlesticks
      setCandlesticks((prev) => {
        const nextSticks = [];
        const coinX = 18; // 18% position

        for (const stick of prev) {
          const nextX = stick.x - 1.2;

          // Collision check
          if (nextX <= coinX + 6 && nextX + 8 >= coinX) {
            if (nextY < stick.topHeight || nextY + 5 > 100 - stick.bottomHeight) {
              setGameState('GAME_OVER');
              stateRef.current = 'GAME_OVER';
              onGameOver(scoreRef.current);
              return [];
            }
          }

          let passed = stick.passed;
          if (!passed && nextX + 8 < coinX) {
            passed = true;
            scoreRef.current += 100;
            setScore(scoreRef.current);
            onUpdateScore(scoreRef.current);
          }

          if (nextX > -15) {
            nextSticks.push({ ...stick, x: nextX, passed });
          }
        }
        return nextSticks;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [gameState, isPaused]);

  return (
    <div
      onClick={jump}
      className="relative w-full h-full bg-[#090E14] border-2 border-[#1E2C3D] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center select-none"
    >
      {/* Candlestick Obstacles */}
      {candlesticks.map((stick) => (
        <React.Fragment key={stick.id}>
          {/* Top Bear Stick */}
          <div
            className="absolute bg-red-500 border border-red-600 rounded-b-md"
            style={{
              left: `${stick.x}%`,
              top: 0,
              width: '28px',
              height: `${stick.topHeight}%`,
            }}
          />
          {/* Bottom Bull Stick */}
          <div
            className="absolute bg-emerald-500 border border-emerald-600 rounded-t-md"
            style={{
              left: `${stick.x}%`,
              bottom: 0,
              width: '28px',
              height: `${stick.bottomHeight}%`,
            }}
          />
        </React.Fragment>
      ))}

      {/* Player Coin */}
      <div
        className="absolute w-7 h-7 rounded-full bg-[#F59E0B] flex items-center justify-center font-black text-black text-xs shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
        style={{ left: '18%', top: `${coinY}%` }}
      >
        {currency}
      </div>

      {/* Overlays */}
      {gameState === 'IDLE' && (
        <div className="absolute inset-0 bg-[#09090C]/90 flex flex-col items-center justify-center p-6 text-center z-30 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#181822] border border-[#2D2D3C] flex items-center justify-center text-[#FFFFFF]">
            <TrendingUp size={24} />
          </div>
          <h4 className="text-lg font-extrabold text-[#FFFFFF]">Market Runner</h4>
          <p className="text-xs text-[#A0A0AA] max-w-[220px]">
            Click, tap, or press Space to jump through candlestick dips!
          </p>
          <button className="px-6 py-2.5 bg-[#FFFFFF] hover:bg-[#EAEAEA] text-[#090909] font-black text-xs rounded-full flex items-center space-x-1.5 shadow-lg active:scale-95 cursor-pointer mt-2">
            <Play size={14} fill="#090909" />
            <span>START JUMPING</span>
          </button>
        </div>
      )}

      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 bg-[#09090C]/90 flex flex-col items-center justify-center p-6 text-center z-30 space-y-3">
          <h4 className="text-xl font-black text-[#FF6B6B]">MARKET CRASH</h4>
          <p className="text-xs text-[#D6D6D6]">
            Distance Profit: <strong className="text-[#FFFFFF]">{currency}{score}</strong>
          </p>
          <button className="px-6 py-2.5 bg-[#FFFFFF] hover:bg-[#EAEAEA] text-[#090909] font-black text-xs rounded-full flex items-center space-x-1.5 shadow-lg active:scale-95 cursor-pointer mt-2">
            <RotateCcw size={14} strokeWidth={2.5} />
            <span>TRY AGAIN</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MAIN ARCADE VAULT MODAL (4-in-1)
// ==========================================
export default function ArcadeVaultModal({ isOpen, onClose, currency = '₹' }) {
  const [activeGame, setActiveGame] = useState('snake');
  const [liveScore, setLiveScore] = useState(0);
  const [highScores, setHighScores] = useState(() => {
    try {
      return {
        snake: parseInt(localStorage.getItem('@balance_snake_high_score') || '0', 10) || 0,
        catch: parseInt(localStorage.getItem('@balance_catch_high_score') || '0', 10) || 0,
        '2048': parseInt(localStorage.getItem('@balance_2048_high_score') || '0', 10) || 0,
        runner: parseInt(localStorage.getItem('@balance_runner_high_score') || '0', 10) || 0,
      };
    } catch (e) {
      return { snake: 0, catch: 0, '2048': 0, runner: 0 };
    }
  });
  const [isPaused, setIsPaused] = useState(false);

  const handleUpdateScore = (s) => {
    setLiveScore(s);
    if (s > (highScores[activeGame] || 0)) {
      setHighScores((prev) => {
        const updated = { ...prev, [activeGame]: s };
        try {
          localStorage.setItem(`@balance_${activeGame}_high_score`, String(s));
        } catch (e) {}
        return updated;
      });
    }
  };

  const handleGameOver = (finalScore) => {
    if (finalScore > (highScores[activeGame] || 0)) {
      setHighScores((prev) => {
        const updated = { ...prev, [activeGame]: finalScore };
        try {
          localStorage.setItem(`@balance_${activeGame}_high_score`, String(finalScore));
        } catch (e) {}
        return updated;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/90 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-lg h-[92vh] max-h-[850px] bg-[#090909] border border-[#202028] rounded-3xl p-3 md:p-4 text-[#FFFFFF] shadow-2xl flex flex-col justify-between"
        >
          {/* Top Header Floating HUD */}
          <div className="flex items-center justify-between pb-2 shrink-0">
            {/* Title */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#18181E] border border-[#2A2A34] flex items-center justify-center text-[#FFFFFF]">
                <Gamepad2 size={16} />
              </div>
              <h3 className="text-sm font-extrabold text-[#FFFFFF] tracking-tight">ARCADE VAULT</h3>
            </div>

            {/* Score Badges */}
            <div className="flex items-center space-x-2">
              <div className="bg-[#131316] border border-[#24242C] rounded-full px-3 py-1 flex items-center space-x-1.5">
                <span className="text-[10px] font-bold text-[#8E8E96]">SCORE</span>
                <span className="text-xs font-black text-[#FFFFFF] font-mono">
                  {activeGame === 'snake' ? currency + liveScore * 10 : currency + liveScore}
                </span>
              </div>

              <div className="bg-[#131316] border border-[#24242C] rounded-full px-3 py-1 flex items-center space-x-1 text-[#F59E0B]">
                <Trophy size={11} />
                <span className="text-xs font-black font-mono">
                  {activeGame === 'snake' ? currency + (highScores.snake || 0) * 10 : currency + (highScores[activeGame] || 0)}
                </span>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#18181E] hover:bg-[#24242A] border border-[#282832] flex items-center justify-center text-[#A0A0A8] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Game Switcher Tabs */}
          <div className="flex bg-[#131317] rounded-xl p-1 gap-1 mb-2 border border-[#22222A] shrink-0">
            {ARCADE_GAMES.map((g) => {
              const isSel = activeGame === g.id;
              const IconComp = g.icon;
              return (
                <button
                  key={g.id}
                  onClick={() => {
                    setActiveGame(g.id);
                    setLiveScore(0);
                    setIsPaused(false);
                  }}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSel ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <IconComp size={13} />
                  <span>{g.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Mini-Game View */}
          <div className="relative flex-1 w-full overflow-hidden">
            {activeGame === 'snake' && (
              <SnakeGameView
                currency={currency}
                onUpdateScore={handleUpdateScore}
                onGameOver={handleGameOver}
                onGameStart={() => setIsPaused(false)}
                isPaused={isPaused}
              />
            )}

            {activeGame === 'catch' && (
              <CoinCatchGameView
                currency={currency}
                onUpdateScore={handleUpdateScore}
                onGameOver={handleGameOver}
                onGameStart={() => setIsPaused(false)}
                isPaused={isPaused}
              />
            )}

            {activeGame === '2048' && (
              <Wealth2048GameView
                currency={currency}
                onUpdateScore={handleUpdateScore}
                onGameOver={handleGameOver}
                onGameStart={() => setIsPaused(false)}
              />
            )}

            {activeGame === 'runner' && (
              <MarketRunnerGameView
                currency={currency}
                onUpdateScore={handleUpdateScore}
                onGameOver={handleGameOver}
                onGameStart={() => setIsPaused(false)}
                isPaused={isPaused}
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
