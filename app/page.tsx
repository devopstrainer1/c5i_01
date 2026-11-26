import Board from "@/components/Board";

export default function Home() {
  return (
    <main className="app">
      <h1>Issues</h1>
      <p className="subtitle">Drag a case between stages, or use its dropdown to move it along.</p>
      <Board />
    </main>
  );
}
