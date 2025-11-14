import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Quote, Star } from 'lucide-react';

export default function TestimonialCard({ testimonial, index }) {
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('') || 'G';
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ 
        y: -8, 
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        transition: { duration: 0.3 }
      }}
      className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 relative overflow-hidden group cursor-pointer"
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--uf-blue)]/5 to-[var(--uf-orange)]/5 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
      
      {/* Quote Icon */}
      <motion.div 
        className="absolute top-4 right-4 text-[var(--uf-blue)]/20 group-hover:text-[var(--uf-blue)]/40 transition-colors"
        whileHover={{ rotate: 12, scale: 1.1 }}
      >
        <Quote className="w-6 h-6" />
      </motion.div>

      <div className="relative z-10">
        {/* Star Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + i * 0.05 }}
            >
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </motion.div>
          ))}
        </div>

        {/* Testimonial Text */}
        <blockquote className="text-slate-700 mb-4 text-sm leading-relaxed italic group-hover:text-slate-800 transition-colors">
          "{testimonial.text}"
        </blockquote>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <Avatar className="w-10 h-10 border-2 border-white shadow-md">
              <AvatarImage src={testimonial.avatar} alt={`${testimonial.name}'s avatar`} />
              <AvatarFallback className={`${getAvatarColor(testimonial.name)} text-white font-semibold text-sm`}>
                {getInitials(testimonial.name)}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          <div className="flex-1">
            <motion.p 
              className="font-semibold text-slate-900 text-sm"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              {testimonial.name}
            </motion.p>
            <div className="flex items-center gap-2">
              <p className="text-slate-500 text-xs">{testimonial.role}</p>
              {testimonial.gradYear && (
                <Badge variant="outline" className="text-xs py-0 px-2 h-5 bg-[var(--uf-blue)]/10 text-[var(--uf-blue)] border-[var(--uf-blue)]/20">
                  '{testimonial.gradYear}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Success Type Badge */}
        {testimonial.successType && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="mt-3"
          >
            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs font-medium">
              ✨ {testimonial.successType}
            </Badge>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}