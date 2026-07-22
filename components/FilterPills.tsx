"use client";

// A labeled group of single-select filter buttons.
// The `variant` gives each group its own visual identity per the spec:
//   purple -> rounded pill   (metric)
//   teal   -> square corners (period)
//   amber  -> rounded, flags (country)

type Variant = "purple" | "teal" | "amber";

interface Option {
  value: string;
  label: string;
}

interface FilterPillsProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  variant: Variant;
}

// Shape differs per variant; pill = full radius, period = square, amber = md.
const shapeClass: Record<Variant, string> = {
  purple: "rounded-full",
  teal: "rounded-none",
  amber: "rounded-md",
};

// Selected vs. idle colors per variant.
const selectedClass: Record<Variant, string> = {
  purple: "bg-purple text-white border-purple",
  teal: "bg-teal text-bg border-teal",
  amber: "bg-amber text-bg border-amber",
};

const idleClass: Record<Variant, string> = {
  purple: "border-border text-muted hover:border-purple-soft",
  teal: "border-border text-muted hover:border-teal",
  amber: "border-border text-muted hover:border-amber",
};

export default function FilterPills({
  label,
  options,
  value,
  onChange,
  variant,
}: FilterPillsProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium tracking-wide text-muted uppercase">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`border px-3 py-1.5 text-sm transition-colors ${
                shapeClass[variant]
              } ${active ? selectedClass[variant] : idleClass[variant]}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
