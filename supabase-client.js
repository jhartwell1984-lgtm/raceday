import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://sjpyujtyksjuodxzuhye.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_vcQ7jvm3nKvcpbqT-c-phw_mVbxmyb1';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
