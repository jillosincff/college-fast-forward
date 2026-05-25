import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useParams } from '@/components/utils/navigation';
import { Company } from '@/entities/Company';
import { Opportunity } from '@/entities/Opportunity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { navigate } from '@/components/utils/navigation';
import {
  Building2,
  MapPin,
  Users,
  Globe,
  Briefcase,
  CheckCircle,
  TrendingUp,
  Award,
  Calendar
} from 'lucide-react';

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const companyId = params.id;

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      loadCompanyData();
    }
  }, [companyId]);

  const loadCompanyData = async () => {
    setIsLoading(true);
    try {
      // Load company
      const companyData = await Company.filter({ id: companyId });
      if (companyData && companyData[0]) {
        setCompany(companyData[0]);
      }

      // Load jobs
      const jobsData = await Opportunity.filter(
        { org_name: companyData[0]?.name, status: 'active' },
        '-created_date',
        20
      );
      setJobs(jobsData || []);

    } catch (error) {
      console.error('Failed to load company data:', error);
    } finally {
      setIsLoading(false);
    }
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Company Not Found</h2>
            <p className="text-slate-600 mb-4">
              The company you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('Companies')}>
              Browse All Companies
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Cover Image */}
      <div 
        className="h-48 bg-gradient-to-r from-blue-600 to-indigo-600"
        style={company.cover_image_url ? {
          backgroundImage: `url(${company.cover_image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Logo */}
              <div className="w-32 h-32 bg-white border-4 border-white rounded-2xl shadow-lg flex items-center justify-center flex-shrink-0">
                {company.logo_url ? (
                  <img src={company.logo_url} alt={company.name} className="w-24 h-24 object-contain" />
                ) : (
                  <Building2 className="w-16 h-16 text-blue-600" />
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                      {company.name}
                      {company.is_verified && (
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      )}
                    </h1>
                    {company.industry && (
                      <p className="text-lg text-slate-600 mt-1">{company.industry}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  {company.is_hiring && (
                    <Badge className="bg-green-100 text-green-800 text-sm">
                      <Briefcase className="w-4 h-4 mr-1" />
                      We're Hiring
                    </Badge>
                  )}
                  {company.headquarters && (
                    <Badge variant="outline" className="text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {company.headquarters}
                    </Badge>
                  )}
                  {company.company_size && (
                    <Badge variant="outline" className="text-sm">
                      <Users className="w-4 h-4 mr-1" />
                      {company.company_size} employees
                    </Badge>
                  )}
                  {company.founded_year && (
                    <Badge variant="outline" className="text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      Founded {company.founded_year}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{company.follower_count || 0} followers</span>
                  </div>
                  {company.active_jobs_count > 0 && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{company.active_jobs_count} open positions</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 w-full md:w-auto">
                {company.website && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(company.website, '_blank')}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="jobs">
              Jobs {jobs.length > 0 && `(${jobs.length})`}
            </TabsTrigger>
            <TabsTrigger value="culture">Culture</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Description */}
                {company.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle>About {company.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {company.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Mission */}
                {company.mission && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Our Mission
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 leading-relaxed">
                        {company.mission}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Values */}
                {company.values && company.values.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-600" />
                        Our Values
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-3">
                        {company.values.map((value, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Facts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Facts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {company.founded_year && (
                      <div>
                        <p className="text-sm text-slate-600">Founded</p>
                        <p className="font-semibold">{company.founded_year}</p>
                      </div>
                    )}
                    {company.company_size && (
                      <div>
                        <p className="text-sm text-slate-600">Company Size</p>
                        <p className="font-semibold">{company.company_size} employees</p>
                      </div>
                    )}
                    {company.industry && (
                      <div>
                        <p className="text-sm text-slate-600">Industry</p>
                        <p className="font-semibold">{company.industry}</p>
                      </div>
                    )}
                    {company.headquarters && (
                      <div>
                        <p className="text-sm text-slate-600">Headquarters</p>
                        <p className="font-semibold">{company.headquarters}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Locations */}
                {company.locations && company.locations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Locations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {company.locations.map((location, idx) => (
                          <li key={idx} className="text-slate-700">{location}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Benefits */}
                {company.benefits && company.benefits.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Benefits & Perks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {company.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            {jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate('Opportunities', { id: job.id })}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{job.title}</h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge>{job.opportunity_type}</Badge>
                            {job.location_type && (
                              <Badge variant="outline">{job.location_type}</Badge>
                            )}
                            {job.city && job.state && (
                              <Badge variant="outline">
                                <MapPin className="w-3 h-3 mr-1" />
                                {job.city}, {job.state}
                              </Badge>
                            )}
                          </div>
                          {job.description && (
                            <p className="text-slate-600 line-clamp-2">{job.description}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Open Positions</h3>
                  <p className="text-slate-600 mb-4">
                    This company doesn't have any open positions at the moment.
                  </p>
                  <p className="text-slate-500 text-sm">Check back for new postings.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Culture Tab */}
          <TabsContent value="culture">
            {company.culture_highlights && company.culture_highlights.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Culture Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {company.culture_highlights.map((highlight, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-slate-700">{highlight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Culture Info Coming Soon</h3>
                  <p className="text-slate-600">
                    Check back later for insights into {company.name}'s culture
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}