export type Category = "textbooks" | "electronics" | "furniture" | "stationery" | "skills" | "volunteer" | "other";

export const CATEGORY_LABELS: Record<Category, string> = {
  textbooks: "Textbooks",
  electronics: "Electronics",
  furniture: "Furniture",
  stationery: "Stationery",
  skills: "Skills",
  volunteer: "Volunteer",
  other: "Other",
};

export type ResourceType = "physical_item" | "skill" | "service" | "volunteer_time";

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  physical_item: "Physical item",
  skill: "Skill",
  service: "Service",
  volunteer_time: "Volunteer time",
};

export type Condition = "brand_new" | "like_new" | "good" | "fair" | "not_applicable";

export const CONDITION_LABELS: Record<Condition, string> = {
  brand_new: "Brand new",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
  not_applicable: "N/A",
};

export type Urgency = "low" | "medium" | "high" | "critical";

export const URGENCY_LABELS: Record<Urgency, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export type AvailabilityStatus = "available" | "reserved" | "completed" | "inactive";

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  completed: "Completed",
  inactive: "Inactive",
};

export type NeedStatus = "open" | "in_progress" | "fulfilled" | "cancelled";

export const NEED_STATUS_LABELS: Record<NeedStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

export type MatchStatus = "suggested" | "interest_expressed" | "accepted" | "completed" | "rejected" | "cancelled";

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  suggested: "Suggested",
  interest_expressed: "Interest expressed",
  accepted: "Accepted",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const MATCH_ACTION_LABELS: Record<MatchStatus, string> = {
  suggested: "Express interest",
  interest_expressed: "Accept match",
  accepted: "Mark completed",
  completed: "",
  rejected: "",
  cancelled: "",
};
