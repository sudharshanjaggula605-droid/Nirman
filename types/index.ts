export type UserRole = 'admin' | 'owner' | 'contractor';
export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'blocked';
export type ProjectStatus = 'draft' | 'tender' | 'awarded' | 'active' | 'completed' | 'cancelled';
export type TenderStatus = 'draft' | 'active' | 'closing_soon' | 'closed' | 'awarded' | 'cancelled' | 'completed';
export type BidStatus = 'pending' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';
export type PaymentStatus =
  | 'CREATED'
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PENDING_VERIFICATION'
  | 'DISPUTED'
  | 'pending'
  | 'paid'
  | 'rejected'
  | 'approved';

export type PaymentType = 'CONTRACTOR_SELECTION_FEE' | 'PROJECT_MILESTONE' | 'ESCROW_DEPOSIT';
export type PaymentMethod = 'qr' | 'upi' | 'card' | 'netbanking' | 'static_qr' | 'wallet' | 'other';

export interface PaymentRecord {
  id: string;
  project_id: string;
  owner_id: string;
  contractor_id: string;
  tender_id?: string | null;
  bid_id?: string | null;
  payment_type: PaymentType | string;
  amount: number;
  currency: string;
  payment_method?: PaymentMethod | string | null;
  payment_gateway?: string;
  gateway_order_id?: string | null;
  gateway_payment_id?: string | null;
  gateway_signature?: string | null;
  status: PaymentStatus;
  failure_reason?: string | null;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
  project?: Project;
  owner?: OwnerProfile;
  contractor?: ContractorProfile;
}

export interface ContractorSelectionRecord {
  id: string;
  project_id: string;
  tender_id: string;
  owner_id: string;
  contractor_id: string;
  bid_id: string;
  payment_id?: string | null;
  selection_status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED';
  selected_at?: string | null;
  created_at: string;
}

export interface PaymentSettingsConfig {
  razorpay_enabled: boolean;
  static_qr_enabled: boolean;
  static_qr_image: string;
  upi_id: string;
  display_name: string;
  payment_instructions: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: AccountStatus;
  avatar_url?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OwnerProfile extends Profile {
  company_name?: string | null;
  identity_document_url?: string | null;
}

export interface ContractorProfile extends Profile {
  company_name: string;
  contact_person: string;
  gst_number?: string | null;
  pan_number?: string | null;
  license_number?: string | null;
  years_of_experience: number;
  description?: string | null;
  logo_url?: string | null;
  license_document_url?: string | null;
  certificate_document_url?: string | null;
  website_url?: string | null;
  average_rating: number;
  total_reviews: number;
  total_projects: number;
}

export interface ProjectCategory {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  category_id?: string | null;
  title: string;
  description?: string | null;
  property_type?: string | null;
  area_sqft: number;
  estimated_budget: number;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  start_date?: string | null;
  expected_completion_date?: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  owner?: OwnerProfile;
  category?: ProjectCategory;
  images?: ProjectImage[];
  documents?: ProjectDocument[];
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  storage_path: string;
  display_order: number;
  created_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  file_name: string;
  file_url: string;
  storage_path: string;
  file_type?: string | null;
  file_size?: number | null;
  uploaded_by?: string | null;
  created_at: string;
}

export interface Tender {
  id: string;
  project_id: string;
  owner_id: string;
  title: string;
  description?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  bid_deadline: string;
  status: TenderStatus;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  project?: Project;
  owner?: OwnerProfile;
  bids_count?: number;
  documents?: TenderDocument[];
  images?: TenderImage[];
}

export interface TenderDocument {
  id: string;
  tender_id: string;
  file_name: string;
  file_url: string;
  storage_path: string;
  file_type?: string | null;
  file_size?: number | null;
  created_at: string;
}

export interface TenderImage {
  id: string;
  tender_id: string;
  image_url: string;
  storage_path: string;
  display_order: number;
  created_at: string;
}

export interface Bid {
  id: string;
  tender_id: string;
  contractor_id: string;
  quotation_amount: number;
  estimated_completion_days: number;
  proposed_start_date?: string | null;
  proposal: string;
  additional_notes?: string | null;
  status: BidStatus;
  submitted_at: string;
  updated_at: string;
  contractor?: ContractorProfile;
  tender?: Tender;
  cost_breakdown?: BidCostBreakdown;
}

export interface BidCostBreakdown {
  id: string;
  bid_id: string;
  material_cost: number;
  labour_cost: number;
  equipment_cost: number;
  other_cost: number;
  total_cost: number;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  completion_percentage: number;
  status: MilestoneStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  milestone_id?: string | null;
  contractor_id: string;
  title: string;
  description?: string | null;
  progress_percentage?: number | null;
  created_at: string;
  images?: ProjectUpdateImage[];
}

export interface ProjectUpdateImage {
  id: string;
  project_update_id: string;
  image_url: string;
  storage_path: string;
  created_at: string;
}

export interface Review {
  id: string;
  project_id: string;
  owner_id: string;
  contractor_id: string;
  rating: number;
  review?: string | null;
  created_at: string;
  owner?: OwnerProfile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  reference_id?: string | null;
  is_read: boolean;
  created_at: string;
}
