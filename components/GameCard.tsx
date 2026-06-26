"use client";

// A single selectable game tile for Screen 1.

interface GameCardProps {
  name: string;
  slug: string;
  selected: boolean;
  onSelect: () => void;
}

export default function GameCard({
  name,
  slug,
  selected,
  onSelect,
}: GameCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-start gap-2 rounded-lg border bg-card p-5 text-left transition-colors ${
        selected
          ? "border-purple"
          : "border-border hover:border-purple-soft"
      }`}
    >
      <span className="text-lg font-semibold text-text">{name}</span>
      <span className="font-mono text-sm text-muted">{slug}</span>
    </button>
  );
}
