export const isUserAdmin = async (supabase: any, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from("admin_users").select("*").eq("user_id", userId).single()

    if (error) return false
    return !!data
  } catch {
    return false
  }
}

export const makeUserAdmin = async (supabase: any, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("admin_users").insert([
      {
        user_id: userId,
        created_at: new Date().toISOString(),
      },
    ])

    return !error
  } catch {
    return false
  }
}

export const removeAdminRole = async (supabase: any, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("admin_users").delete().eq("user_id", userId)

    return !error
  } catch {
    return false
  }
}
