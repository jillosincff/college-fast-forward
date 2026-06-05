import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Linkedin, Mail, Building2, Users, Target, CheckCircle2, AlertCircle } from 'lucide-react';

const dm = "'DM Sans', system-ui, sans-serif";
const pf = "'Playfair Display', Georgia, serif";

export default function JillOsinoffDashboard() {
  const [selectedCompany, setSelectedCompany] = useState(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['companyContacts'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getCompanyContacts', {});
      return res.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const stats = {
    totalCompanies: data?.companies?.length || 0,
    totalContacts: data?.companies?.reduce((sum, c) => sum + (c.contactCount || 0), 0) || 0,
    companiesWithEmails: data?.companiesWithEmails || 0,
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dm }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid #e5e7eb', borderTop: '4px solid #E85D20', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 14, color: '#666' }}>Loading Jill's company intelligence...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dm }}>
        <div style={{ background: '#fff', padding: 32, borderRadius: 16, border: '1px solid #e5e7eb', maxWidth: 500, textAlign: 'center' }}>
          <AlertCircle style={{ width: 48, height: 48, color: '#ef4444', margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: pf, fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>Failed to Load Data</h2>
          <p style={{ fontSize: 14, color: '#666', margin: '0 0 16px' }}>{error.message}</p>
          <button onClick={() => refetch()} style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: dm }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', fontFamily: dm }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)', padding: '40px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #E85D20, #c44d1a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#fff', fontWeight: 700 }}>JO</div>
            <div>
              <h1 style={{ fontFamily: pf, fontSize: 32, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Jill Osinoff's Company Intelligence Dashboard</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0 }}>Real-time hiring manager contacts with LinkedIn profiles</p>
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '20px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Building2 style={{ width: 20, height: 20, color: '#fbbf24' }} />
                <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', margin: 0 }}>Companies Tracked</p>
              </div>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#fff', margin: 0 }}>{stats.totalCompanies}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '20px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Users style={{ width: 20, height: 20, color: '#60a5fa' }} />
                <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', margin: 0 }}>Total Contacts</p>
              </div>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#fff', margin: 0 }}>{stats.totalContacts}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '20px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Mail style={{ width: 20, height: 20, color: '#34d399' }} />
                <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', margin: 0 }}>Emails Found</p>
              </div>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#fff', margin: 0 }}>{stats.companyWithEmails}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
        {/* Companies Grid */}
        <div style={{ display: 'grid', gap: 24 }}>
          {data?.companies?.map((company, idx) => (
            <div key={idx} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              {/* Company Header */}
              <div style={{ background: 'linear-gradient(135deg, #f8f9fc, #fff)', padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    {company.company === 'Cal.com' ? '📅' : company.company === 'BuzzFeed' ? '📰' : company.company === 'Nike' ? '✓' : '🏢'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: pf, fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>{company.company}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#666' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Target style={{ width: 14, height: 14 }} />
                        {company.roleOfInterest}
                      </span>
                      <span>•</span>
                      <span>{company.contactCount} contacts found</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {company.hasEmails && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#dcfce7', color: '#166534', borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>
                        <CheckCircle2 style={{ width: 12, height: 12 }} />
                        Emails Available
                      </span>
                    )}
                    <button
                      onClick={() => setSelectedCompany(selectedCompany === idx ? null : idx)}
                      style={{ background: selectedCompany === idx ? '#1e293b' : '#f1f5f9', color: selectedCompany === idx ? '#fff' : '#475569', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: dm, transition: 'all 0.2s' }}
                    >
                      {selectedCompany === idx ? 'Hide Contacts' : 'View Contacts'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Contacts List */}
              {selectedCompany === idx && company.contacts.length > 0 && (
                <div style={{ padding: '24px', background: '#fafafa' }}>
                  <div style={{ display: 'grid', gap: 16 }}>
                    {company.contacts.map((contact, cIdx) => (
                      <div key={cIdx} style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        {/* Avatar */}
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontFamily: pf, fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>{contact.name}</h4>
                          <p style={{ fontSize: 13, color: '#666', margin: '0 0 12px' }}>{contact.title}</p>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <a
                              href={contact.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0077b5', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none', fontFamily: dm, transition: 'background 0.2s' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#005582'}
                              onMouseLeave={e => e.currentTarget.style.background = '#0077b5'}
                            >
                              <Linkedin style={{ width: 14, height: 14 }} />
                              View LinkedIn Profile
                            </a>
                            {contact.email ? (
                              <a
                                href={`mailto:${contact.email}`}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#10b981', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none', fontFamily: dm }}
                              >
                                <Mail style={{ width: 14, height: 14 }} />
                                {contact.email}
                              </a>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f1f5f9', color: '#64748b', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, fontFamily: dm }}>
                                <Mail style={{ width: 14, height: 14 }} />
                                Email not found
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Confidence Score */}
                        {contact.confidence && (
                          <div style={{ textAlign: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', margin: '0 0 4px' }}>Confidence</p>
                            <p style={{ fontSize: 24, fontWeight: 700, color: contact.confidence > 80 ? '#10b981' : contact.confidence > 50 ? '#f59e0b' : '#ef4444', margin: 0 }}>{contact.confidence}%</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCompany === idx && company.contacts.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', background: '#fafafa' }}>
                  <AlertCircle style={{ width: 48, height: 48, color: '#94a3b8', margin: '0 auto 16px' }} />
                  <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>No contacts found for this company</p>
                  {company.error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{company.error}</p>}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Value Proposition Banner */}
        <div style={{ marginTop: 32, background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: 16, padding: '24px', border: '1px solid #fbbf24', textAlign: 'center' }}>
          <h3 style={{ fontFamily: pf, fontSize: 18, fontWeight: 700, color: '#92400e', margin: '0 0 8px' }}>🎯 Why This Matters</h3>
          <p style={{ fontSize: 14, color: '#78350f', margin: 0, lineHeight: 1.6 }}>
            <strong>Direct access to hiring managers</strong> bypasses ATS black holes. Job seekers who reach out directly are <strong>10x more likely</strong> to get interviews. 
            With real LinkedIn profiles and email addresses, you can send personalized messages that get responses.
          </p>
        </div>
      </div>
    </div>
  );
}