import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Recycle,
  Scale,
  CheckCircle2,
  Users,
  ShieldCheck,
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
} from "recharts";
import { api } from "../services/api";
import type { ImpactStats } from "../types";
import { StatCard } from "../components/StatCard";
import { LoadingState, ErrorState } from "../components/Feedback";

export default function Impact() {
  const [impact, setImpact] = useState<ImpactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImpact = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.impactStats();
      setImpact(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load community impact metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpact();
  }, []);

  if (loading) {
    return <LoadingState message="Aggregating verified community impact records..." />;
  }

  if (error || !impact) {
    return (
      <ErrorState
        title="Could not load impact data"
        message={error || "Ensure backend is running on port 8000."}
        onRetry={fetchImpact}
      />
    );
  }

  const chartData = impact.category_impact.map((cat) => ({
    category: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
    waste_kg: cat.waste_avoided_kg,
    co2_kg: cat.co2_avoided_kg,
    units: cat.units_reused,
    matches: cat.matches_count,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Verified Community & Environmental Impact
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Real outcomes calculated solely from completed resource handoffs and fulfilled community needs.
          </p>
        </div>

        <button
          onClick={fetchImpact}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 self-start sm:self-auto"
        >
          <RefreshCw size={13} /> Refresh Metrics
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Completed Exchanges"
          value={impact.total_completed_matches}
          subtitle={`${impact.fulfilled_requests} requests fully fulfilled`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Community Members Helped"
          value={impact.community_members_helped}
          subtitle="unique donors and recipients"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Landfill Waste Diverted"
          value={`${impact.estimated_waste_avoided_kg} kg`}
          subtitle="physical materials kept in use"
          icon={Scale}
          color="teal"
        />
        <StatCard
          title="Embodied CO2 Avoided"
          value={`${impact.estimated_co2_avoided_kg} kg`}
          subtitle="avoided manufacturing footprint"
          icon={Recycle}
          color="amber"
        />
      </div>

      {/* Skills Hours Special Banner */}
      {impact.skills_hours_shared > 0 && (
        <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-indigo-50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
              Human Capital & Knowledge Sharing
            </span>
            <h3 className="text-xl font-bold text-stone-900">
              {impact.skills_hours_shared} Hours of 1-on-1 Mentorship & Volunteering
            </h3>
            <p className="text-xs text-stone-600 max-w-xl">
              Software engineering tutoring, resume coaching, and community garden volunteering shared directly between community members.
            </p>
          </div>
          <Link
            to="/explore?category=skills"
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700 shadow-sm shrink-0"
          >
            Explore Skills Offered &rarr;
          </Link>
        </div>
      )}

      {/* Visual Analytics Chart */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-stone-900">Environmental Savings by Category</h2>
            <p className="text-xs text-stone-500">
              Landfill waste avoided (kg) vs. Embodied carbon footprint prevented (kg CO2e)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-teal-600" /> Waste Diverted (kg)</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500" /> CO2e Avoided (kg)</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
              />
              <Bar dataKey="waste_kg" name="Waste Diverted (kg)" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="co2_kg" name="CO2e Avoided (kg)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explicit Scientific Assumptions & Transparent Methodology */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-brand-600" />
          <h3 className="text-base font-bold text-stone-900">
            Documented Scientific Assumptions & Ground Truth
          </h3>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          In strict compliance with transparency standards, ReSpark does not fabricate counter numbers. Every metric displayed is computed deterministically from records marked <code className="text-xs bg-stone-100 px-1 py-0.5 rounded font-mono">status = completed</code> in SQLite.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-stone-100 bg-stone-50 p-4 space-y-1">
            <h4 className="font-bold text-stone-800">1. Waste Diversion Constants</h4>
            <p className="text-stone-600 leading-relaxed">
              Based on EPA lifecycle averages for reused consumer and academic assets:
            </p>
            <ul className="list-disc list-inside text-stone-500 space-y-0.5 pt-1">
              <li><strong>Textbooks:</strong> 1.2 kg landfill paper diverted per book.</li>
              <li><strong>Electronics (Laptops/Monitors):</strong> 2.8 kg e-waste diverted per unit.</li>
              <li><strong>Furniture (Chairs/Desks):</strong> 18.5 kg landfill bulk diverted per piece.</li>
              <li><strong>Stationery:</strong> 0.6 kg paper &amp; plastics diverted per bundle.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-stone-100 bg-stone-50 p-4 space-y-1">
            <h4 className="font-bold text-stone-800">2. Embodied Carbon Calculations</h4>
            <p className="text-stone-600 leading-relaxed">
              Extending the lifespan of existing equipment eliminates raw material extraction and manufacturing emissions:
            </p>
            <ul className="list-disc list-inside text-stone-500 space-y-0.5 pt-1">
              <li><strong>Electronics:</strong> ~120 kg CO2e saved by avoiding new semiconductor production.</li>
              <li><strong>Furniture:</strong> ~40 kg CO2e saved through avoided metal and lumber processing.</li>
              <li><strong>Textbooks:</strong> ~2.5 kg CO2e saved from virgin pulp bleaching and transport.</li>
              <li><strong>Skills &amp; Volunteering:</strong> Tracked strictly as human support hours.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
