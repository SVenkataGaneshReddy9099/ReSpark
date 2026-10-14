import { X } from "lucide-react";
import type { ReactNode } from "react";
import type { Resource } from "../types";
import { AvailabilityBadge, CategoryBadge, ResourceTypeBadge } from "./Badges";
import { CONDITION_LABELS } from "../types/enums";
import { formatDate } from "../utils/format";

export function ResourceDetailModal({
  resource,
  onClose,
  footer,
}: {
  resource: Resource;
  onClose: () => void;
  footer?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-900/40 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold leading-snug text-stone-900">{resource.title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100">
            <X size={18} />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <AvailabilityBadge status={resource.availability_status} />
          <CategoryBadge category={resource.category} />
          <ResourceTypeBadge type={resource.resource_type} />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-stone-600">{resource.description}</p>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Quantity available</dt>
            <dd className="mt-0.5 text-stone-800">
              {resource.remaining_quantity} of {resource.quantity} {resource.unit}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Condition</dt>
            <dd className="mt-0.5 text-stone-800">{CONDITION_LABELS[resource.condition]}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Location</dt>
            <dd className="mt-0.5 text-stone-800">{resource.location}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Posted</dt>
            <dd className="mt-0.5 text-stone-800">{formatDate(resource.created_at)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Provided by</dt>
            <dd className="mt-0.5 text-stone-800">
              {resource.provider ? (
                <>
                  {resource.provider.display_name}
                  <span className="ml-2 text-xs text-stone-400">
                    ({resource.provider.is_organization ? "organization" : "community member"}, {resource.provider.location})
                  </span>
                </>
              ) : (
                `Member #${resource.provider_id}`
              )}
            </dd>
          </div>
          {resource.instructions && (
            <div className="col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Pickup / usage instructions</dt>
              <dd className="mt-0.5 text-stone-800">{resource.instructions}</dd>
            </div>
          )}
        </dl>

        {footer && <div className="mt-6 flex justify-end border-t border-stone-100 pt-4">{footer}</div>}
      </div>
    </div>
  );
}
