import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Konfigurasi koneksi Supabase
const SUPABASE_URL = "https://maikfopdotviwslpjpxj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Ao8bBrBUz2hjOcXQyaXIQw_-JRLwrjG";

// Membuat koneksi database
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

console.log("Koneksi Supabase berhasil disiapkan!");
