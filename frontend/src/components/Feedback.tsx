import type { ReactNode } from "react";
import { Inbox, Loader2, RefreshCw, ServerCrash, Sparkles } from "lucide-react";

export function Spinner({ label, message }: { label?: string; message?: string }) {
  const display = label || message;
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-stone-500">
      <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
      {display && <p className="text-sm">{display}</p>}
    </div>
  );
}

export const LoadingState = Spinner;

export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50/60 px-6 py-12 text-center">
      <ServerCrash className="h-9 w-9 text-red-400" />
      {title && <h3 className="font-semibold text-red-900 text-sm">{title}</h3>}
      <p className="max-w-md text-sm text-red-800">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  message,
  action,
}: {
  title: string;
  description?: string;
  message?: string;
  action?: ReactNode;
}) {
  const desc = description || message;
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-14 text-center">
      <Inbox className="h-9 w-9 text-stone-300" />
      <h3 className="mt-3 text-base font-semibold text-stone-800">{title}</h3>
      {desc && <p className="mt-1 max-w-md text-sm text-stone-500">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-stone-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function BootstrapBanner() {
  return (
    <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <Sparkles className="h-4 w-4 shrink-0 text-spark-600" />
      <p>
        <strong>Local demo:</strong> no authentication — you act as a demo community member. Pick who you are from the
        account menu in the header.
      </p>
    </div>
  );
}
