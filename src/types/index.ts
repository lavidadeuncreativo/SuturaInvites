// ── Data Models ────────────────────────────────────────────────

// --- SaaS TYPES ---
export interface User {
  id: string;
  email: string;
  fullname: string;
  projects: string[]; // project IDs
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  is_paid: boolean;
  settings: WeddingSettings;
}

// --- CORE MODELS ---
export type AttendingStatus = 'confirmado' | 'pendiente' | 'no_asistira' | 'seguimiento';
export type BudgetStatus = 'pendiente' | 'pagado' | 'vencido';
export type VendorContractStatus = 'cotizando' | 'por_confirmar' | 'confirmado' | 'pagado' | 'pendiente' | 'cancelado';

export interface Guest {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  attending_status: AttendingStatus;
  plus_one_count: number;
  companion_names: string;
  lodging_needed: boolean;
  dietary_notes: string;
  guest_message: string;
  table_assignment: string;
  seat_assignment?: string; // New: specific chair ID
  admin_notes: string;
  created_at: string;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  tier: 'featured' | 'premium' | 'media' | 'accesible';
  whatsapp_number: string;
  website: string;
  price_range: string;
  distance: string;
  notes: string;
  active: boolean;
}

export interface BudgetItem {
  id: string;
  category: string;
  vendor_name: string;
  concept: string;
  total_amount: number;
  deposit_amount: number;
  remaining_amount: number;
  due_date: string;
  recurring_type: 'unico' | 'mensual' | 'parcialidad';
  status: BudgetStatus;
  notes: string;
}

export interface Vendor {
  id: string;
  category: string;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  contract_status: VendorContractStatus;
  payment_status: BudgetStatus;
  due_date: string;
  notes: string;
  link: string;
  priority: 'alta' | 'media' | 'baja';
}

export interface Message {
  id: string;
  guest_name: string;
  message: string;
  approved: boolean;
  created_at: string;
}

export interface Chair {
  id: string;
  label: string;
  rotation: number;
  guest_name?: string;
}

export type LayoutItemType = 'table_round' | 'table_rect' | 'dance_floor' | 'stage' | 'entrance' | 'bar' | 'buffet' | 'label' | 'special';
export type ElementShape = 'circle' | 'rect' | 'square' | 'capsule';

export interface LayoutItem {
  id: string;
  type: LayoutItemType;
  shape: ElementShape;
  x: number;
  y: number;
  width: number; // px on canvas
  height: number;
  width_cm: number; // real cm
  height_cm: number; // real cm
  rotation: number;
  label: string;
  capacity: number;
  assigned_guests: string[];
  chairs?: Chair[];
  notes: string;
  color?: string;
}

export interface WeddingSettings {
  song_url: string;
  wedding_date: string;
  ceremony_time: string;
  reception_time: string;
  ceremony_venue: string;
  ceremony_address: string;
  ceremony_maps_url: string;
  reception_venue: string;
  reception_address: string;
  reception_maps_url: string;
  parent_bride_father: string;
  parent_bride_mother: string;
  parent_groom_father: string;
  parent_groom_mother: string;
  dress_code_note: string;
  registry_amazon: string;
  registry_ml: string;
  registry_palacio: string;
  rsvp_max_guests: number;
  notification_email: string;
}
