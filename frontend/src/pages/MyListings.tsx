import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  HelpCircle,
  PlusCircle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { api } from "../services/api";
import { useDemoUser } from "../hooks/useDemoUser";
import { useToast } from "../hooks/useToast";
import type { Resource, Need } from "../types";
import { CategoryBadge, AvailabilityBadge, NeedStatusBadge, UrgencyBadge } from "../components/Badges";
import { LoadingState, ErrorState, EmptyState } from "../components/Feedback";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { formatDate } from "../utils/format";

export default function MyListings() {
  const demoUser = useDemoUser();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"resources" | "needs">("resources");
  const [resources, setResources] = useState<Resource[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const loadUserData = async () => {
    if (!demoUser) return;
    setLoading(true);
    setError(null);
    try {
      const [resData, needData] = await Promise.all([
        api.listResources({ provider_id: demoUser.id }),
        api.listNeeds({ requester_id: demoUser.id }),
      ]);
      setResources(resData);
      setNeeds(needData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [demoUser?.id]);

  const handleDeactivateResource = (resourceId: number) => {
    setConfirmModal({
      open: true,
      title: "Deactivate Resource Listing",
      message: "Are you sure you want to deactivate this listing? It will no longer appear in search results or matching recommendations.",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, open: false }));
        try {
          await api.deactivateResource(resourceId);
          toast("Resource successfully deactivated.", "success");
          await loadUserData();
        } catch (err: unknown) {
          toast(err instanceof Error ? err.message : "Failed to deactivate resource.", "error");
        }
      },
    });
  };

  const handleCancelNeed = (needId: number) => {
    setConfirmModal({
      open: true,
      title: "Cancel Community Need",
      message: "Are you sure you want to cancel this request? It will be marked as cancelled in the database.",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, open: false }));
        try {
          await api.cancelNeed(needId);
          toast("Need request marked as cancelled.", "success");
          await loadUserData();
        } catch (err: unknown) {
          toast(err instanceof Error ? err.message : "Failed to cancel need.", "error");
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            My Community Postings
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Manage your shared resources and requests as <strong className="text-stone-800">{demoUser?.display_name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/share"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <PlusCircle size={14} /> Share Resource
          </Link>
          <Link
            to="/post-need"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
          >
            <HelpCircle size={14} /> Post Need
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab("resources")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "resources"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          <Boxes size={16} /> My Shared Resources ({resources.length})
        </button>
        <button
          onClick={() => setActiveTab("needs")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "needs"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          <HelpCircle size={16} /> My Community Needs ({needs.length})
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading your listings..." />
      ) : error ? (
        <ErrorState
          title="Could not load listings"
          message={error}
          onRetry={loadUserData}
        />
      ) : activeTab === "resources" ? (
        /* Resources Tab */
        resources.length === 0 ? (
          <EmptyState
            title="You haven't shared any resources yet"
            message="Have unused textbooks, electronics, or furniture? Share them with your community to reduce waste!"
            action={
              <Link
                to="/share"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                <PlusCircle size={15} /> Share a Resource
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {resources.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-brand-200"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={item.category} />
                    <AvailabilityBadge status={item.availability_status} />
                    {item.created_at && (
                      <span className="text-xs text-stone-400">· {formatDate(item.created_at)}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-stone-900 text-base">{item.title}</h3>
                  <p className="text-xs text-stone-500 line-clamp-1">{item.description}</p>
                  <div className="flex items-center gap-4 text-xs text-stone-600 pt-1">
                    <span>
                      Qty: <strong>{item.remaining_quantity}</strong> of {item.quantity} {item.unit}
                    </span>
                    <span>Location: {item.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/matches?resource_id=${item.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2 text-xs font-semibold text-brand-800 hover:bg-brand-100"
                  >
                    <Sparkles size={13} className="text-spark-600" /> Matches
                  </Link>
                  {item.availability_status === "available" && (
                    <button
                      onClick={() => handleDeactivateResource(item.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-50 hover:text-red-600"
                      title="Deactivate listing"
                    >
                      <Trash2 size={13} /> Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Needs Tab */
        needs.length === 0 ? (
          <EmptyState
            title="You haven't posted any community needs"
            message="Looking for books, learning devices, or tutoring? Post a need and our matching engine will pair you with donors."
            action={
              <Link
                to="/post-need"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                <HelpCircle size={15} /> Post a Community Need
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {needs.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-amber-200"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={item.category} />
                    <NeedStatusBadge status={item.status} />
                    <UrgencyBadge urgency={item.urgency} />
                  </div>
                  <h3 className="font-bold text-stone-900 text-base">{item.title}</h3>
                  <p className="text-xs text-stone-500 line-clamp-1">{item.description}</p>
                  <div className="flex items-center gap-4 text-xs text-stone-600 pt-1">
                    <span>
                      Requested: <strong>{item.quantity_requested}</strong> {item.unit}
                    </span>
                    <span>Fulfilled: {item.quantity_fulfilled}</span>
                    <span>Location: {item.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/matches?need_id=${item.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    <Sparkles size={13} className="text-spark-600" /> Matches
                  </Link>
                  {item.status === "open" && (
                    <button
                      onClick={() => handleCancelNeed(item.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-50 hover:text-red-600"
                      title="Cancel request"
                    >
                      <Trash2 size={13} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Confirm"
        isDestructive={true}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
