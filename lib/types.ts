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
  broker_id: string | null;
  status: EngagementStatus;
  notes: string | null;
  name: string | null;
  client_notes: string | null;
  compliance_notes: string | null;
  email_notes: string | null;
  created_at: string;
  updated_at: string;
  buyer?: Profile;
  broker?: Profile;
  files?: EngagementFile[];
}

export interface EngagementFile {
  id: string;
  engagement_id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
}
