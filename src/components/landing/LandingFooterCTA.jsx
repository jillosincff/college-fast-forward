import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const faqItems = [
  { q: "What if I don't have time?", a: "No pressure. Even 10 minutes a month earns karma and keeps your student visible to other families." },
  { q: "Is this just for certain majors?", a: "No — parents in tech, finance, healthcare, law, consulting, and more. Whatever your kid needs, someone here can help." },
  { q: "How is this different from LinkedIn?", a: "LinkedIn is cold outreach to strangers. This is warm intros from people who already want to help — because you're part of the same UF family." },
  { q: "Can I cancel anytime?", a: "Founding members are free forever. After 1,000, it's $9/mo — cancel anytime." },
  { q: "Why free for the first 1,000?", a: "Founding members are building this together. In exchange for being early, you get free access forever." },
  { q: "What if my student doesn't know what to target?", a: "FASTIQ guides them step-by-step based on interests and major, then surfaces alumni who can open doors." },
];

export default function LandingFooterCTA({ stats, onClaim, onFAQ, showFAQ }) {
  return (
    <>
      {/* Main CTA block */}
      <section className="py-20 sm:py-24 px-4" style={{ backgroundColor: '#0021A5' }}>
        <div className="max-w-md mx-auto text-center">
          <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-[#FA4616] font-bold text-xl sm:text-2xl mb-6">
              🔥 {stats.spots_left} FREE founding spots left — claim yours before they're gone.
            </p>

            <Button
              onClick={onClaim}
              size="lg"
              className="bg-white text-[#0021A5] hover:bg-slate-100 w-full py-6 text-lg font-bold min-h-[56px]"
              style={{ boxShadow: '0 4px 30px rgba(255,255,255,0.15)' }}
            >
              Claim Your Free Spot
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-white/50 text-xs mt-4">Founding members stay free forever.</p>

            <button
              onClick={onFAQ}
              className="mt-10 text-white/40 text-sm underline underline-offset-4 hover:text-white/60 transition-colors"
              style={{ minHeight: 'auto', minWidth: 'auto' }}
            >
              Questions?
            </button>
          </motion.div>
        </div>
      </section>

      {/* FAQ — toggleable */}
      {showFAQ && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">Questions</h3>
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border rounded-xl px-5">
                  <AccordionTrigger className="text-left font-semibold text-slate-900 text-sm hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-sm">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}
    </>
  );
}