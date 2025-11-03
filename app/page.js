import TicTacToe from "./component/TicTacToe";

export default function Page({ searchParams }) {
  const sessionId = searchParams?.session || "default";

  // robust parse so ?host=1 OR ?host=true both work
  const rawHost = searchParams?.host;
  const isHost =
    rawHost === "1" || rawHost === 1 || rawHost === "true" || rawHost === true;

  return <TicTacToe sessionId={sessionId} isHost={isHost} />;
}
