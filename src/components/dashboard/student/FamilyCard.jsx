import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const UF_ORANGE = '#FA4616';

export default function FamilyCard({ 
  familyKarmaBoost = 0, 
  linkedParents = [],
  onInviteParent,
  collapsed = true 
}) {
  const hasFamily = familyKarmaBoost > 0 || linkedParents.length > 0;
  
  if (collapsed) {
    return (
      <details className="group bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <summary className="cursor-pointer p-4 md:p-5 hover:bg-gray-50 transition-colors list-none flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👨‍👩‍👧</span>
            <div>
              <h3 className="font-semibold text-gray-900">Your Family</h3>
              {hasFamily ? (
                <p className="text-sm text-gray-500">
                  {linkedParents.length > 0 
                    ? `Connected to ${linkedParents.map(p => p.full_name || 'Parent').join(', ')}`
                    : `${familyKarmaBoost} karma earned for you!`
                  }
                </p>
              ) : (
                <p className="text-sm text-gray-500">Invite parents to boost your visibility</p>
              )}
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400 transform group-open:rotate-180 transition-transform flex-shrink-0" />
        </summary>
        
        <div className="p-4 md:p-5 pt-0 border-t border-gray-100">
          {hasFamily ? (
            <div 
              className="p-4 rounded-xl"
              style={{ 
                background: 'linear-gradient(135deg, #FFF5F2 0%, #FFFFFF 100%)',
                border: `1px solid ${UF_ORANGE}30`
              }}
            >
              <p className="text-sm text-gray-600">
                Your family has earned <strong style={{ color: UF_ORANGE }}>{familyKarmaBoost} karma</strong> to boost your visibility in the network!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Invite your parents to join the UF network. Their professional connections can help you land your dream opportunity!
              </p>
              <Button
                onClick={onInviteParent}
                style={{ backgroundColor: UF_ORANGE }}
                className="text-white hover:opacity-90"
              >
                Invite a Parent →
              </Button>
            </div>
          )}
        </div>
      </details>
    );
  }

  // Non-collapsed version
  if (!hasFamily) return null;

  return (
    <section 
      className="rounded-2xl p-4 md:p-5 border"
      style={{ 
        background: 'linear-gradient(135deg, #FFF5F2 0%, #FFFFFF 100%)',
        borderColor: `${UF_ORANGE}30`
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">👨‍👩‍👧</span>
        <div>
          <h3 className="font-semibold text-gray-900">Your Family is Helping!</h3>
          <p className="text-sm text-gray-600">
            Your family has earned <strong style={{ color: UF_ORANGE }}>{familyKarmaBoost} karma</strong> to boost your visibility
          </p>
        </div>
      </div>
    </section>
  );
}