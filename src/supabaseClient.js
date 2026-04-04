import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://utphanmpgnbxzpyyjiwu.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0cGhhbm1wZ25ieHpweXlqaXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyODk3MzgsImV4cCI6MjA5MDg2NTczOH0.7UCfv2mmkUUqV_d1OTAxvnBIig8aX6-g9yNYJzKpgXw"

export const supabase = createClient(supabaseUrl, supabaseKey)
