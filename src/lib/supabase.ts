import { createClient } from '@supabase/supabase-js'
import { Upload, UserSettings } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

// For demo purposes, create a mock client if no real credentials
let supabase: any

try {
  if (supabaseUrl !== 'https://demo.supabase.co' && supabaseAnonKey !== 'demo-key') {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } else {
    // Mock Supabase client for demo
    supabase = {
      auth: {
        signUp: async () => ({ data: { user: { id: 'demo-user', email: 'demo@example.com' } }, error: null }),
        signInWithPassword: async () => ({ data: { user: { id: 'demo-user', email: 'demo@example.com' } }, error: null }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    }
  }
} catch (error) {
  // Fallback mock client
  supabase = {
    auth: {
      signUp: async () => ({ data: { user: { id: 'demo-user', email: 'demo@example.com' } }, error: null }),
      signInWithPassword: async () => ({ data: { user: { id: 'demo-user', email: 'demo@example.com' } }, error: null }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  }
}

export { supabase }

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// Database helpers
export const db = {
  // Upload operations
  createUpload: async (uploadData: Omit<Upload, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('uploads')
      .insert(uploadData)
      .select()
      .single()
    return { data, error }
  },

  getUploads: async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  getUpload: async (id: string) => {
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  updateUpload: async (id: string, updates: Partial<Upload>) => {
    const { data, error } = await supabase
      .from('uploads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  deleteUpload: async (id: string) => {
    const { error } = await supabase
      .from('uploads')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Favorites operations
  addToFavorites: async (userId: string, uploadId: string) => {
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, upload_id: uploadId })
      .select()
      .single()
    return { data, error }
  },

  removeFromFavorites: async (userId: string, uploadId: string) => {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .match({ user_id: userId, upload_id: uploadId })
    return { error }
  },

  getFavorites: async (userId: string) => {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        uploads (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // User settings operations
  getUserSettings: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  updateUserSettings: async (userId: string, settings: Partial<UserSettings>) => {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    return { data, error }
  },
}

// Storage helpers
export const storage = {
  uploadFile: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })
    return { data, error }
  },

  deleteFile: async (bucket: string, paths: string[]) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths)
    return { data, error }
  },

  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  },

  downloadFile: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)
    return { data, error }
  },
}

export default supabase