import React from 'react'
import { Button } from "@/components/ui/button";
import { Users, Zap, PlusCircle } from "lucide-react";
import { navigate } from "@/components/utils/navigation";

export default function ConnectionsHero({ totalRequests = 132, totalHelpers = 847, onPostRequest }) {
    const scrollDown = () => {
        const feed = document.getElementById('requests-feed');
        if (feed) {
            feed.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return <div
        className="relative bg-gradient-to-br from-[#0021A5] to-[#FA4616] text-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative z-10">
            <div
                className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                Gator Network Hub
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                Meet the <span className="opacity-90">Emerging Gators</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-white opacity-90">
                A dedicated space for students to seek help and for alumni & parents to provide invaluable career support.
            </p>
            
            {/* New CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={onPostRequest} 
                className="bg-white text-[#FA4616] hover:bg-white/90 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all w-full sm:w-auto"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Post a Request for Help
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={scrollDown}
                className="rounded-full border-white text-white hover:bg-white/10 w-full sm:w-auto"
              >
                Browse Requests
              </Button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-x-8 gap-y-4 flex-wrap">
                <div className="flex items-center gap-2 text-white font-medium bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Users className="w-5 h-5"/>
                    <span><span className="font-bold">{totalRequests}</span> Active Requests</span>
                </div>
                <div className="flex items-center gap-2 text-white font-medium bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Zap className="w-5 h-5"/>
                    <span><span className="font-bold">{totalHelpers}</span> Helpers Online</span>
                </div>
            </div>
        </div>
    </div>
}