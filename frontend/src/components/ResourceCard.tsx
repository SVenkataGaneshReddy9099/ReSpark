import { useState } from "react";
import { Box, Eye, MapPin, User } from "lucide-react";
import { Link } from "react-router-dom";
import type { Resource } from "../types";
import { AvailabilityBadge, CategoryBadge, ResourceTypeBadge } from "./Badges";
import { CONDITION_LABELS } from "../types/enums";
import { ResourceDetailModal } from "./ResourceDetailModal";
import { formatDate } from "../utils/format";

export function ResourceCard({ resource }: { resource: Resource }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-card transition hover:shadow-card-hover">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-snug text-stone-900">{resource.title}</h3>
          <AvailabilityBadge status={resource.availability_status} />
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm text-stone-500">{resource.description}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <CategoryBadge category={resource.category} />
          <ResourceTypeBadge type={resource.resource_type} />
        </div>

        <dl className="mt-4 space-y-1.5 text-sm text-stone-600">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800">
              <Box size={14} className="text-brand-600" />
              {resource.remaining_quantity % 1 === 0 ? resource.remaining_quantity : resource.remaining_quantity.toFixed(1)} of{" "}
              {resource.quantity} {resource.unit}
            </span>
            <span className="text-xs text-stone-500">{CONDITION_LABELS[resource.condition]}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <MapPin size={13} className="text-stone-400" /> {resource.location}
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <User size={13} className="text-stone-400" />
            {resource.provider ? resource.provider.display_name : `Member #${resource.provider_id}`}
            {resource.provider?.is_organization && <span className="rounded bg-indigo-50 px-1.5 py-px font-medium text-indigo-700">Org</span>}
            {resource.created_at && <span className="ml-auto text-stone-400">{formatDate(resource.created_at)}</span>}
          </div>
        </dl>

        <button
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand-800 transition hover:bg-brand-100"
        >
          <Eye size={15} /> View details
        </button>
      </article>

      {open && (
        <ResourceDetailModal
          resource={resource}
          onClose={() => setOpen(false)}
          footer={
            <Link
              to="/post-need"
              className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Post a matching need
            </Link>
          }
        />
      )}
    </>
  );
}
