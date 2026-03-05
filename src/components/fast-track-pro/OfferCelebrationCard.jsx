import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, Pencil, X, Trophy, DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import SuggestedActions from './SuggestedActions';

export default function OfferCelebrationCard({ data, onSendMessage }) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [editedScript, setEditedScript] = useState(data?.negotiation_script || data?.sample_script || '');

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!data) return null;

  const comparison = data.market_comparison || 'at_market';
  const comparisonConfig = {
    above_market: { icon: TrendingUp, label: 'Above Market', color: 'bg-green-100 text-green-700 border-green-200', emoji: '🚀' },
    at_market: { icon: Minus, label: 'At Market', color: 'bg-blue-100 text-blue-700 border-blue-200', emoji: '✅' },
    below_market: { icon: TrendingDown, label: 'Below Market', color: 'bg-amber-100 text-amber-700 border-amber-200', emoji: '⚠️' },
  };
  const comp = comparisonConfig[comparison] || comparisonConfig.at_market;
  const CompIcon = comp.icon;

  const currentScript = isEditingScript ? editedScript : (data.negotiation_script || data.sample_script || '');

  const handleCopyScript = () => {
    navigator.clipboard.writeText(currentScript);
    setCopiedScript(true);
    toast.success('Negotiation script copied!');
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <Card className="p-4 border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 mt-2 mb-1 relative overflow-hidden">
      {/* Confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#FA4616', '#0021A5', '#FFD700', '#00C853', '#FF4081'][i % 5],
                left: `${Math.random() * 100}%`,
                top: -10,
              }}
              animate={{
                y: [0, 400 + Math.random() * 200],
                x: [0, (Math.random() - 0.5) * 100],
                opacity: [1, 0],
                rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 1,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-base">🎉🎉🎉 CONGRATULATIONS!</p>
          <p className="text-sm text-slate-600">You got an offer from <strong>{data.company || 'the company'}</strong>!</p>
        </div>
      </div>

      {/* Offer details */}
      {(data.role || data.base_salary || data.location) && (
        <div className="bg-white rounded-xl p-3 mb-3 border border-amber-200">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Your Offer</p>
          <div className="grid grid-cols-2 gap-2">
            {data.role && (
              <div>
                <p className="text-[10px] text-slate-500">Role</p>
                <p className="text-sm font-semibold text-slate-900">{data.role}</p>
              </div>
            )}
            {data.base_salary && (
              <div>
                <p className="text-[10px] text-slate-500">Base Salary</p>
                <p className="text-sm font-semibold text-slate-900">{data.base_salary}</p>
              </div>
            )}
            {data.location && (
              <div>
                <p className="text-[10px] text-slate-500">Location</p>
                <p className="text-sm font-semibold text-slate-900">{data.location}</p>
              </div>
            )}
            {data.total_comp && (
              <div>
                <p className="text-[10px] text-slate-500">Total Comp</p>
                <p className="text-sm font-semibold text-slate-900">{data.total_comp}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Market comparison */}
      {data.market_median && (
        <div className="bg-white rounded-xl p-3 mb-3 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <CompIcon className="w-4 h-4" />
            <Badge className={`text-[10px] ${comp.color} border`}>{comp.emoji} {comp.label}</Badge>
          </div>
          <p className="text-sm text-slate-700">{data.market_analysis || `Market median for this role: ${data.market_median}`}</p>
        </div>
      )}

      {/* Negotiation advice */}
      {data.negotiation_advice && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 mb-3 border border-blue-200">
          <p className="text-xs font-bold text-blue-700 uppercase mb-1.5">💡 Negotiation Strategy</p>
          <p className="text-sm text-slate-700 leading-relaxed">{data.negotiation_advice}</p>
        </div>
      )}

      {/* Negotiation script */}
      {currentScript && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1.5">📝 Negotiation Script</p>
          {isEditingScript ? (
            <textarea
              value={editedScript}
              onChange={(e) => setEditedScript(e.target.value)}
              rows={8}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y leading-relaxed mb-2"
            />
          ) : (
            <div className="bg-white rounded-lg p-3 border border-slate-200 mb-2">
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{currentScript}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button onClick={handleCopyScript} variant="outline" size="sm" className="gap-1.5 flex-1" style={{ minHeight: 'auto' }}>
              {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedScript ? 'Copied!' : 'Copy Script'}
            </Button>
            {isEditingScript ? (
              <Button onClick={() => setIsEditingScript(false)} size="sm" className="gap-1 bg-amber-600 hover:bg-amber-700 text-white" style={{ minHeight: 'auto' }}>
                <Check className="w-3.5 h-3.5" /> Save
              </Button>
            ) : (
              <Button onClick={() => setIsEditingScript(true)} variant="outline" size="sm" className="gap-1.5" style={{ minHeight: 'auto' }}>
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Beyond salary tips */}
      {data.beyond_salary?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1.5">🎯 Beyond Salary — Also Negotiate</p>
          <div className="flex flex-wrap gap-1.5">
            {data.beyond_salary.map((item, i) => (
              <Badge key={i} variant="outline" className="text-xs bg-white">{item}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Suggested next actions */}
      {data.suggested_actions?.length > 0 && (
        <SuggestedActions actions={data.suggested_actions} onSendMessage={onSendMessage} className="mt-3 pt-3 border-t border-amber-200" accentColor="#D97706" />
      )}
    </Card>
  );
}