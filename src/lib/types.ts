export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  created_at: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  source_document: string;
  contact_if_unsure: string;
  embedding?: number[];
  created_at?: string;
  updated_at?: string;
  similarity?: number;
}

export interface QueryCacheEntry {
  id: string;
  question_text: string;
  question_embedding: number[];
  cached_answer: string;
  source_ids?: string[];
  hit_count: number;
  created_at: string;
}

export interface QueryLog {
  id: string;
  user_id?: string;
  user_email?: string;
  question: string;
  answer_given: string;
  confidence_score: number;
  sources_used: string[];
  was_escalated: boolean;
  model_used: string;
  tokens_in: number;
  tokens_out: number;
  cost_inr: number;
  served_from_cache: boolean;
  created_at: string;
  escalation_id?: string;
}

export interface Escalation {
  id: string;
  query_id: string;
  question?: string;
  user_email?: string;
  status: 'open' | 'in_progress' | 'resolved';
  assigned_dept: string;
  admin_notes?: string;
  created_at: string;
  resolved_at?: string | null;
}

export interface Room {
  id: string;
  room_name: string;
  building: string;
  floor: string;
  wing: string;
  category?: 'classroom' | 'hostel' | 'admin' | 'facility' | 'mess' | 'sports' | string;
  directions_text: string;
  coordinates?: { x: number; y: number };
  nearest_landmark?: string;
}

export interface AskResponse {
  answer: string;
  confidence: number;
  used_source: string;
  escalate: boolean;
  served_from_cache: boolean;
  model_used: string;
  tokens_in: number;
  tokens_out: number;
  cost_inr: number;
  sources: KnowledgeBaseEntry[];
  query_id?: string;
  escalation_id?: string;
}

export interface Building {
  id: string;
  name: string;
  aka: string;
  type: 'academic' | 'hostel' | 'food' | 'facility' | 'sports' | 'admin' | 'gate' | string;
  lat: number;
  lng: number;
  desc: string;
  verified: boolean;
}

export interface CampusRoom {
  id: string;
  name: string;
  building_id: string;
  floor: string;
  wing: string;
  directions_text: string;
}

export interface CampusGraphNode {
  id: string;
  lat: number;
  lng: number;
  label?: string;
}

export interface CampusGraphEdge {
  from: string;
  to: string;
}

export interface LivePosition {
  lat: number;
  lng: number;
  accuracy: number;
  heading: number | null;
  timestamp: number;
  isFallback: boolean;
}

export interface RouteCalculation {
  distanceMeters: number;
  formattedDistance: string;
  etaMinutes: number;
  formattedEta: string;
  pathCoordinates: [number, number][];
  isArrived: boolean;
  isDirectLine: boolean;
}

