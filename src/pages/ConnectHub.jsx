import { Loader2, Zap } from 'lucide-react';

export default function ConnectHub() {
  // This is a safe placeholder component to allow the rest of the app to load.
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Rebuilding Connect Hub</h1>
        <p className="text-slate-600 mt-2">
          This feature is being updated. Please check back shortly.
        </p>
        <Loader2 className="w-6 h-6 mx-auto animate-spin text-slate-400 mt-6" />
      </div>
    </div>
  );
}