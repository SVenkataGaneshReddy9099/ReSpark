import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { api } from "../services/api";
import type { Match, MatchStatus } from "../types";
import { ScoreBadge } from "../components/Badges";
import { LoadingState, ErrorState } from "../components/Feedback";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useToast } from "../hooks/useToast";

const PIPELINE_COLUMNS: { id: MatchStatus; title: string; desc: string; color: string }[] = [
  { id: "suggested", title: "Suggested", desc: "Engine recommendations", color: "border-spark-300 bg-spark-50/30" },
  { id: "interest_expressed", title: "Interest Expressed", desc: "Coordinating terms", color: "border-sky-300 bg-sky-50/30" },
  { id: "accepted", title: "Accepted & Reserved", desc: "Ready for handoff", color: "border-indigo-300 bg-indigo-50/30" },
  { id: "completed", title: "Completed", desc: "Reused & diverted", color: "border-emerald-300 bg-emerald-50/30" },
];

export default function MatchManagement() {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    onConfirm: () => {},
  });

  const loadAllMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listMatches();
      setMatches(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load match pipeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllMatches();
  }, []);

  const handleAction = async (matchId: number, nextStatus: MatchStatus) => {
    try {
      await api.matchAction(matchId, nextStatus);
      toast(`Match transitioned to ${nextStatus.replace("_", " ")}`, "success");
      await loadAllMatches();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update match.", "error");
    }
  };

  const promptTransition = (
    matchId: number,
    nextStatus: MatchStatus,
    title: string,
    message: string,
    confirmLabel: string,
    isDestructive = false
  ) => {
    setConfirmModal({
      open: true,
      title,
      message,
      confirmLabel,
      isDestructive,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, open: false }));
        await handleAction(matchId, nextStatus);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Exchange Pipeline Management
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Track and advance community matches through each step of the verified state machine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllMatches}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
          >
            <RefreshCw size={13} /> Refresh Board
          </button>
          <Link
            to="/matches"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <Sparkles size={14} /> Ranked Recommendations
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading pipeline state machine..." />
      ) : error ? (
        <ErrorState
          title="Could not load pipeline"
          message={error}
          onRetry={loadAllMatches}
        />
      ) : (
        /* Kanban Pipeline Columns */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PIPELINE_COLUMNS.map((col) => {
            const columnMatches = matches.filter((m) => m.status === col.id);

            return (
              <div
                key={col.id}
                className={`rounded-2xl border ${col.color} p-4 flex flex-col min-h-[500px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">{col.title}</h3>
                    <p className="text-[11px] text-stone-500">{col.desc}</p>
                  </div>
                  <span className="h-6 w-6 rounded-full bg-white text-stone-700 font-bold text-xs flex items-center justify-center shadow-sm">
                    {columnMatches.length}
                  </span>
                </div>

                {/* Match Cards in Column */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnMatches.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-stone-200 bg-white/50 p-6 text-center text-xs text-stone-400">
                      No matches in this stage
                    </div>
                  ) : (
                    columnMatches.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm space-y-2.5 transition hover:shadow-card"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <ScoreBadge score={m.score} />
                          <span className="text-[10px] text-stone-400">#{m.id}</span>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold text-brand-800 uppercase tracking-wider">Resource</p>
                          <p className="text-xs font-bold text-stone-900 line-clamp-1">{m.resource?.title || `Item #${m.resource_id}`}</p>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Fulfilling Need</p>
                          <p className="text-xs font-bold text-stone-900 line-clamp-1">{m.need?.title || `Need #${m.need_id}`}</p>
                        </div>

                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                          <span>Qty: {m.proposed_quantity}</span>
                          <span className="truncate max-w-28">{m.resource?.location}</span>
                        </div>

                        {/* Quick action buttons per column */}
                        <div className="pt-2 border-t border-stone-100 flex gap-1.5">
                          {col.id === "suggested" && (
                            <button
                              onClick={() => handleAction(m.id, "interest_expressed")}
                              className="w-full rounded-lg bg-sky-50 text-sky-800 border border-sky-200 py-1 text-xs font-semibold hover:bg-sky-100 text-center"
                            >
                              Express Interest &rarr;
                            </button>
                          )}

                          {col.id === "interest_expressed" && (
                            <button
                              onClick={() =>
                                promptTransition(
                                  m.id,
                                  "accepted",
                                  "Accept & Reserve",
                                  "Accepting this match reserves the resource from inventory.",
                                  "Accept"
                                )
                              }
                              className="w-full rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 py-1 text-xs font-semibold hover:bg-indigo-100 text-center"
                            >
                              Accept & Reserve &rarr;
                            </button>
                          )}

                          {col.id === "accepted" && (
                            <button
                              onClick={() =>
                                promptTransition(
                                  m.id,
                                  "completed",
                                  "Mark Completed",
                                  "Confirm resource handoff was completed and permanently log impact in database.",
                                  "Confirm Handoff"
                                )
                              }
                              className="w-full rounded-lg bg-emerald-600 text-white py-1 text-xs font-semibold hover:bg-emerald-700 text-center shadow-sm"
                            >
                              Mark Completed &rarr;
                            </button>
                          )}

                          {col.id === "completed" && (
                            <span className="w-full text-center text-[11px] font-semibold text-emerald-700 py-1">
                              ✓ Verified Handoff
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
