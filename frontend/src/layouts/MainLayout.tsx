import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  ChevronsUpDown,
  ClipboardPlus,
  HandHeart,
  LayoutDashboard,
  LogOut,
  Plus,
  Sparkles,
  Target,
  UserCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { Logo } from "../components/Logo";
import { demoUserStore, useDemoUser } from "../hooks/useDemoUser";
import { api } from "../services/api";
import type { User } from "../types";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/explore", label: "Explore", icon: BookOpen },
  { to: "/matches", label: "Smart Matches", icon: Target },
  { to: "/my-listings", label: "My Listings", icon: ClipboardPlus },
  { to: "/impact", label: "Impact", icon: BarChart3 },
];

function AccountSwitcher() {
  const me = useDemoUser();
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    demoUserStore.init();
    api.listUsers().then(setUsers).catch(() => {});
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
      >
        <UserCircle2 size={20} className="text-brand-600" />
        <span className="hidden max-w-40 truncate sm:inline">{me ? me.display_name : "Loading…"}</span>
        <ChevronsUpDown size={14} className="text-stone-400" />
      </button>
      {open && me && (
        <>
          <div className="fixed inset-0 z-[95]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-[96] mt-2 w-72 rounded-2xl border border-stone-200 bg-white p-2 shadow-card">
            <p className="px-2 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              Act as (demo identity)
            </p>
            {users.map((u) => (
              <button
                key={u.id}
                onClick={async () => {
                  setOpen(false);
                  await demoUserStore.setUser(u.id);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-stone-50 ${u.id === me.id ? "bg-brand-50 text-brand-800" : "text-stone-700"}`}
              >
                <UserCircle2 size={18} className={u.id === me.id ? "text-brand-600" : "text-stone-400"} />
                <span className="flex-1">
                  <span className="block font-medium leading-tight">{u.display_name}</span>
                  <span className="block text-xs text-stone-400">{u.location}</span>
                </span>
                {u.is_organization && <span className="rounded bg-indigo-50 px-1.5 py-px text-[10px] font-medium text-indigo-700">Org</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function MainLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    toast.info("You are logged out. See you soon!");
    navigate("/");
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Logo />
          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? "bg-brand-50 text-brand-800" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <AccountSwitcher />
            <NavLink
              to="/share"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              <Plus size={16} className="sm:hidden" />
              <span className="hidden sm:inline">Share a Resource</span>
              <span className="sm:hidden">Share</span>
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-t border-stone-100 px-3 py-1.5 lg:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  isActive ? "bg-brand-50 text-brand-800" : "text-stone-600"
                }`
              }
            >
              <item.icon size={14} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="mt-8 border-t border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-stone-500">
              Every unused resource can create a new opportunity. ReSpark intelligently connects what we no longer use
              with the people who need it most.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">Platform</p>
            <ul className="mt-3 space-y-2 text-sm text-stone-500">
              <li><NavLink to="/explore" className="hover:text-brand-700">Explore resources</NavLink></li>
              <li><NavLink to="/post-need" className="hover:text-brand-700">Post a need</NavLink></li>
              <li><NavLink to="/matches" className="hover:text-brand-700">Smart matches</NavLink></li>
              <li><NavLink to="/impact" className="hover:text-brand-700">Community impact</NavLink></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">About ReSpark</p>
            <ul className="mt-3 space-y-2 text-sm text-stone-500">
              <li><NavLink to="/dashboard" className="hover:text-brand-700">Live dashboard</NavLink></li>
              <li><NavLink to="/share" className="hover:text-brand-700">Share a resource</NavLink></li>
              <li className="inline-flex items-center gap-1.5"><HandHeart size={14} className="text-brand-600" /> Hackathon prototype, free &amp; local</li>
            </ul>
            <p className="mt-4 inline-flex items-center gap-1 text-xs text-stone-400">
              <Sparkles size={12} className="text-spark-500" /> Local demonstration build — no authentication.
            </p>
          </div>
        </div>
        <div className="border-t border-stone-100 py-4 text-center text-xs text-stone-400">
          ReSpark · Rediscover the Value Around You. · Built with FastAPI, SQLAlchemy &amp; React
        </div>
      </footer>
      {/* keep icons imported for mobile tree */}
    </div>
  );
}
