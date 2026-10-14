import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  icon: LucideIcon;
  label?: string;
  title?: string;
  value: string | number;
  hint?: string;
  subtitle?: string;
  tone?: "brand" | "amber" | "sky" | "stone" | "emerald" | "indigo" | "teal";
  color?: string;
}

const TONES: Record<string, string> = {
  brand: "bg-brand-600 text-white",
  emerald: "bg-emerald-600 text-white",
  amber: "bg-spark-500 text-white",
  sky: "bg-sky-600 text-white",
  indigo: "bg-indigo-600 text-white",
  teal: "bg-teal-600 text-white",
  stone: "bg-stone-700 text-white",
};

export function StatCard({
  icon: Icon,
  label,
  title,
  value,
  hint,
  subtitle,
  tone = "brand",
  color,
}: StatCardProps) {
  const displayLabel = label || title || "";
  const displayHint = hint || subtitle;
  const toneKey = (color || tone) as string;
  const badgeClass = TONES[toneKey] || TONES.brand;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-500">{displayLabel}</p>
        <span className={`rounded-xl p-2 ${badgeClass}`}>
          <Icon className="h-4.5 w-4.5" size={18} />
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900">{value}</p>
      {displayHint && <p className="mt-1 text-xs text-stone-400">{displayHint}</p>}
    </div>
  );
}
