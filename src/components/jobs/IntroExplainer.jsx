import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PenSquare, MessageSquare, Handshake } from 'lucide-react';

export default function IntroExplainer() {

  const howItWorksSteps = [
    { 
      number: 1, 
      text: "Post a Request", 
      icon: PenSquare,
      example: "I'm looking for a summer internship in Marketing."
    },
    { 
      number: 2, 
      text: "A Helper Reaches Out", 
      icon: MessageSquare,
      example: "UF alumni, parents, or peers step up—'I know a Marketing Manager and can make an intro!'"
    },
    { 
      number: 3, 
      text: "Get Connected", 
      icon: Handshake,
      example: "Your intro is sent—now go grab that internship!"
    }
  ];

  return (
    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200/80 mb-8">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger className="text-lg font-semibold text-slate-800 hover:no-underline">
            How does this work?
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {howItWorksSteps.map((step) => (
                  <div key={step.number} className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                      <step.icon className="w-8 h-8 text-[var(--uf-blue)]" />
                    </div>
                    <h3 className="text-md font-semibold text-slate-800 mb-2">{step.number}. {step.text}</h3>
                    <p className="text-sm text-gray-600 italic">"{step.example}"</p>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="gator-network">
          <AccordionTrigger className="text-lg font-semibold text-slate-800 hover:no-underline">
            What is the Gator Network?
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-4 text-slate-700">
               <p>Your Gator Network is your superpower. It's a community of over 70,000 students, alumni, and parents who are ready and willing to help you succeed. You can get two types of help:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-bold text-green-700 mb-2">Direct Help</h4>
                    <p className="text-sm italic">"I'm a hiring manager and can help you directly!"</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-bold text-purple-700 mb-2">Indirect Help</h4>
                    <p className="text-sm italic">"My cousin owns a software company. Let me introduce you."</p>
                  </div>
                </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}