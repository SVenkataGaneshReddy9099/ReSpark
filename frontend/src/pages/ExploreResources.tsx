import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  X,
  PlusCircle,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { api } from "../services/api";
import type { Resource } from "../types";
import { ResourceCard } from "../components/ResourceCard";
import { LoadingState, ErrorState, EmptyState } from "../components/Feedback";
import { CATEGORY_LABELS, AVAILABILITY_LABELS, CONDITION_LABELS } from "../types/enums";
import type { Category, AvailabilityStatus, Condition } from "../types/enums";

export default function ExploreResources() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters from query params or local state
  const search = searchParams.get("q") ?? "";
  const selectedCategory = (searchParams.get("category") as Category | "") || "";
  const selectedAvailability = (searchParams.get("availability") as AvailabilityStatus | "") || "";
  const selectedCondition = (searchParams.get("condition") as Condition | "") || "";
  const selectedLocation = searchParams.get("location") ?? "";

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const loadResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listResources({
        q: search || undefined,
        category: selectedCategory || undefined,
        availability: selectedAvailability || undefined,
        condition: selectedCondition || undefined,
        location: selectedLocation || undefined,
      });
      setResources(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [search, selectedCategory, selectedAvailability, selectedCondition, selectedLocation]);

  const hasActiveFilters = Boolean(
    search || selectedCategory || selectedAvailability || selectedCondition || selectedLocation
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Explore Community Resources
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Browse items and skills offered by nearby students, neighbors, and community partners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/post-need"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
          >
            <HelpCircle size={14} /> Looking for something?
          </Link>
          <Link
            to="/share"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <PlusCircle size={14} /> Share a Resource
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              placeholder="Search by title, description, or subject (e.g. Algorithms, ThinkPad, Desk)..."
              value={search}
              onChange={(e) => updateParam("q", e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            {search && (
              <button
                onClick={() => updateParam("q", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => updateParam("category", e.target.value)}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {/* Availability Select */}
            <select
              value={selectedAvailability}
              onChange={(e) => updateParam("availability", e.target.value)}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Availability</option>
              {Object.entries(AVAILABILITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {/* Condition Select */}
            <select
              value={selectedCondition}
              onChange={(e) => updateParam("condition", e.target.value)}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="">Any Condition</option>
              {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-xl bg-stone-100 px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-200"
              >
                <X size={12} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 font-medium whitespace-nowrap mr-1">Filter:</span>
          <button
            onClick={() => updateParam("category", "")}
            className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap ${
              selectedCategory === ""
                ? "bg-brand-600 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => updateParam("category", selectedCategory === key ? "" : key)}
              className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                selectedCategory === key
                  ? "bg-brand-600 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          Showing <strong className="text-stone-800">{resources.length}</strong> resource{resources.length === 1 ? "" : "s"}
          {hasActiveFilters ? " matching your filters" : " across the community"}
        </span>
        <button
          onClick={loadResources}
          className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-700"
        >
          <RefreshCw size={12} /> Reload
        </button>
      </div>

      {/* Grid of Resource Cards */}
      {loading ? (
        <LoadingState message="Loading resource listings..." />
      ) : error ? (
        <ErrorState
          title="Failed to load resources"
          message={error}
          onRetry={loadResources}
        />
      ) : resources.length === 0 ? (
        <EmptyState
          title="No resources found"
          message="No active resources matched your search criteria. Try loosening your filters or be the first to share one!"
          action={
            <Link
              to="/share"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              <PlusCircle size={15} /> Share a Resource Now
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((item) => (
            <ResourceCard key={item.id} resource={item} />
          ))}
        </div>
      )}
    </div>
  );
}
