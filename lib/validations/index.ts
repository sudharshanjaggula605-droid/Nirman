import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.enum(["owner", "contractor"]),
  company_name: z.string().optional(),
  contact_person: z.string().optional(),
  gst_number: z.string().optional(),
  license_number: z.string().optional(),
});

export const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category_id: z.string().uuid("Please select a project category"),
  property_type: z.string().min(2, "Property type required"),
  area_sqft: z.coerce.number().positive("Area must be positive"),
  estimated_budget: z.coerce.number().positive("Budget must be positive"),
  location: z.string().min(3, "Location required"),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  pincode: z.string().min(6, "Pincode required"),
  start_date: z.string().optional(),
  expected_completion_date: z.string().optional(),
  bid_deadline: z.string().min(1, "Bid deadline is required"),
});

export const bidSchema = z.object({
  tender_id: z.string().uuid(),
  quotation_amount: z.coerce.number().positive("Quotation must be greater than 0"),
  estimated_completion_days: z.coerce.number().positive("Timeline days required"),
  proposed_start_date: z.string().optional(),
  proposal: z.string().min(20, "Proposal details must be at least 20 characters"),
  material_cost: z.coerce.number().min(0).default(0),
  labour_cost: z.coerce.number().min(0).default(0),
  equipment_cost: z.coerce.number().min(0).default(0),
  other_cost: z.coerce.number().min(0).default(0),
  additional_notes: z.string().optional(),
});

export const reviewSchema = z.object({
  project_id: z.string().uuid(),
  contractor_id: z.string().uuid(),
  rating: z.coerce.number().min(1).max(5),
  review: z.string().min(5, "Review comment required"),
});
