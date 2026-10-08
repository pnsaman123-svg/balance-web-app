import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Trophy,
  X,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

const GRID_COLS = 16;
const GRID_ROWS = 22;

export default function SnakeGameModal({ isOpen, onClose, currency = '₹' }) {
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
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('@balance_snake_high_score') || '0', 10) || 0;
    } catch (e) {
      return 0;
    }
  });
  const [gameState, setGameState] = useState('IDLE'); // 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'
  const [speed, setSpeed] = useState(125);

  const touchStartRef = useRef({ x: 0, y: 0 });

  const getRandomFood = (currentSnake) => {
    let newFood;
    let attempts = 0;
    while (attempts < 200) {
      newFood = {
        x: Math.floor(Math.random() * GRID_COLS),
        y: Math.floor(Math.random() * GRID_ROWS),
      };
      const collides = currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y);
      if (!collides) return newFood;
      attempts++;
    }
    return { x: 2, y: 2 };
  };

  const startGame = () => {
    const init = [
      { x: startX, y: startY },
      { x: startX, y: startY + 1 },
      { x: startX, y: startY + 2 },
    ];
    setSnake(init);
    setDirection('UP');
    nextDirRef.current = 'UP';
    setFood(getRandomFood(init));
    setScore(0);
    setSpeed(125);
    setGameState('PLAYING');
  };

  const changeDirection = (dir) => {
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

  // Touch Swipe Handlers (Seamless & Continuous)
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const THRESHOLD = 16;

    if (Math.abs(dx) > THRESHOLD || Math.abs(dy) > THRESHOLD) {
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) changeDirection('RIGHT');
        else changeDirection('LEFT');
      } else {
        if (dy > 0) changeDirection('DOWN');
        else changeDirection('UP');
      }
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

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
        if (head.x < 0 || head.x >= GRID_COLS || head.y < 0 || head.y >= GRID_ROWS) {
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
          if (newScore % 40 === 0 && speed > 65) {
            setSpeed((s) => Math.max(65, s - 7));
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
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/90 backdrop-blur-md select-none touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
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
              <h3 className="text-sm font-extrabold text-[#FFFFFF] tracking-tight">BALANCE SNAKE</h3>
            </div>

            {/* Score Badges */}
            <div className="flex items-center space-x-2">
              <div className="bg-[#131316] border border-[#24242C] rounded-full px-3 py-1 flex items-center space-x-1.5">
                <span className="text-[10px] font-bold text-[#8E8E96]">SCORE</span>
                <span className="text-xs font-black text-[#FFFFFF] font-mono">{currency}{score * 100}</span>
              </div>

              <div className="bg-[#131316] border border-[#24242C] rounded-full px-3 py-1 flex items-center space-x-1 text-[#F59E0B]">
                <Trophy size={11} />
                <span className="text-xs font-black font-mono">{currency}{highScore * 100}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1.5">
              {gameState === 'PLAYING' && (
                <button
                  onClick={() => setGameState('PAUSED')}
                  className="w-8 h-8 rounded-full bg-[#18181E] hover:bg-[#24242A] border border-[#282832] flex items-center justify-center text-[#FFFFFF] cursor-pointer"
                >
                  <Pause size={14} />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#18181E] hover:bg-[#24242A] border border-[#282832] flex items-center justify-center text-[#A0A0A8] hover:text-[#FFFFFF] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Full Board Area */}
          <div className="relative flex-1 w-full bg-[#0E0E13] border-2 border-[#202028] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
            {/* Grid Pattern */}
            <div
              className="w-full h-full relative"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
              }}
            >
              {/* Food Coin */}
              <div
                className="absolute bg-[#F59E0B] rounded-full flex items-center justify-center font-black text-black shadow-lg animate-pulse z-10"
                style={{
                  left: `${(food.x / GRID_COLS) * 100}%`,
                  top: `${(food.y / GRID_ROWS) * 100}%`,
                  width: `${(1 / GRID_COLS) * 100}%`,
                  height: `${(1 / GRID_ROWS) * 100}%`,
                  padding: '1px',
                  fontSize: '11px',
                }}
              >
                <span className="leading-none">{currency}</span>
              </div>

              {/* Snake Body Segments */}
              {snake.map((seg, idx) => {
                const isHead = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`absolute transition-all ${
                      isHead
                        ? 'bg-[#FFFFFF] rounded-md shadow-md z-20'
                        : 'bg-[#9E9EA8] rounded-sm'
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

            {/* In-Game Subtle Swipe Hint */}
            {gameState === 'PLAYING' && score === 0 && (
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center pointer-events-none">
                <span className="text-[11px] font-semibold text-white/30 tracking-widest uppercase">
                  Swipe anywhere to turn
                </span>
              </div>
            )}

            {/* Overlay Modals */}
            {gameState !== 'PLAYING' && (
              <div className="absolute inset-0 bg-[#09090C]/90 flex flex-col items-center justify-center p-6 text-center z-30 space-y-3">
                {gameState === 'IDLE' && (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-[#181822] border border-[#2D2D3C] flex items-center justify-center text-[#FFFFFF]">
                      <Gamepad2 size={28} />
                    </div>
                    <h4 className="text-xl font-extrabold text-[#FFFFFF]">Balance Snake</h4>
                    <p className="text-xs text-[#A0A0AA] max-w-[240px] leading-relaxed">
                      Swipe anywhere or use Arrow keys to guide your snake and grow your balance!
                    </p>
                    <button
                      onClick={startGame}
                      className="px-8 py-3 bg-[#FFFFFF] hover:bg-[#EAEAEA] text-[#090909] font-black text-xs rounded-full flex items-center space-x-2 transition-all shadow-lg active:scale-95 cursor-pointer mt-2"
                    >
                      <Play size={15} fill="#090909" />
                      <span>SWIPE TO START</span>
                    </button>
                  </>
                )}

                {gameState === 'PAUSED' && (
                  <>
                    <h4 className="text-xl font-black text-[#FFFFFF]">PAUSED</h4>
                    <p className="text-xs text-[#8E8E98]">Swipe or click below to resume</p>
                    <button
                      onClick={() => setGameState('PLAYING')}
                      className="px-7 py-2.5 bg-[#FFFFFF] text-[#090909] font-bold text-xs rounded-full flex items-center space-x-2 active:scale-95 cursor-pointer mt-1"
                    >
                      <Play size={14} fill="#090909" />
                      <span>RESUME</span>
                    </button>
                  </>
                )}

                {gameState === 'GAME_OVER' && (
                  <>
                    <h4 className="text-2xl font-black text-[#FF6B6B] tracking-tight">GAME OVER</h4>
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
                      className="px-8 py-3 bg-[#FFFFFF] hover:bg-[#EAEAEA] text-[#090909] font-black text-xs rounded-full flex items-center space-x-2 transition-all shadow-lg active:scale-95 cursor-pointer mt-2"
                    >
                      <RotateCcw size={15} strokeWidth={2.5} />
                      <span>PLAY AGAIN</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
