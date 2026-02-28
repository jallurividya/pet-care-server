import { supabase } from "../config/SupabaseConfig.js"
export async function checkDBConnection() {
    try {
        const { error } = await supabase.from("app_users").select().limit(1)
        if (error) throw error
        console.log("Database Connected Successfully")
        return true
    } catch (error) {
        console.log("Database Connection Failed", error.message)
        return false
    }
}