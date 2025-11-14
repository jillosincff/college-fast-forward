
import { motion } from 'framer-motion';
import { Target, BookText, Sparkles, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthContext';

export default function About() {
  const { login } = useAuth();
  
  const handleGetStarted = () => {
    login();
  };

  const sections = [
    {
      icon: Target,
      title: "Our Mission",
      content: "At College Fast Forward, our mission is to ease the transition from campus to career by connecting University of Florida students, alumni, and parents in a collaborative network. We believe that when Gators come together, they empower one another to succeed in internships, first jobs, and finding the right living situation."
    },
    {
      icon: BookText,
      title: "Our Story",
      content: "College Fast Forward was born out of a simple observation: parents of UF students are eager to help but often don't know how to tap into their own networks effectively. As a mom of two UF graduates and a seasoned recruiting professional with over 20 years of experience, our founder recognized the power of alumni-to-student connections and set out to create a platform that makes introductions, mentorship, and support seamless."
    },
    {
      icon: Sparkles,
      title: "Why It Matters",
      content: "Navigating life after UF can feel overwhelming—securing internships, landing a first job, and finding the right housing are significant milestones. Our platform empowers each member of the Gator community to contribute their expertise, open doors, and share advice, creating a self-sustaining ecosystem of support."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Section with Gradient */}
      <section className="bg-gradient-to-r from-[var(--uf-blue)] to-[var(--uf-orange)] text-white text-center py-20 px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Our Mission
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl max-w-3xl mx-auto opacity-90"
        >
          To bridge the gap between graduation and career success by leveraging the power of the global Gator network.
        </motion.p>
      </section>

      {/* Content sections */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        <div className="space-y-12">
          {/* Mission & Story sections */}
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <section.icon className="w-5 h-5 text-[var(--uf-blue)]" />
                    </div>
                    <CardTitle>{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">{section.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Founder Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm overflow-hidden">
              <div className="grid md:grid-cols-3">
                <div className="md:col-span-1 bg-gradient-to-br from-[var(--uf-blue)] to-[var(--uf-orange)] p-8 flex flex-col items-center justify-center text-white">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ffd533cd4_image.png"
                    alt="Jill Osinoff, Founder & Gator Mom"
                    className="w-28 h-28 rounded-full object-cover mb-4 border-4 border-white/30 shadow-lg"
                  />
                  <h3 className="text-2xl font-bold">Jill Osinoff</h3>
                  <p className="text-blue-200">Founder & Gator Mom</p>
                </div>
                <div className="md:col-span-2 p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Meet the Founder</h2>
                  <p className="text-slate-700 leading-relaxed">
                    Jill Osinoff is a proud Gator mom and an expert recruiter with two decades of agency and in-house experience. Her passion lies in bringing people together and creating meaningful connections. She knows firsthand how a single introduction can change a student's career trajectory—and she built College Fast Forward to make that process intuitive and impactful.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
          
          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-[var(--uf-orange)] to-orange-500 text-white text-center">
              <CardContent className="p-8">
                <Handshake className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Join Our Community</h2>
                <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
                  Whether you're a current student seeking guidance, an alum offering expertise, or a parent ready to recommend opportunities, College Fast Forward is your hub for leveraging the power of the UF network.
                </p>
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="bg-white text-[var(--uf-orange)] hover:bg-orange-50 font-bold px-8 py-3"
                >
                  Get Started Today
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
