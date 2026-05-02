"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

function getRandomPosition(snake: Position[]): Position {
  let newPosition: Position;
  do {
    newPosition = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((segment) => segment.x === newPosition.x && segment.y === newPosition.y));
  return newPosition;
}

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const directionRef = useRef<Direction>(direction);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(getRandomPosition(initialSnake));
    setDirection("RIGHT");
    directionRef.current = "RIGHT";
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setGameStarted(true);
  }, []);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return;

    setSnake((currentSnake) => {
      const head = currentSnake[0];
      const currentDirection = directionRef.current;
      let newHead: Position;

      switch (currentDirection) {
        case "UP":
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case "DOWN":
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case "LEFT":
          newHead = { x: head.x - 1, y: head.y };
          break;
        case "RIGHT":
          newHead = { x: head.x + 1, y: head.y };
          break;
        default:
          newHead = head;
      }

      // Check wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        setHighScore((prev) => Math.max(prev, score));
        return currentSnake;
      }

      // Check self collision
      if (currentSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        setHighScore((prev) => Math.max(prev, score));
        return currentSnake;
      }

      const newSnake = [newHead, ...currentSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((prev) => prev + 10);
        setFood(getRandomPosition(newSnake));
        return newSnake;
      }

      // Remove tail if no food eaten
      newSnake.pop();
      return newSnake;
    });
  }, [gameOver, isPaused, gameStarted, food, score]);

  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      gameLoopRef.current = setInterval(moveSnake, INITIAL_SPEED);
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [moveSnake, gameStarted, gameOver, isPaused]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        if (gameOver) {
          resetGame();
        } else if (gameStarted) {
          setIsPaused((prev) => !prev);
        } else {
          resetGame();
        }
        return;
      }

      if (gameOver || isPaused || !gameStarted) return;

      const currentDir = directionRef.current;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (currentDir !== "DOWN") {
            setDirection("UP");
          }
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (currentDir !== "UP") {
            setDirection("DOWN");
          }
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (currentDir !== "RIGHT") {
            setDirection("LEFT");
          }
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (currentDir !== "LEFT") {
            setDirection("RIGHT");
          }
          break;
      }
    },
    [gameOver, isPaused, gameStarted, resetGame]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleDirectionButton = (newDirection: Direction) => {
    if (gameOver || isPaused || !gameStarted) return;
    
    const currentDir = directionRef.current;
    
    if (
      (newDirection === "UP" && currentDir !== "DOWN") ||
      (newDirection === "DOWN" && currentDir !== "UP") ||
      (newDirection === "LEFT" && currentDir !== "RIGHT") ||
      (newDirection === "RIGHT" && currentDir !== "LEFT")
    ) {
      setDirection(newDirection);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Score Display */}
      <div className="flex items-center gap-8 font-mono">
        <div className="flex flex-col items-center">
          <span className="text-muted-foreground text-sm uppercase tracking-wider">Score</span>
          <span className="text-3xl font-bold text-primary">{score}</span>
        </div>
        <div className="w-px h-12 bg-border" />
        <div className="flex flex-col items-center">
          <span className="text-muted-foreground text-sm uppercase tracking-wider">High Score</span>
          <span className="text-3xl font-bold text-foreground">{highScore}</span>
        </div>
      </div>

      {/* Game Board */}
      <div
        className="relative border-2 border-primary/50 rounded-lg overflow-hidden"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
          backgroundColor: "var(--card)",
        }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: GRID_SIZE }).map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute left-0 right-0 border-t border-primary/30"
              style={{ top: i * CELL_SIZE }}
            />
          ))}
          {Array.from({ length: GRID_SIZE }).map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute top-0 bottom-0 border-l border-primary/30"
              style={{ left: i * CELL_SIZE }}
            />
          ))}
        </div>

        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className="absolute rounded-sm transition-all duration-75"
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              margin: 1,
              backgroundColor: index === 0 ? "var(--primary)" : "var(--primary)",
              opacity: index === 0 ? 1 : 0.8 - index * 0.02,
              boxShadow: index === 0 ? "0 0 10px var(--primary)" : "none",
            }}
          />
        ))}

        {/* Food */}
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            margin: 1,
            backgroundColor: "var(--accent)",
            boxShadow: "0 0 15px var(--accent)",
          }}
        />

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold text-accent font-mono">GAME OVER</h2>
            <p className="text-muted-foreground">Final Score: {score}</p>
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-mono font-bold hover:bg-primary/80 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Start Screen */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold text-primary font-mono">SNAKE</h2>
            <p className="text-muted-foreground text-center px-4">
              Use arrow keys or WASD to move
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-mono font-bold hover:bg-primary/80 transition-colors"
            >
              Start Game
            </button>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold text-foreground font-mono">PAUSED</h2>
            <button
              onClick={() => setIsPaused(false)}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-mono font-bold hover:bg-primary/80 transition-colors"
            >
              Resume
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="flex flex-col items-center gap-2 md:hidden">
        <button
          onClick={() => handleDirectionButton("UP")}
          className="w-14 h-14 bg-card border border-border rounded-lg flex items-center justify-center text-2xl hover:bg-muted transition-colors active:bg-primary active:text-primary-foreground"
          aria-label="Move up"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleDirectionButton("LEFT")}
            className="w-14 h-14 bg-card border border-border rounded-lg flex items-center justify-center text-2xl hover:bg-muted transition-colors active:bg-primary active:text-primary-foreground"
            aria-label="Move left"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="w-14 h-14 bg-card border border-border rounded-lg flex items-center justify-center text-2xl hover:bg-muted transition-colors"
            aria-label={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
            )}
          </button>
          <button
            onClick={() => handleDirectionButton("RIGHT")}
            className="w-14 h-14 bg-card border border-border rounded-lg flex items-center justify-center text-2xl hover:bg-muted transition-colors active:bg-primary active:text-primary-foreground"
            aria-label="Move right"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => handleDirectionButton("DOWN")}
          className="w-14 h-14 bg-card border border-border rounded-lg flex items-center justify-center text-2xl hover:bg-muted transition-colors active:bg-primary active:text-primary-foreground"
          aria-label="Move down"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Instructions */}
      <div className="text-muted-foreground text-sm text-center font-mono">
        <p className="hidden md:block">Arrow Keys / WASD to move | Space to pause</p>
        <p className="md:hidden">Tap the arrows to move</p>
      </div>
    </div>
  );
}
