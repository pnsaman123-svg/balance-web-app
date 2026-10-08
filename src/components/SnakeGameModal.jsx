import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Trophy,
  X,
  Play,
  Pause,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const GRID_SIZE = 14;

export default function SnakeGameModal({ isOpen, onClose, currency = '₹' }) {
  const [snake, setSnake] = useState([
    { x: 7, y: 7 },
    { x: 7, y: 8 },
    { x: 7, y: 9 },
  ]);
  const [direction, setDirection] = useState('UP');
  const nextDirRef = useRef('UP');
  const [food, setFood] = useState({ x: 7, y: 3 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('@balance_snake_high_score') || '0', 10) || 0;
    } catch (e) {
      return 0;
    }
  });
  const [gameState, setGameState] = useState('IDLE'); // 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'
  const [speed, setSpeed] = useState(130);

  const getRandomFood = (currentSnake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const collides = currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y);
      if (!collides) break;
    }
    return newFood;
  };

  const startGame = () => {
    const init = [
      { x: 7, y: 7 },
      { x: 7, y: 8 },
      { x: 7, y: 9 },
    ];
    setSnake(init);
    setDirection('UP');
    nextDirRef.current = 'UP';
    setFood(getRandomFood(init));
    setScore(0);
    setSpeed(130);
    setGameState('PLAYING');
  };

  const changeDirection = (dir) => {
    if (gameState !== 'PLAYING') return;
    const current = nextDirRef.current;
    if (dir === 'UP' && current !== 'DOWN') nextDirRef.current = 'UP';
    if (dir === 'DOWN' && current !== 'UP') nextDirRef.current = 'DOWN';
    if (dir === 'LEFT' && current !== 'RIGHT') nextDirRef.current = 'LEFT';
    if (dir === 'RIGHT' && current !== 'LEFT') nextDirRef.current = 'RIGHT';
  };

  // Keyboard Arrow Listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        changeDirection('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        changeDirection('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        changeDirection('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        changeDirection('RIGHT');
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'PLAYING') setGameState('PAUSED');
        else if (gameState === 'PAUSED') setGameState('PLAYING');
        else if (gameState === 'IDLE' || gameState === 'GAME_OVER') startGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, gameState]);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const timer = setInterval(() => {
      const dir = nextDirRef.current;
      setDirection(dir);

      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };
        if (dir === 'UP') head.y -= 1;
        if (dir === 'DOWN') head.y += 1;
        if (dir === 'LEFT') head.x -= 1;
        if (dir === 'RIGHT') head.x += 1;

        // Collision: Wall
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameState('GAME_OVER');
          return prevSnake;
        }

        // Collision: Self
        if (prevSnake.some((seg) => seg.x === head.x && seg.y === head.y)) {
          setGameState('GAME_OVER');
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Collision: Food
        if (head.x === food.x && head.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          if (newScore > highScore) {
            setHighScore(newScore);
            try {
              localStorage.setItem('@balance_snake_high_score', String(newScore));
            } catch (e) {}
          }
          setFood(getRandomFood(newSnake));
          if (newScore % 40 === 0 && speed > 70) {
            setSpeed((s) => Math.max(70, s - 8));
          }
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [gameState, food, score, speed, highScore]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-sm bg-[#0C0C0F] border border-[#24242C] rounded-3xl p-5 text-[#FFFFFF] shadow-2xl flex flex-col justify-between space-y-4"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1E1E24] border border-[#2A2A34] flex items-center justify-center text-[#FFFFFF]">
                <Gamepad2 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#FFFFFF] tracking-tight">BALANCE SNAKE</h3>
                <p className="text-[10px] font-medium text-[#7E7E86]">Secret Easter Egg Edition</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#18181C] hover:bg-[#24242A] border border-[#282830] flex items-center justify-center text-[#A0A0A8] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scoreboard Badges */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#131316] border border-[#222228] rounded-2xl px-3.5 py-2 flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-[#8E8E96]">SCORE</span>
              <span className="text-base font-black text-[#FFFFFF] font-mono">{currency}{score * 100}</span>
            </div>

            <div className="bg-[#131316] border border-[#222228] rounded-2xl px-3.5 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-1 text-[#F59E0B]">
                <Trophy size={13} />
                <span className="text-[10.5px] font-bold text-[#8E8E96]">BEST</span>
              </div>
              <span className="text-base font-black text-[#F59E0B] font-mono">{currency}{highScore * 100}</span>
            </div>
          </div>

          {/* Game Board Container */}
          <div className="relative w-full aspect-square bg-[#121216] border-2 border-[#24242C] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center select-none">
            {/* Grid cell rendering */}
            <div
              className="w-full h-full relative"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
              }}
            >
              {/* Food */}
              <div
                className="absolute bg-[#F59E0B] rounded-full flex items-center justify-center font-bold text-[10px] text-black shadow-lg animate-pulse"
                style={{
                  left: `${(food.x / GRID_SIZE) * 100}%`,
                  top: `${(food.y / GRID_SIZE) * 100}%`,
                  width: `${(1 / GRID_SIZE) * 100}%`,
                  height: `${(1 / GRID_SIZE) * 100}%`,
                  padding: '2px',
                }}
              >
                <span className="leading-none">{currency}</span>
              </div>

              {/* Snake Segments */}
              {snake.map((seg, idx) => {
                const isHead = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`absolute transition-all ${
                      isHead
                        ? 'bg-[#FFFFFF] rounded-md shadow-md z-10'
                        : 'bg-[#9E9EA8] rounded-sm'
                    }`}
                    style={{
                      left: `${(seg.x / GRID_SIZE) * 100}%`,
                      top: `${(seg.y / GRID_SIZE) * 100}%`,
                      width: `${(1 / GRID_SIZE) * 100}%`,
                      height: `${(1 / GRID_SIZE) * 100}%`,
                      opacity: Math.max(0.4, 1 - idx * 0.03),
                    }}
                  />
                );
              })}
            </div>

            {/* Overlay State Modals */}
            {gameState !== 'PLAYING' && (
              <div className="absolute inset-0 bg-[#0A0A0E]/90 flex flex-col items-center justify-center p-6 text-center z-20 space-y-3">
                {gameState === 'IDLE' && (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-[#1F1F26] border border-[#32323E] flex items-center justify-center text-[#FFFFFF]">
                      <Gamepad2 size={24} />
                    </div>
                    <h4 className="text-base font-extrabold text-[#FFFFFF]">Ready to Grow?</h4>
                    <p className="text-xs text-[#A0A0AA] max-w-[200px] leading-relaxed">
                      Use Arrow keys or touch D-Pad to collect balance tokens!
                    </p>
                    <button
                      onClick={startGame}
                      className="px-6 py-2.5 bg-[#FFFFFF] hover:bg-[#EAEAEA] text-[#090909] font-black text-xs rounded-full flex items-center space-x-1.5 transition-all shadow-lg active:scale-95 cursor-pointer"
                    >
                      <Play size={14} fill="#090909" />
                      <span>START GAME</span>
                    </button>
                  </>
                )}

                {gameState === 'PAUSED' && (
                  <>
                    <h4 className="text-lg font-black text-[#FFFFFF]">PAUSED</h4>
                    <button
                      onClick={() => setGameState('PLAYING')}
                      className="px-6 py-2.5 bg-[#FFFFFF] text-[#090909] font-bold text-xs rounded-full flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                    >
                      <Play size={14} fill="#090909" />
                      <span>RESUME</span>
                    </button>
                  </>
                )}

                {gameState === 'GAME_OVER' && (
                  <>
                    <h4 className="text-xl font-black text-[#FF7070] tracking-tight">GAME OVER</h4>
                    <p className="text-xs text-[#D6D6D6] font-medium">
                      Final Balance: <strong className="text-[#FFFFFF]">{currency}{score * 100}</strong>
                    </p>
                    {score > 0 && score >= highScore && (
                      <span className="px-3 py-1 bg-amber-500/20 border border-amber-500 text-amber-400 text-[10px] font-black rounded-full">
                        ★ NEW HIGH SCORE!
                      </span>
                    )}
                    <button
                      onClick={startGame}
                      className="px-6 py-2.5 bg-[#FFFFFF] hover:bg-[#EAEAEA] text-[#090909] font-black text-xs rounded-full flex items-center space-x-1.5 transition-all shadow-lg active:scale-95 cursor-pointer mt-1"
                    >
                      <RotateCcw size={14} strokeWidth={2.5} />
                      <span>PLAY AGAIN</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Touch D-Pad */}
          <div className="flex flex-col items-center justify-center pt-1">
            <button
              onClick={() => changeDirection('UP')}
              className="w-14 h-11 rounded-xl bg-[#18181D] hover:bg-[#222228] border border-[#262630] flex items-center justify-center text-[#FFFFFF] active:scale-95 cursor-pointer mb-1 shadow-sm"
            >
              <ChevronUp size={22} strokeWidth={2.6} />
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => changeDirection('LEFT')}
                className="w-14 h-11 rounded-xl bg-[#18181D] hover:bg-[#222228] border border-[#262630] flex items-center justify-center text-[#FFFFFF] active:scale-95 cursor-pointer shadow-sm"
              >
                <ChevronLeft size={22} strokeWidth={2.6} />
              </button>

              <button
                onClick={() => {
                  if (gameState === 'PLAYING') setGameState('PAUSED');
                  else if (gameState === 'PAUSED') setGameState('PLAYING');
                  else if (gameState === 'IDLE' || gameState === 'GAME_OVER') startGame();
                }}
                className="w-14 h-11 rounded-xl bg-[#24242C] hover:bg-[#2D2D36] border border-[#343440] flex items-center justify-center text-[#FFFFFF] active:scale-95 cursor-pointer shadow-sm"
              >
                {gameState === 'PLAYING' ? <Pause size={17} /> : <Play size={17} fill="#FFFFFF" />}
              </button>

              <button
                onClick={() => changeDirection('RIGHT')}
                className="w-14 h-11 rounded-xl bg-[#18181D] hover:bg-[#222228] border border-[#262630] flex items-center justify-center text-[#FFFFFF] active:scale-95 cursor-pointer shadow-sm"
              >
                <ChevronRight size={22} strokeWidth={2.6} />
              </button>
            </div>

            <button
              onClick={() => changeDirection('DOWN')}
              className="w-14 h-11 rounded-xl bg-[#18181D] hover:bg-[#222228] border border-[#262630] flex items-center justify-center text-[#FFFFFF] active:scale-95 cursor-pointer mt-1 shadow-sm"
            >
              <ChevronDown size={22} strokeWidth={2.6} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
