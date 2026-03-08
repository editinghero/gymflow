export type UserRole = 'owner' | 'customer';

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  access_code: string;
  location?: string;
  website?: string;
  contact_phone?: string;
  upi_id?: string;
  created_at: string;
}

export interface Member {
  id: string;
  user_id?: string;
  business_id: string;
  plan_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  status: string;
  start_date: string;
  end_date?: string;
  created_at: string;
}

export interface Plan {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface Schedule {
  id: string;
  business_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_open: boolean;
  created_at: string;
}

export interface Holiday {
  id: string;
  business_id: string;
  date: string;
  reason?: string;
  created_at: string;
}

export interface CheckIn {
  id: string;
  member_id: string;
  business_id: string;
  check_in_time: string;
  check_out_time?: string;
  duration_minutes?: number;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}
