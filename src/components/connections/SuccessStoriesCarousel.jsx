
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sparkles,
  ArrowRight, // New import
  Quote // New import
} from 'lucide-react';
import { motion } from 'framer-motion';
import { navigate } from '@/components/utils/navigation'; // New import
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'; // New imports

// This is a temporary workaround. In a real app, SuccessStory would be imported.
const SuccessStory = {
  filter: async () => [], // Return an empty array to avoid errors
};

// Fallback stories data (new, based on the outline's structure)
const fallbackStories = [
  {
    id: 1,
    story_text: 'Thanks to Sarah (UF \'19), I landed my dream SWE internship at Google! Her mock interviews and referral changed everything. 🚀',
    user_name: 'Alex Chen',
    user_role: 'UF \'24',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    story_type: 'Internship',
    is_approved: true,
    created_date: '2023-01-15T10:00:00Z',
  },
  {
    id: 2,
    story_text: 'A UF parent connected me with their Goldman Sachs contact. Three interviews later, I got the offer! Gator network is unreal. 💼',
    user_name: 'Maria Rodriguez',
    user_role: 'UF \'23',
    photo_url: null,
    story_type: 'Job Offer',
    is_approved: true,
    created_date: '2023-03-20T11:30:00Z',
  },
  {
    id: 3,
    story_text: 'Met my co-founder through a Gator connection! We just raised our Series A. Sometimes one intro changes your life forever. 🦄',
    user_name: 'Jordan Kim',
    user_role: 'UF \'22',
    photo_url: null,
    story_type: 'Funding',
    is_approved: true,
    created_date: '2023-05-01T14:45:00Z',
  },
  {
    id: 4,
    story_text: 'The mentorship program helped me pivot my career. Landed a role I love!',
    user_name: 'Emily Davis',
    user_role: 'UF \'20 Alumna',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b293c8?w=80&h=80&fit=crop&crop=face',
    story_type: 'Mentorship',
    is_approved: true,
    created_date: '2023-06-10T09:00:00Z',
  },
  {
    id: 5,
    story_text: 'Found my passion in non-profit work thanks to a connection from the platform!',
    user_name: 'Daniel Lee',
    user_role: 'UF \'25',
    photo_url: null,
    story_type: 'Networking',
    is_approved: true,
    created_date: '2023-07-05T16:20:00Z',
  }
];

// Helper functions for story type display
const getStoryTypeColor = (type) => {
  switch (type) {
    case 'Internship':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Job Offer':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Funding':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Mentorship':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Networking':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

const getStoryTypeText = (type) => {
  // Simple capitalization for display
  return type.charAt(0).toUpperCase() + type.slice(1);
};


export default function SuccessStoriesCarousel({ onShareStory }) {
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // New state

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      // Assuming SuccessStory.filter is an API call or ORM method
      // For a real scenario, ensure SuccessStory is correctly imported or defined.
      const approvedStories = await SuccessStory.filter({ is_approved: true }, '-created_date', 10);
      setStories(approvedStories.length > 0 ? approvedStories : fallbackStories);
    } catch (error) {
      console.error("Failed to load stories, using fallback data:", error);
      setStories(fallbackStories);
    } finally {
      setIsLoading(false);
    }
  };

  const carouselRef = useRef(null); // New ref

  if (isLoading) {
    return <div className="h-48 bg-slate-200 rounded-lg animate-pulse" />;
  }

  // The original component's outer structure has been completely replaced by the new Carousel structure.
  // The onShareStory prop is no longer used in the provided outline's JSX.

  return (
    <div className="relative py-12 bg-gradient-to-r from-slate-50 to-blue-50"> {/* Added outer styling */}
      <div className="max-w-7xl mx-auto px-4"> {/* Added content wrapper */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-3"
          >
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h2 className="text-3xl font-bold text-slate-900">Success Stories</h2>
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </motion.div>
          <p className="text-slate-600">Real wins from real Gators</p>
        </div>

        <div className="relative">
          <Carousel
            ref={carouselRef}
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {stories.map((story) => (
                <CarouselItem key={story.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full">
                    <CardContent className="flex flex-col h-full p-6">
                      <div className="flex-grow">
                        <Quote className="w-6 h-6 text-slate-300 mb-3" />
                        <p className="text-slate-700 mb-4 text-sm leading-relaxed line-clamp-3">
                          "{story.story_text}"
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between"> {/* Adjusted margin-top for spacing */}
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={story.photo_url || `https://avatar.vercel.sh/${story.user_name}`} alt={story.user_name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                                {story.user_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{story.user_name}</p>
                            <p className="text-xs text-slate-500">{story.user_role || 'Gator User'}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-xs ${getStoryTypeColor(story.story_type)}`}>
                          {getStoryTypeText(story.story_type)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Navigation arrows (optional, Embla Carousel can have its own navigation) */}
            {/* This outline did not explicitly include next/prev buttons for the new carousel, but they can be added */}
          </Carousel>

          <div className="absolute -bottom-4 right-0 flex items-center gap-2"> {/* Positioning adjusted */}
            <Button variant="link" size="sm" className="text-blue-600 hover:text-blue-700" onClick={() => navigate('SuccessStories')}>
              See More Stories <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
