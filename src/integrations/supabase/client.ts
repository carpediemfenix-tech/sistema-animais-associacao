import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xsslmpwwatskrfzuskua.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzc2xtcHd3YXRza3JmenVza3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Nzc0MzEsImV4cCI6MjA3ODU1MzQzMX0.FRIMyRDWGR7rxX_HgSAXUemaNItkQhACDdcawrYHJgk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import the supabase client like this:
// For React:
// import { supabase } from "@/integrations/supabase/client";
// For React Native:
// import { supabase } from "@/src/integrations/supabase/client";
