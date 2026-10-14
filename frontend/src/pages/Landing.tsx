import { Link, useNavigate } from "react-router-dom";
import {
  LogIn,
  UserPlus,
  Sparkles,
  ArrowRight,
  BookOpen,
  Target,
  BarChart3,
} from "lucide-react";
import { useToast } from "../hooks/useToast";

export default function Landing() {
  const navigate = useNavigate();
  const toast = useToast();

  const handleRegister = () => {
    toast.success("You are successfully registered! Welcome to ReSpark.");
    navigate("/dashboard");
  };

  const handleLogin = () => {
    toast.success("You are logged in. Welcome back!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-brand-100 selection:text-brand-900">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen size={20} className="text-brand-600" />
            <span className="text-lg font-bold text-stone-900">ReSpark</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogin}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
            >
              <LogIn size={15} /> Login
            </button>
            <button
              type="button"
              onClick={handleRegister}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              <UserPlus size={15} /> Register
            </button>
          </div>
        </div>
      </nav>

      {/* Intro Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(40rem_24rem_at_50%_0%,#d1fae5_0%,transparent_100%)] opacity-40" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-800 shadow-sm">
            <Sparkles size={14} className="text-spark-500" />
            Community Resource Sharing Platform
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 leading-tight">
            Rediscover the Value{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-teal-700">Around You.</span>
          </h1>

          <p className="mt-5 text-lg text-stone-600 leading-relaxed">
            ReSpark connects people with unused resources — textbooks, laptops, furniture, skills — to students and
            community organizations who need them. An explainable matching engine pairs every listing with genuine
            community needs and tracks the real impact of each exchange.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRegister}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Get Started <ArrowRight size={16} />
            </button>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-6 py-3 text-base font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
            >
              Explore Resources
            </Link>
          </div>
        </div>
      </section>

      {/* What ReSpark Does — three simple points */}
      <section className="pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
              <BookOpen size={20} className="text-brand-600" />
              <h3 className="mt-3 text-base font-semibold text-stone-900">Share &amp; Request</h3>
              <p className="mt-1 text-sm text-stone-500">Post surplus items or skills. Ask for what you need.</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
              <Target size={20} className="text-spark-600" />
              <h3 className="mt-3 text-base font-semibold text-stone-900">Smart Matching</h3>
              <p className="mt-1 text-sm text-stone-500">Explainable AI scores pairs resources with real needs.</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
              <BarChart3 size={20} className="text-emerald-600" />
              <h3 className="mt-3 text-base font-semibold text-stone-900">Verified Impact</h3>
              <p className="mt-1 text-sm text-stone-500">Live metrics for waste diverted and CO₂ avoided.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© 2026 ReSpark · Rediscover the Value Around You.</p>
          <div className="flex gap-4">
            <Link to="/explore" className="hover:text-stone-900">Explore</Link>
            <Link to="/impact" className="hover:text-stone-900">Impact</Link>
            <Link to="/dashboard" className="hover:text-stone-900">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
