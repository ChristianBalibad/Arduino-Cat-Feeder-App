export interface SupabaseConfig {
  supabaseUrl: string;
  supabasePublishableKey: string;
}

const config: SupabaseConfig = {
  supabaseUrl: 'https://your-project-ref.supabase.co',
  supabasePublishableKey: 'your-publishable-key',
};

export default config;
