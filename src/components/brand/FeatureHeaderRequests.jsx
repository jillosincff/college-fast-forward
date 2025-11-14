import { Button } from '@/components/ui/button';
import { PlusCircle, Users, Zap, Heart } from 'lucide-react';

export default function FeatureHeaderRequests({ totalRequests = 0, totalHelpers = 847, onPostRequest }) {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
            <Heart className="w-4 h-4 mr-1" />
            Gator Network Hub
          </div>
          
          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Meet the <span className="text-[#0021A5]">Emerging Gators</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            A dedicated space for students to seek help and for alumni & parents to provide invaluable career support.
          </p>

          {/* CTA Button */}
          <div className="mb-8">
            <Button 
              size="lg" 
              onClick={onPostRequest}
              className="bg-[#FA4616] hover:bg-orange-600 text-white px-8 py-3 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Post a Request for Help
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 text-slate-600">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0021A5]" />
              <span className="font-semibold text-slate-900">{totalRequests}</span>
              <span>Active Requests</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#FA4616]" />
              <span className="font-semibold text-slate-900">{totalHelpers}</span>
              <span>Helpers Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}