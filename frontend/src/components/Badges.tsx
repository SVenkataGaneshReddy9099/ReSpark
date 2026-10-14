import {
  AVAILABILITY_LABELS,
  CATEGORY_LABELS,
  MATCH_STATUS_LABELS,
  NEED_STATUS_LABELS,
  RESOURCE_TYPE_LABELS,
  URGENCY_LABELS,
  type AvailabilityStatus,
  type Category,
  type MatchStatus,
  type NeedStatus,
  type ResourceType,
  type Urgency,
} from "../types/enums";

const CATEGORY_COLORS: Record<Category, string> = {
  textbooks: "bg-indigo-50 text-indigo-700 border-indigo-200",
  electronics: "bg-violet-50 text-violet-700 border-violet-200",
  furniture: "bg-orange-50 text-orange-700 border-orange-200",
  stationery: "bg-pink-50 text-pink-700 border-pink-200",
  skills: "bg-sky-50 text-sky-700 border-sky-200",
  volunteer: "bg-lime-50 text-lime-700 border-lime-200",
  other: "bg-stone-100 text-stone-700 border-stone-200",
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[category]}`}>
      {CATEGORY_LABELS[category]}
    </span>
  );
}

export function ResourceTypeBadge({ type }: { type: ResourceType }) {
  return <span className="inline-flex items-center rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-xs text-stone-600">{RESOURCE_TYPE_LABELS[type]}</span>;
}

const AVAILABILITY_COLORS: Record<AvailabilityStatus, string> = {
  available: "bg-emerald-100 text-emerald-800",
  reserved: "bg-amber-100 text-amber-800",
  completed: "bg-stone-200 text-stone-600",
  inactive: "bg-stone-200 text-stone-500",
};

export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${AVAILABILITY_COLORS[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {AVAILABILITY_LABELS[status]}
    </span>
  );
}

const NEED_STATUS_COLORS: Record<NeedStatus, string> = {
  open: "bg-emerald-100 text-emerald-800",
  in_progress: "bg-sky-100 text-sky-800",
  fulfilled: "bg-stone-200 text-stone-600",
  cancelled: "bg-stone-200 text-stone-500",
};

export function NeedStatusBadge({ status }: { status: NeedStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${NEED_STATUS_COLORS[status]}`}>
      {NEED_STATUS_LABELS[status]}
    </span>
  );
}

const MATCH_STATUS_COLORS: Record<MatchStatus, string> = {
  suggested: "bg-spark-100 text-spark-700",
  interest_expressed: "bg-sky-100 text-sky-800",
  accepted: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-stone-200 text-stone-600",
};

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${MATCH_STATUS_COLORS[status]}`}>
      {MATCH_STATUS_LABELS[status]}
    </span>
  );
}

const URGENCY_COLORS: Record<Urgency, string> = {
  low: "bg-stone-100 text-stone-600 border-stone-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  critical: "bg-red-100 text-red-800 border-red-300",
};

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${URGENCY_COLORS[urgency]}`}>
      {URGENCY_LABELS[urgency]}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : score >= 50 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-stone-600 bg-stone-50 border-stone-200";
  return (
    <span className={`inline-flex items-baseline gap-0.5 rounded-lg border px-2.5 py-1 text-sm font-bold ${color}`}>
      {score.toFixed(1)}
      <span className="text-[10px] font-medium opacity-70">/100</span>
    </span>
  );
}
