export type MediaType = 'photo' | 'video';

export interface Dancer {
  id: string;
  handle: string;
  display_name: string;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  years_experience: number | null;
  instagram: string | null;
  tiktok: string | null;
  of_handle: string | null;
  nil_verified: boolean;
  nil_state: string | null;
  nil_status: string | null;
  parental_consent: boolean;
  is_published: boolean;
  created_at: string;
}

export interface DancerStyle {
  id: string;
  dancer_id: string;
  style_name: string;
}

export interface DancerService {
  id: string;
  dancer_id: string;
  name: string;
  description: string | null;
  price_label: string | null;
  icon: string | null;
  sort_order: number;
}

export interface DancerMedia {
  id: string;
  dancer_id: string;
  url: string;
  media_type: MediaType;
  is_featured: boolean;
  sort_order: number;
}

export interface DancerReview {
  id: string;
  dancer_id: string;
  reviewer_name: string | null;
  reviewer_role: string | null;
  body: string | null;
  rating: number | null;
  created_at: string;
}

export interface BookingRequest {
  id: string;
  dancer_id: string;
  client_name: string;
  client_email: string;
  gig_type: string | null;
  event_date: string | null;
  budget_range: string | null;
  details: string | null;
  status: string;
  created_at: string;
}

interface DancerInsert {
  id?: string;
  handle: string;
  display_name: string;
  location?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  years_experience?: number | null;
  instagram?: string | null;
  tiktok?: string | null;
  of_handle?: string | null;
  nil_verified?: boolean;
  nil_state?: string | null;
  nil_status?: string | null;
  parental_consent?: boolean;
  is_published?: boolean;
  created_at?: string;
}

interface DancerStyleInsert {
  id?: string;
  dancer_id: string;
  style_name: string;
}

interface DancerServiceInsert {
  id?: string;
  dancer_id: string;
  name: string;
  description?: string | null;
  price_label?: string | null;
  icon?: string | null;
  sort_order?: number;
}

interface DancerMediaInsert {
  id?: string;
  dancer_id: string;
  url: string;
  media_type: MediaType;
  is_featured?: boolean;
  sort_order?: number;
}

interface DancerReviewInsert {
  id?: string;
  dancer_id: string;
  reviewer_name?: string | null;
  reviewer_role?: string | null;
  body?: string | null;
  rating?: number | null;
  created_at?: string;
}

interface BookingRequestInsert {
  id?: string;
  dancer_id: string;
  client_name: string;
  client_email: string;
  gig_type?: string | null;
  event_date?: string | null;
  budget_range?: string | null;
  details?: string | null;
  status?: string;
  created_at?: string;
}

type EmptyRel = [];

export interface Database {
  public: {
    Tables: {
      dancers: { Row: Dancer; Insert: DancerInsert; Update: Partial<DancerInsert>; Relationships: EmptyRel };
      dancer_styles: {
        Row: DancerStyle;
        Insert: DancerStyleInsert;
        Update: Partial<DancerStyleInsert>;
        Relationships: EmptyRel;
      };
      dancer_services: {
        Row: DancerService;
        Insert: DancerServiceInsert;
        Update: Partial<DancerServiceInsert>;
        Relationships: EmptyRel;
      };
      dancer_media: {
        Row: DancerMedia;
        Insert: DancerMediaInsert;
        Update: Partial<DancerMediaInsert>;
        Relationships: EmptyRel;
      };
      dancer_reviews: {
        Row: DancerReview;
        Insert: DancerReviewInsert;
        Update: Partial<DancerReviewInsert>;
        Relationships: EmptyRel;
      };
      booking_requests: {
        Row: BookingRequest;
        Insert: BookingRequestInsert;
        Update: Partial<BookingRequestInsert>;
        Relationships: EmptyRel;
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      check_handle_available: { Args: { p_handle: string }; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

export interface DancerWithRelations extends Dancer {
  dancer_styles: DancerStyle[];
  dancer_services: DancerService[];
  dancer_media: DancerMedia[];
  dancer_reviews: DancerReview[];
}
