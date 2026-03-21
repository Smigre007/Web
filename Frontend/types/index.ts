export type ProjectType =
  | "website"
  | "webapp"
  | "mobile"
  | "saas"
  | "landing"
  | "dashboard"
  | "api"
  | "automation"
  | "platform";

export type ProjectStatus = "generating" | "completed" | "error" | "draft";

export interface Project {
  id: string;
  user_clerk_id: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  prompt: string;
  generated_code: GeneratedCode | null;
  tech_stack: string[];
  created_at: string;
  updated_at: string;
}

export interface GeneratedCode {
  files: CodeFile[];
  preview_url?: string;
  preview_html?: string;
  tech_stack: string[];
  features: string[];
  architecture: string;
  summary?: string;
  instructions?: string;
  next_steps?: string[];
}

export interface CodeFile {
  path: string;
  content: string;
  language: string;
  description: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  project_id?: string;
}

export interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: {
    projects: number;
    generations_per_month: number;
    ai_requests_per_month: number;
  };
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
}

export interface UserSubscription {
  plan_id: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  current_period_end: string;
  generations_used: number;
}
