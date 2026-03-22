/**
 * supabaseClient.js
 * Single Supabase client instance shared across all services.
 *
 * Setup:
 *   1. npm install @supabase/supabase-js
 *   2. Create .env file in project root with the two variables below
 *   3. Import { supabase } from './supabaseClient' in each service file
 *
 * Find your keys in Supabase Dashboard → Project → Settings → API
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL    = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON   = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
