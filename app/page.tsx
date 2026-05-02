import SnakeGame from "@/components/snake-game";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-mono text-foreground mb-2">
          <span className="text-primary">SNAKE</span> GAME
        </h1>
        <p className="text-muted-foreground">Eat food. Grow longer. {"Don't"} crash.</p>
      </header>
      
      <SnakeGame />
      
      <footer className="mt-8 text-muted-foreground text-xs font-mono">
        Classic Snake | Built with Next.js
      </footer>
    </main>
  );
}
