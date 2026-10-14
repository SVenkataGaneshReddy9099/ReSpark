export * from "./enums";
import type {
  AvailabilityStatus,
  Category,
  Condition,
  MatchStatus,
  NeedStatus,
  ResourceType,
  Urgency,
} from "./enums";

export interface User {
  id: number;
  display_name: string;
  email: string;
  location: string;
  bio?: string;
  is_organization: boolean;
  created_at?: string;
}

export interface Resource {
  id: number;
  provider_id: number;
  title: string;
  description: string;
  category: Category;
  resource_type: ResourceType;
  quantity: number;
  allocated_quantity: number;
  remaining_quantity: number;
  unit: string;
  condition: Condition;
  location: string;
  availability_status: AvailabilityStatus;
  instructions?: string | null;
  contact_info?: string | null;
  estimated_weight_kg?: number | null;
  created_at?: string;
  updated_at?: string;
  provider?: User | null;
}

export interface Need {
  id: number;
  requester_id: number;
  title: string;
  description: string;
  category: Category;
  resource_type: ResourceType;
  quantity_requested: number;
  quantity_fulfilled: number;
  remaining_requested: number;
  unit: string;
  location: string;
  urgency: Urgency;
  required_by?: string | null;
  status: NeedStatus;
  preferences?: string | null;
  created_at?: string;
  updated_at?: string;
  requester?: User | null;
}

export interface ScoreBreakdown {
  text_similarity_score: number;
  category_score: number;
  quantity_score: number;
  location_score: number;
  urgency_score: number;
  weights: Record<string, number>;
  reasons: string[];
}

export interface Match {
  id: number;
  resource_id: number;
  need_id: number;
  score: number;
  status: MatchStatus;
  match_explanation: string;
  proposed_quantity: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  resource?: Resource | null;
  need?: Need | null;
  parsed_breakdown?: ScoreBreakdown | null;
}

export interface GenerateMatchesResult {
  total_candidates_evaluated: number;
  new_matches_created: number;
  existing_matches_updated: number;
  top_matches: Match[];
}

export interface CategoryStat {
  category: string;
  resource_count: number;
  need_count: number;
  completed_matches: number;
}

export interface ActivityPoint {
  date: string;
  resources_added: number;
  needs_posted: number;
  matches_completed: number;
}

export interface DashboardStats {
  total_resources: number;
  available_resources: number;
  total_needs: number;
  open_needs: number;
  suggested_matches: number;
  active_matches: number;
  completed_matches: number;
  resources_reused_count: number;
  estimated_waste_avoided_kg: number;
  waste_avoided_methodology: string;
  category_breakdown: CategoryStat[];
  match_pipeline: { status: string; count: number }[];
  recent_activity: ActivityPoint[];
}

export interface CategoryImpact {
  category: string;
  units_reused: number;
  waste_avoided_kg: number;
  co2_avoided_kg: number;
  matches_count: number;
}

export interface ImpactStats {
  total_completed_matches: number;
  fulfilled_requests: number;
  community_members_helped: number;
  estimated_waste_avoided_kg: number;
  estimated_co2_avoided_kg: number;
  skills_hours_shared: number;
  category_impact: CategoryImpact[];
  methodology_assumptions: Record<string, string>;
}
