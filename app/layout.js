import "./globals.css";

export const metadata = {
  title: "TicTacToe 🍕 vs 🥤",
  description: "3 piece tic tac toe",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-100 antialiased">{children}</body>
    </html>
  );
}