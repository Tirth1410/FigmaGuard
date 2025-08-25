import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Create a single Supabase client for the client-side
const supabase = createClientComponentClient()

export default supabase
