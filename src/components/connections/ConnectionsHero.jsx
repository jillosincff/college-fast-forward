import { Button } from "@/components/ui/button"; // Changed to shadcn button for consistency
import { Users, Zap, PlusCircle } from "lucide-react"; // Added PlusCircle icon

export default function ConnectionsHero({ totalRequests = 132, totalHelpers = 847, onPostRequest }) {
    const scrollDown = () => {
        const feed = document.getElementById('requests-feed');
        if (feed) {
            feed.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return <div
        className="relative bg-gradient-to-br from-blue-50 via-white to-orange-50 text-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] opacity-20"></div>

        <div className="relative z-10">
            <div
                className="inline-block bg-blue-100 text-gator-blue px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                Gator Network Hub
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
                Meet the <span className="text-gator-blue">Emerging Gators</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-slate-600">
                A dedicated space for students to seek help and for alumni & parents to provide invaluable career support.
            </p>
            
            {/* New CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={onPostRequest} 
                className="bg-[#FA4616] hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all w-full sm:w-auto"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Post a Request for Help
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={scrollDown}
                className="rounded-full bg-white/50 backdrop-blur-sm w-full sm:w-auto"
              >
                Browse Requests
              </Button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-x-8 gap-y-4 flex-wrap">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <Users className="w-5 h-5 text-gator-blue"/>
                    <span><span className="font-bold text-slate-800">{totalRequests}</span> Active Requests</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <Zap className="w-5 h-5 text-gator-orange"/>
                    <span><span className="font-bold text-slate-800">{totalHelpers}</span> Helpers Online</span>
                </div>
            </div>
        </div>
    </div>
}