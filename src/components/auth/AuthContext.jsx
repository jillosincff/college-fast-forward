// Re-export from the canonical AuthContext so all imports point to the same instance.
// App.jsx wraps with AuthProvider from @/lib/AuthContext — this ensures useAuth()
// from either path finds the same context and doesn't return null.
export { AuthProvider, useAuth } from '@/lib/AuthContext';