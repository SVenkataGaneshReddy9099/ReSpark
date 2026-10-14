import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Recycle,
  Scale,
  ArrowRight,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { api } from "../services/api";
import type { DashboardStats } from "../types";
import { StatCard } from "../components/StatCard";
import { LoadingState, ErrorState } from "../components/Feedback";

const CATEGORY_COLORS = ["#059669", "#7c3aed", "#ea580c", "#ec4899", "#0284c7", "#84cc16", "#64748b"];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.dashboardStats();
      setStats(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingState message="Calculating real-time database metrics..." />;
  }

  if (error || !stats) {
    return (
      <ErrorState
        title="Could not load dashboard"
        message={error || "Ensure backend is running on port 8000."}
        onRetry={fetchStats}
      />
    );
  }

  const categoryChartData = stats.category_breakdown.map((item) => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    resources: item.resource_count,
    needs: item.need_count,
    completed: item.completed_matches,
  }));

  const pipelineChartData = stats.match_pipeline.map((item) => ({
    status: item.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    count: item.count,
  }));

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Community Exchange Dashboard
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Real-time activity and environmental metrics derived directly from verified database records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
            title="Refresh statistics"
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <Link
            to="/matches"
            className="inline-flex items-center gap-1.5 rounded-xl bg-spark-500 px-3.5 py-2 text-xs font-bold text-stone-950 shadow-sm transition hover:bg-spark-400"
          >
            <Sparkles size={14} /> Smart Matches
          </Link>
          <Link
            to="/share"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <PlusCircle size={14} /> Share Resource
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Available Resources"
          value={stats.available_resources}
          subtitle={`of ${stats.total_resources} total listings`}
          icon={Boxes}
          color="emerald"
        />
        <StatCard
          title="Open Community Needs"
          value={stats.open_needs}
          subtitle={`of ${stats.total_needs} requests posted`}
          icon={HelpCircle}
          color="indigo"
        />
        <StatCard
          title="Resources Reused"
          value={stats.resources_reused_count}
          subtitle={`across ${stats.completed_matches} completed matches`}
          icon={Recycle}
          color="amber"
        />
        <StatCard
          title="Waste Diverted"
          value={`${stats.estimated_waste_avoided_kg} kg`}
          subtitle="landfill diversion estimate"
          icon={Scale}
          color="teal"
        />
      </div>

      {/* Secondary Metrics & Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Match Recommendations</p>
            <p className="mt-1 text-2xl font-bold text-stone-900">{stats.suggested_matches}</p>
            <p className="text-xs text-stone-500 mt-0.5">High-affinity pairs ready for review</p>
          </div>
          <Link
            to="/matches"
            className="h-10 w-10 rounded-xl bg-spark-50 text-spark-700 hover:bg-spark-100 flex items-center justify-center transition"
          >
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">In-Flight Exchanges</p>
            <p className="mt-1 text-2xl font-bold text-stone-900">{stats.active_matches}</p>
            <p className="text-xs text-stone-500 mt-0.5">Pending handoff or meetup</p>
          </div>
          <Link
            to="/matches/manage"
            className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 flex items-center justify-center transition"
          >
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Impact Transparency</p>
            <p className="mt-1 text-2xl font-bold text-stone-900">100%</p>
            <p className="text-xs text-stone-500 mt-0.5">Ground-truth SQLite persistence</p>
          </div>
          <Link
            to="/impact"
            className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition"
          >
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-900">Listings by Category</h2>
              <p className="text-xs text-stone-500">Resources offered vs. Needs requested</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-600" /> Resources</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-stone-300" /> Needs</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Bar dataKey="resources" name="Resources" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="needs" name="Needs" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Match Pipeline Chart */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-900">Exchange Pipeline Lifecycle</h2>
              <p className="text-xs text-stone-500">Distribution across active state machine stages</p>
            </div>
            <Link to="/matches/manage" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              Manage Pipeline &rarr;
            </Link>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineChartData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="status" type="category" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Bar dataKey="count" name="Matches" radius={[0, 4, 4, 0]}>
                  {pipelineChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Methodology & Calculation Transparency */}
      <div className="rounded-2xl border border-brand-200/80 bg-brand-50/50 p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-brand-100 text-brand-800 shrink-0">
            <Scale size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-950">
              Documented Impact Calculation Methodology
            </h3>
            <p className="mt-1 text-xs text-brand-800/90 leading-relaxed">
              {stats.waste_avoided_methodology}
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs font-medium text-brand-700">
              <span className="flex items-center gap-1"><CheckCircle2 size={13} /> Textbooks: 1.2 kg/unit</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={13} /> Electronics: 2.8 kg/unit</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={13} /> Furniture: 18.5 kg/unit</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={13} /> Stationery: 0.6 kg/pack</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
