import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Info,
} from "lucide-react";
import { api } from "../services/api";
import { useDemoUser } from "../hooks/useDemoUser";
import { useToast } from "../hooks/useToast";
import { CATEGORY_LABELS, RESOURCE_TYPE_LABELS, CONDITION_LABELS } from "../types/enums";
import type { Category, ResourceType, Condition } from "../types/enums";

export default function ShareResource() {
  const navigate = useNavigate();
  const demoUser = useDemoUser();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("textbooks");
  const [resourceType, setResourceType] = useState<ResourceType>("physical_item");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("item");
  const [condition, setCondition] = useState<Condition>("good");
  const [location, setLocation] = useState(demoUser?.location ?? "University Campus");
  const [instructions, setInstructions] = useState("");
  const [contactInfo, setContactInfo] = useState(demoUser?.email ?? "");
  const [weightKg, setWeightKg] = useState("1.5");

  // Adjust default unit & weight when category changes
  const handleCategoryChange = (newCat: Category) => {
    setCategory(newCat);
    if (newCat === "textbooks") {
      setUnit("book");
      setWeightKg("1.5");
      setResourceType("physical_item");
    } else if (newCat === "electronics") {
      setUnit("device");
      setWeightKg("2.5");
      setResourceType("physical_item");
    } else if (newCat === "furniture") {
      setUnit("item");
      setWeightKg("18.0");
      setResourceType("physical_item");
    } else if (newCat === "stationery") {
      setUnit("pack");
      setWeightKg("0.6");
      setResourceType("physical_item");
    } else if (newCat === "skills") {
      setUnit("hours");
      setWeightKg("0.0");
      setResourceType("skill");
      setCondition("not_applicable");
    } else if (newCat === "volunteer") {
      setUnit("hours");
      setWeightKg("0.0");
      setResourceType("volunteer_time");
      setCondition("not_applicable");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim() || title.length < 3) {
      setError("Please provide a descriptive title (at least 3 characters).");
      return;
    }
    if (!description.trim() || description.length < 10) {
      setError("Please describe the resource in detail (at least 10 characters).");
      return;
    }
    const numQty = parseFloat(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }
    if (!location.trim()) {
      setError("Please specify a community location or neighborhood.");
      return;
    }

    if (!demoUser) {
      setError("Demo user not loaded. Please wait a moment.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        provider_id: demoUser.id,
        title: title.trim(),
        description: description.trim(),
        category,
        resource_type: resourceType,
        quantity: numQty,
        unit: unit.trim() || "units",
        condition,
        location: location.trim(),
        instructions: instructions.trim() || null,
        contact_info: contactInfo.trim() || null,
        estimated_weight_kg: parseFloat(weightKg) || 0.0,
      };

      await api.createResource(payload);
      toast("Resource listed successfully!", "success");
      navigate("/explore");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create resource listing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-3"
        >
          <ArrowLeft size={14} /> Back to explore
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Share a Resource with Your Community
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          List an unused textbook, device, furniture, or offer your coding skills to someone in need.
        </p>
      </div>

      {/* Form Container */}
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
            Posting as: <strong className="text-stone-800">{demoUser?.display_name || "Guest"}</strong> ({demoUser?.location})
          </span>
          <span className="text-stone-400">Switch profile in top bar</span>
        </div>

        {/* Title */}
        <div>
          <label className="label">Resource Title *</label>
          <input
            type="text"
            className="input"
            placeholder="e.g., Introduction to Algorithms (CLRS 3rd Ed) or Ergonomic Desk Chair"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-stone-400">Be specific so the AI matching engine can accurately pair your listing.</p>
        </div>

        {/* Category & Type */}
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
          <label className="label">Description *</label>
          <textarea
            rows={4}
            className="input"
            placeholder="Provide condition details, specs, included accessories, or topics covered..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Quantity, Unit, Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Available Quantity *</label>
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
              placeholder="e.g. books, hours, sets"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Condition</label>
            <select
              className="input"
              value={condition}
              onChange={(e) => setCondition(e.target.value as Condition)}
            >
              {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Pickup Location or Neighborhood *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. University Campus, Downtown, or Online"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Contact Email or Notes</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. email or Discord handle"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
            />
          </div>
        </div>

        {/* Handover Instructions */}
        <div>
          <label className="label">Pickup or Handover Instructions (Optional)</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Can meet in front of University Library or provide Zoom link"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>

        {/* Estimated Weight for Waste Calculation */}
        {resourceType === "physical_item" && (
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info size={16} className="text-brand-600" />
              <label className="text-xs font-bold text-stone-800">
                Estimated Weight per Item (kg) — for Environmental Metrics
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                min="0"
                className="input max-w-32 bg-white"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
              <span className="text-xs text-stone-500">
                Helps calculate accurate landfill diversion and CO2 savings when completed.
              </span>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <Link
            to="/explore"
            className="btn-secondary"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Publishing listing..." : "Publish Resource Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
