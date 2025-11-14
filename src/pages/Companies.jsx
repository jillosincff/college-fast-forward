
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Company } from '@/entities/Company';
import { CompanyFollow } from '@/entities/CompanyFollow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { navigate } from '@/components/utils/navigation';
import {
  Search,
  Building2,
  Users,
  MapPin,
  Star,
  Briefcase,
  TrendingUp,
  CheckCircle,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CompaniesPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [followedCompanies, setFollowedCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [hiringFilter, setHiringFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
    if (user) {
      loadFollowedCompanies();
    }
  }, [user]);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const allCompanies = await Company.filter({}, '-follower_count', 100);
      setCompanies(allCompanies || []);
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFollowedCompanies = async () => {
    try {
      const follows = await CompanyFollow.filter({ user_id: user.id });
      setFollowedCompanies(follows.map(f => f.company_id));
    } catch (error) {
      console.error('Failed to load followed companies:', error);
    }
  };

  const handleFollowToggle = async (companyId) => {
    if (!user) {
      navigate('LandingPage');
      return;
    }

    const isFollowing = followedCompanies.includes(companyId);

    try {
      if (isFollowing) {
        const followRecord = await CompanyFollow.filter({
          user_id: user.id,
          company_id: companyId
        });
        if (followRecord[0]) {
          await CompanyFollow.delete(followRecord[0].id);
        }
        setFollowedCompanies(prev => prev.filter(id => id !== companyId));
        
        // Update follower count
        const company = companies.find(c => c.id === companyId);
        if (company) {
          await Company.update(companyId, {
            follower_count: Math.max(0, (company.follower_count || 0) - 1)
          });
        }
      } else {
        const company = companies.find(c => c.id === companyId);
        await CompanyFollow.create({
          user_id: user.id,
          company_id: companyId,
          company_name: company.name
        });
        setFollowedCompanies(prev => [...prev, companyId]);
        
        // Update follower count
        await Company.update(companyId, {
          follower_count: (company.follower_count || 0) + 1
        });
      }
      
      // Refresh companies to get updated counts
      loadCompanies();
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = !searchQuery || 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.description && company.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesIndustry = industryFilter === 'all' || company.industry === industryFilter;
    const matchesSize = sizeFilter === 'all' || company.company_size === sizeFilter;
    const matchesHiring = hiringFilter === 'all' || 
      (hiringFilter === 'hiring' && company.is_hiring) ||
      (hiringFilter === 'not_hiring' && !company.is_hiring);
    
    return matchesSearch && matchesIndustry && matchesSize && matchesHiring;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0021A5] to-[#FA4616] text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Discover Companies
            </h1>
            <p className="text-xl text-white opacity-90 max-w-2xl mx-auto mb-8">
              Explore company profiles, read reviews, and follow organizations to stay updated on new opportunities
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search companies by name or industry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 text-lg bg-white text-slate-900"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Industry</label>
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Company Size</label>
                <Select value={sizeFilter} onValueChange={setSizeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sizes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                    <SelectItem value="1001-5000">1001-5000 employees</SelectItem>
                    <SelectItem value="5000+">5000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Hiring Status</label>
                <Select value={hiringFilter} onValueChange={setHiringFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    <SelectItem value="hiring">Currently Hiring</SelectItem>
                    <SelectItem value="not_hiring">Not Hiring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {filteredCompanies.length} {filteredCompanies.length === 1 ? 'Company' : 'Companies'}
          </h2>
          {(searchQuery || industryFilter !== 'all' || sizeFilter !== 'all' || hiringFilter !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setIndustryFilter('all');
                setSizeFilter('all');
                setHiringFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading companies...</p>
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="p-6">
                    {/* Company Logo & Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.name} className="w-12 h-12 object-contain" />
                        ) : (
                          <Building2 className="w-8 h-8 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="text-lg font-bold text-slate-900 mb-1 truncate hover:text-blue-600"
                          onClick={() => navigate('CompanyProfile', { id: company.id })}
                        >
                          {company.name}
                          {company.is_verified && (
                            <CheckCircle className="w-4 h-4 text-blue-600 inline ml-1" />
                          )}
                        </h3>
                        {company.industry && (
                          <p className="text-sm text-slate-600">{company.industry}</p>
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {company.is_hiring && (
                        <Badge className="bg-green-100 text-green-800">
                          <Briefcase className="w-3 h-3 mr-1" />
                          Hiring
                        </Badge>
                      )}
                      {company.company_size && (
                        <Badge variant="outline">
                          <Users className="w-3 h-3 mr-1" />
                          {company.company_size}
                        </Badge>
                      )}
                      {company.headquarters && (
                        <Badge variant="outline">
                          <MapPin className="w-3 h-3 mr-1" />
                          {company.headquarters}
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    {company.description && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {company.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
                      {company.average_rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">{company.average_rating.toFixed(1)}</span>
                          <span>({company.review_count})</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{company.follower_count || 0} followers</span>
                      </div>
                      {company.active_jobs_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{company.active_jobs_count} jobs</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate('CompanyProfile', { id: company.id })}
                      >
                        View Profile
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowToggle(company.id);
                        }}
                        className={followedCompanies.includes(company.id) 
                          ? "bg-slate-200 text-slate-700 hover:bg-slate-300" 
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                        }
                      >
                        {followedCompanies.includes(company.id) ? 'Following' : 'Follow'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Companies Found</h3>
              <p className="text-slate-600">
                Try adjusting your filters or search query
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
