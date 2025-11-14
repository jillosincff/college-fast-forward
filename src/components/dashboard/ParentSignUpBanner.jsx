import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";

export default function ParentSignUpBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, y: -20, marginBottom: 0 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-r from-[var(--uf-orange)]/10 via-transparent to-[var(--uf-blue)]/5 border-2 border-[var(--uf-orange)]/30 relative">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--uf-orange)] rounded-full flex items-center justify-center text-white">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Are you a UF Parent?</h3>
                <p className="text-slate-600 text-sm">Join the network to help your Gator succeed by adding your connections.</p>
              </div>
            </div>
            <Link to={createPageUrl("Profile")}>
              <Button variant="outline" className="border-[var(--uf-orange)] text-[var(--uf-orange)] hover:bg-[var(--uf-orange)]/10">
                Go to Profile to Identify as Parent
              </Button>
            </Link>
          </CardContent>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 w-7 h-7 text-slate-500 hover:bg-slate-100/80"
            aria-label="Dismiss parent sign-up banner"
          >
            <X className="w-4 h-4" />
          </Button>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}