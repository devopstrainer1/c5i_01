import Board from "@/components/Board";

export default function Home() {
  return (
    <main className="app">
      <h1>Issues</h1>
      <p className="subtitle">Drag cards between stages or use the dropdown to move them.</p>
      <Board />
    </main>
  );
}
