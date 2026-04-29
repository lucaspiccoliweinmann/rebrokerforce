export type Role = "admin" | "buyer" | "broker";
export type EngagementStatus = "pending" | "active" | "closed";

export interface Profile {
  id: string;
  full_name: string | null;
  role: Role;
  avatar_url: string | null;
  created_at: string;
}

export interface Engagement {
  id: string;
  buyer_id: string;
  broker_id: string;
  status: EngagementStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  buyer?: Profile;
  broker?: Profile;
}
