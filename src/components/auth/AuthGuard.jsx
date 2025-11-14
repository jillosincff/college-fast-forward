import { useAuth } from "./AuthContext";

// Simplified AuthGuard that just uses ProtectedRoute logic
export default function AuthGuard({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-[var(--uf-blue)] rounded-full animate-pulse mb-4 mx-auto" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
}