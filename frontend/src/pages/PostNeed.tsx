import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { api } from "../services/api";
import { useDemoUser } from "../hooks/useDemoUser";
import { useToast } from "../hooks/useToast";
import { CATEGORY_LABELS, RESOURCE_TYPE_LABELS, URGENCY_LABELS } from "../types/enums";
import type { Category, ResourceType, Urgency } from "../types/enums";

export default function PostNeed() {
  const navigate = useNavigate();
  const demoUser = useDemoUser();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("textbooks");
  const [resourceType, setResourceType] = useState<ResourceType>("physical_item");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("book");
  const [location, setLocation] = useState(demoUser?.location ?? "University Campus");
  const [urgency, setUrgency] = useState<Urgency>("medium");
  const [requiredBy, setRequiredBy] = useState("");
  const [preferences, setPreferences] = useState("");

  const handleCategoryChange = (newCat: Category) => {
    setCategory(newCat);
    if (newCat === "textbooks") {
      setUnit("book");
      setResourceType("physical_item");
    } else if (newCat === "electronics") {
      setUnit("device");
      setResourceType("physical_item");
    } else if (newCat === "furniture") {
      setUnit("item");
      setResourceType("physical_item");
    } else if (newCat === "stationery") {
      setUnit("sets");
      setResourceType("physical_item");
    } else if (newCat === "skills") {
      setUnit("hours");
      setResourceType("skill");
    } else if (newCat === "volunteer") {
      setUnit("hours");
      setResourceType("volunteer_time");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || title.length < 3) {
      setError("Please specify what resource you need (at least 3 characters).");
      return;
    }
    if (!description.trim() || description.length < 10) {
      setError("Please describe your need and context (at least 10 characters).");
      return;
    }
    const numQty = parseFloat(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      setError("Quantity requested must be a positive number.");
      return;
    }
    if (!location.trim()) {
      setError("Please specify your location or neighborhood.");
      return;
    }
    if (!demoUser) {
      setError("Demo user not loaded. Please wait a moment.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        requester_id: demoUser.id,
        title: title.trim(),
        description: description.trim(),
        category,
        resource_type: resourceType,
        quantity_requested: numQty,
        unit: unit.trim() || "units",
        location: location.trim(),
        urgency,
        required_by: requiredBy || null,
        preferences: preferences.trim() || null,
      };

      await api.createNeed(payload);
      toast("Community need posted successfully!", "success");
      navigate("/matches");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post need.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-3"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Post a Community Need
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Request study materials, devices, furniture, or tutoring. Our AI matching engine will match your need with available community resources.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-card space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Submission Error</p>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Demo Identity Notice */}
        <div className="rounded-xl bg-stone-50 border border-stone-200 p-3.5 flex items-center justify-between text-xs text-stone-600">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            Requesting as: <strong className="text-stone-800">{demoUser?.display_name || "Guest"}</strong> ({demoUser?.location})
          </span>
          <span className="text-stone-400">Switch profile in top bar</span>
        </div>

        {/* Title */}
        <div>
          <label className="label">What do you need? *</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Data Structures & Algorithms Textbook or Working Laptop for Coding"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Category & Format */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category *</label>
            <select
              className="input"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as Category)}
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Resource Format *</label>
            <select
              className="input"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as ResourceType)}
            >
              {Object.entries(RESOURCE_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">Describe Your Need & Context *</label>
          <textarea
            rows={4}
            className="input"
            placeholder="Explain what courses or project this is for, why you need it, and how it will be used..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Quantity & Urgency */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Quantity Needed *</label>
            <input
              type="number"
              min="0.1"
              step="any"
              className="input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Unit *</label>
            <input
              type="text"
              className="input"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Urgency Level *</label>
            <select
              className="input"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as Urgency)}
            >
              {Object.entries(URGENCY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location & Needed By Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Location or Community Area *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. University Campus or Downtown"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Needed By Date (Optional)</label>
            <input
              type="date"
              className="input"
              value={requiredBy}
              onChange={(e) => setRequiredBy(e.target.value)}
            />
          </div>
        </div>

        {/* Specific Preferences */}
        <div>
          <label className="label">Specific Preferences or Requirements (Optional)</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Prefer 16GB RAM for Docker; any edition from 2018 onwards is fine"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
          />
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="btn-secondary"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            <Sparkles size={16} />
            {loading ? "Submitting request..." : "Post Need & Find Matches"}
          </button>
        </div>
      </form>
    </div>
  );
}
