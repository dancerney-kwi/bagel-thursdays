export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      bagel_submissions: {
        Row: {
          id: string;
          browser_id: string;
          user_name: string | null;
          bagel_type: string;
          custom_bagel: string | null;
          week_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          browser_id: string;
          user_name?: string | null;
          bagel_type: string;
          custom_bagel?: string | null;
          week_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          browser_id?: string;
          user_name?: string | null;
          bagel_type?: string;
          custom_bagel?: string | null;
          week_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      spread_requests: {
        Row: {
          id: string;
          browser_id: string;
          spread_name: string;
          week_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          browser_id: string;
          spread_name: string;
          week_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          browser_id?: string;
          spread_name?: string;
          week_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      bagel_tallies: {
        Row: {
          week_id: string;
          bagel_type: string;
          count: number;
        };
      };
    };
    Functions: {
      get_current_week_tallies: {
        Args: {
          current_week_id: string;
        };
        Returns: {
          bagel_type: string;
          count: number;
        }[];
      };
      get_known_users: {
        Args: Record<string, never>;
        Returns: {
          user_name: string;
        }[];
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
}

export type BagelSubmission = Database['public']['Tables']['bagel_submissions']['Row'];
export type BagelSubmissionInsert = Database['public']['Tables']['bagel_submissions']['Insert'];
export type SpreadRequest = Database['public']['Tables']['spread_requests']['Row'];
export type SpreadRequestInsert = Database['public']['Tables']['spread_requests']['Insert'];
