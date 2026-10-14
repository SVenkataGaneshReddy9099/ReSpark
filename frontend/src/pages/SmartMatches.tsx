import { useEffect, useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Box,
  MapPin,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ThumbsUp,
  Check,
  User,
} from "lucide-react";
import { api } from "../services/api";
import type { Match, MatchStatus } from "../types";
import { ScoreBadge, MatchStatusBadge, CategoryBadge, UrgencyBadge } from "../components/Badges";
import { LoadingState, ErrorState, EmptyState } from "../components/Feedback";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useToast } from "../hooks/useToast";
import { MATCH_STATUS_LABELS } from "../types/enums";

export default function SmartMatches() {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Expanded explanations
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Confirm dialog state
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

  const loadMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listMatches({
        status: statusFilter === "all" ? undefined : (statusFilter as MatchStatus),
      });
      setMatches(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load smart recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [statusFilter]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await api.generateMatches(30.0);
      toast(
        `AI Matching complete: evaluated ${result.total_candidates_evaluated} candidates, found ${result.top_matches.length} strong matches!`,
        "success"
      );
      await loadMatches();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to run matching engine.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleAction = async (matchId: number, nextStatus: MatchStatus, notes?: string) => {
    try {
      await api.matchAction(matchId, nextStatus, notes);
      toast(`Match updated to: ${(MATCH_STATUS_LABELS as Record<string, string>)[nextStatus] || nextStatus}`, "success");
      await loadMatches();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update match.", "error");
    }
  };

  const triggerActionWithConfirm = (
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
      {/* Title & Generate Trigger Banner */}
      <div className="rounded-2xl border border-brand-200/80 bg-gradient-to-r from-brand-900 to-teal-900 text-white p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-800/80 px-3 py-0.5 text-xs font-semibold text-spark-300">
            <Sparkles size={13} className="text-spark-400" /> Explainable Multi-Factor Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Smart Resource Recommendations
          </h1>
          <p className="text-sm text-brand-100/90 leading-relaxed">
            Our local matching engine analyzes TF-IDF semantic overlap, category harmony, quantity coverage,
            neighborhood proximity, and urgency scores to connect surplus with genuine need.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-xl bg-spark-500 px-5 py-3 text-sm font-bold text-stone-950 shadow-md transition hover:bg-spark-400 disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={16} className={generating ? "animate-spin" : ""} />
          {generating ? "Evaluating Candidates..." : "Refresh Recommendations"}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Matches" },
            { id: "suggested", label: "Suggested" },
            { id: "interest_expressed", label: "Interest Expressed" },
            { id: "accepted", label: "Accepted" },
            { id: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-stone-500">
          Showing <strong className="text-stone-800">{matches.length}</strong> ranked recommendation{matches.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Matches List */}
      {loading ? (
        <LoadingState message="Ranking candidates with AI matching engine..." />
      ) : error ? (
        <ErrorState
          title="Could not load recommendations"
          message={error}
          onRetry={loadMatches}
        />
      ) : matches.length === 0 ? (
        <EmptyState
          title="No recommendations for this filter"
          message="Click 'Refresh Recommendations' to run the matching engine against all open resources and needs."
          action={
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              <RefreshCw size={15} /> Run AI Matching Engine
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {matches.map((match) => {
            const isExpanded = expandedId === match.id;
            const res = match.resource;
            const nd = match.need;
            const breakdown = match.parsed_breakdown;

            return (
              <div
                key={match.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-card transition hover:border-brand-300 hover:shadow-card-hover"
              >
                {/* Match Header: Score, Status & Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <ScoreBadge score={match.score} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
                        {match.score >= 80 ? "High Compatibility Match" : match.score >= 60 ? "Good Match" : "Moderate Compatibility"}
                      </p>
                      <p className="text-xs text-stone-400">Pair #{match.id} · Proposed {match.proposed_quantity} unit(s)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MatchStatusBadge status={match.status} />
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : match.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
                    >
                      {isExpanded ? (
                        <>Hide Evidence <ChevronUp size={13} /></>
                      ) : (
                        <>Why they match <ChevronDown size={13} /></>
                      )}
                    </button>
                  </div>
                </div>

                {/* Side-by-side Resource vs Need */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Resource Offered */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                        Resource Offered
                      </span>
                      {res && <CategoryBadge category={res.category} />}
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm leading-snug">
                      {res ? res.title : `Resource #${match.resource_id}`}
                    </h3>
                    <p className="mt-1 text-xs text-stone-600 line-clamp-2">
                      {res?.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <Box size={13} className="text-emerald-700" />
                        Available: {res?.remaining_quantity} {res?.unit}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-emerald-700" />
                        {res?.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={13} className="text-emerald-700" />
                        {res?.provider?.display_name || "Community Member"}
                      </span>
                    </div>
                  </div>

                  {/* Right: Need Requested */}
                  <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                        Community Need
                      </span>
                      {nd && <UrgencyBadge urgency={nd.urgency} />}
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm leading-snug">
                      {nd ? nd.title : `Need #${match.need_id}`}
                    </h3>
                    <p className="mt-1 text-xs text-stone-600 line-clamp-2">
                      {nd?.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <Box size={13} className="text-amber-700" />
                        Requested: {nd?.quantity_requested} {nd?.unit}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-amber-700" />
                        {nd?.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={13} className="text-amber-700" />
                        {nd?.requester?.display_name || "Community Requester"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Explainability Accordion */}
                {isExpanded && breakdown && (
                  <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Explainable Matching Score Breakdown
                    </h4>
                    
                    {/* Multi-factor Score Bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-white p-2 border border-stone-200">
                        <span className="text-stone-400 block text-[10px]">Text Similarity (35%)</span>
                        <strong className="text-brand-700 text-sm">{breakdown.text_similarity_score.toFixed(0)}%</strong>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-stone-200">
                        <span className="text-stone-400 block text-[10px]">Category (25%)</span>
                        <strong className="text-brand-700 text-sm">{breakdown.category_score.toFixed(0)}%</strong>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-stone-200">
                        <span className="text-stone-400 block text-[10px]">Quantity (15%)</span>
                        <strong className="text-brand-700 text-sm">{breakdown.quantity_score.toFixed(0)}%</strong>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-stone-200">
                        <span className="text-stone-400 block text-[10px]">Location (15%)</span>
                        <strong className="text-brand-700 text-sm">{breakdown.location_score.toFixed(0)}%</strong>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-stone-200">
                        <span className="text-stone-400 block text-[10px]">Urgency (10%)</span>
                        <strong className="text-brand-700 text-sm">{breakdown.urgency_score.toFixed(0)}%</strong>
                      </div>
                    </div>

                    {/* Natural Language Reasons List */}
                    <div className="space-y-1.5 pt-1">
                      {breakdown.reasons.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-stone-700">
                          <CheckCircle2 size={13} className="text-brand-600 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Match Action Buttons */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-stone-400">
                    {match.notes && <span className="italic">Note: {match.notes}</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    {match.status === "suggested" && (
                      <>
                        <button
                          onClick={() => handleAction(match.id, "rejected")}
                          className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-500 hover:bg-stone-100"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleAction(match.id, "interest_expressed")}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 px-3 py-1.5 text-xs font-semibold hover:bg-sky-100"
                        >
                          <ThumbsUp size={13} /> Express Interest
                        </button>
                        <button
                          onClick={() =>
                            triggerActionWithConfirm(
                              match.id,
                              "accepted",
                              "Accept & Reserve Match",
                              `Accepting this match will allocate ${match.proposed_quantity} unit(s) from the resource and mark it as reserved. Do you wish to proceed?`,
                              "Accept Match"
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                        >
                          <Check size={13} /> Accept Directly
                        </button>
                      </>
                    )}

                    {match.status === "interest_expressed" && (
                      <>
                        <button
                          onClick={() => handleAction(match.id, "rejected")}
                          className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-500 hover:bg-stone-100"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() =>
                            triggerActionWithConfirm(
                              match.id,
                              "accepted",
                              "Accept Exchange Match",
                              `Accepting will formally reserve the resource inventory. Proceed?`,
                              "Accept Match"
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                        >
                          <Check size={13} /> Accept Match
                        </button>
                      </>
                    )}

                    {match.status === "accepted" && (
                      <>
                        <button
                          onClick={() =>
                            triggerActionWithConfirm(
                              match.id,
                              "cancelled",
                              "Cancel Exchange",
                              "Cancelling will return the allocated quantity back to available inventory. Continue?",
                              "Cancel Match",
                              true
                            )
                          }
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Cancel Exchange
                        </button>
                        <button
                          onClick={() =>
                            triggerActionWithConfirm(
                              match.id,
                              "completed",
                              "Confirm Resource Transfer Completed",
                              `Marking as completed will confirm the physical handoff/reuse, fulfill the community need, and permanently log the waste avoided metrics in the database.`,
                              "Mark Completed"
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm"
                        >
                          <CheckCircle2 size={13} /> Complete Handoff
                        </button>
                      </>
                    )}

                    {match.status === "completed" && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 size={13} /> Handoff verified & reused
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
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
