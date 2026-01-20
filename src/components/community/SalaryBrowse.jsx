import React, { useState, useEffect } from 'react';
import { SalarySubmission } from '@/entities/SalarySubmission';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import SalarySubmissionForm from './SalarySubmissionForm';
import SalaryDetailView from './SalaryDetailView';
import { Search, DollarSign, TrendingUp, Building2, MapPin, Briefcase, Plus, Loader2 } from 'lucide-react';

const INDUSTRY_ICONS = {
  'Technology': '💻',
  'Finance & Banking': '💰',
  'Consulting': '📊',
  'Healthcare': '🏥',
  'Marketing & Advertising': '📢',
  'Law & Legal': '⚖️',
  'Engineering': '🔧',
  'Real Estate': '🏠',
  'Media & Entertainment': '🎬',
  'Retail & Consumer': '🛒',
  'Manufacturing': '🏭',
  'Education': '📚',
  'Non-Profit': '💚',
  'Government': '🏛️',
  'Other': '📋'
};

const POPULAR_SEARCHES = [
  'Product Manager',
  'Software Engineer',
  'Marketing',
  'Investment Banking',
  'Consulting',
  'Data Scientist'
];

export default function SalaryBrowse() {
  const [salaries, setSalaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    experience: 'all',
    location: 'all',
    industry: 'all'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [stats, setStats] = useState({ total: 0, byIndustry: {} });

  useEffect(() => {
    loadSalaries();
  }, []);

  const loadSalaries = async () => {
    setIsLoading(true);
    try {
      const data = await SalarySubmission.filter({ is_visible: true }, '-created_date', 500);
      setSalaries(data);
      
      // Calculate stats
      const byIndustry = {};
      data.forEach(s => {
        byIndustry[s.industry] = (byIndustry[s.industry] || 0) + 1;
      });
      setStats({ total: data.length, byIndustry });
    } catch (error) {
      console.error('Error loading salaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSalaries = salaries.filter(s => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!s.job_title_normalized?.includes(query) && 
          !s.company_normalized?.includes(query)) {
        return false;
      }
    }
    if (filters.experience !== 'all' && s.years_experience_band !== filters.experience) return false;
    if (filters.location !== 'all' && s.location !== filters.location) return false;
    if (filters.industry !== 'all' && s.industry !== filters.industry) return false;
    return true;
  });

  // Group by normalized job title for aggregation
  const groupedByRole = {};
  filteredSalaries.forEach(s => {
    const key = s.job_title_normalized || s.job_title.toLowerCase();
    if (!groupedByRole[key]) {
      groupedByRole[key] = {
        title: s.job_title,
        salaries: [],
        companies: new Set()
      };
    }
    groupedByRole[key].salaries.push(s);
    if (s.company) groupedByRole[key].companies.add(s.company);
  });

  const recentSalaries = [...salaries].slice(0, 5);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(value);
  };

  if (selectedRole) {
    return (
      <SalaryDetailView 
        role={selectedRole} 
        salaries={salaries.filter(s => 
          (s.job_title_normalized || s.job_title.toLowerCase()) === selectedRole.toLowerCase()
        )}
        onBack={() => setSelectedRole(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <DollarSign className="w-8 h-8 text-green-600" />
          Salary Insights
        </h1>
        <p className="text-gray-600 mt-2">
          Real compensation data from {stats.total.toLocaleString()} Gator professionals
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search job titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-lg"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-sm text-gray-500">Popular:</span>
          {POPULAR_SEARCHES.map(term => (
            <button
              key={term}
              onClick={() => setSearchQuery(term.toLowerCase())}
              className="text-sm text-blue-600 hover:underline"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Select value={filters.experience} onValueChange={(v) => setFilters({ ...filters, experience: v })}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Experience</SelectItem>
            <SelectItem value="0-2">Entry (0-2 yrs)</SelectItem>
            <SelectItem value="3-5">Mid (3-5 yrs)</SelectItem>
            <SelectItem value="6-10">Senior (6-10 yrs)</SelectItem>
            <SelectItem value="11-15">Director (11-15 yrs)</SelectItem>
            <SelectItem value="16+">Executive (16+)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.industry} onValueChange={(v) => setFilters({ ...filters, industry: v })}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {Object.keys(stats.byIndustry).sort().map(ind => (
              <SelectItem key={ind} value={ind}>
                {INDUSTRY_ICONS[ind]} {ind} ({stats.byIndustry[ind]})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Browse by Industry */}
          {!searchQuery && filters.industry === 'all' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Browse by Category
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(stats.byIndustry)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([industry, count]) => (
                    <button
                      key={industry}
                      onClick={() => setFilters({ ...filters, industry })}
                      className="p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-md transition-all text-left"
                    >
                      <span className="text-2xl">{INDUSTRY_ICONS[industry]}</span>
                      <p className="font-medium text-gray-900 mt-2">{industry}</p>
                      <p className="text-sm text-gray-500">{count} salaries</p>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Recently Added */}
          {!searchQuery && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recently Added
              </h2>
              <div className="space-y-2">
                {recentSalaries.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedRole(s.job_title_normalized || s.job_title)}
                  >
                    <div>
                      <span className="font-medium text-gray-900">{s.job_title}</span>
                      {s.company && <span className="text-gray-500"> at {s.company}</span>}
                      <span className="text-gray-400"> — </span>
                      <span className="text-green-600 font-medium">
                        {formatCurrency(s.base_salary)} base
                        {s.stock_equity > 0 && ` + ${formatCurrency(s.stock_equity)} stock`}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(s.created_date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchQuery && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Results for "{searchQuery}" ({Object.keys(groupedByRole).length} roles)
              </h2>
              <div className="space-y-3">
                {Object.entries(groupedByRole)
                  .sort((a, b) => b[1].salaries.length - a[1].salaries.length)
                  .map(([key, data]) => {
                    const medianBase = data.salaries
                      .map(s => s.base_salary)
                      .sort((a, b) => a - b)[Math.floor(data.salaries.length / 2)];
                    
                    return (
                      <div
                        key={key}
                        onClick={() => setSelectedRole(key)}
                        className="p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{data.title}</h3>
                            <p className="text-sm text-gray-500">
                              {data.salaries.length} report{data.salaries.length !== 1 ? 's' : ''}
                              {data.companies.size > 0 && ` · ${data.companies.size} companies`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(medianBase)}
                            </p>
                            <p className="text-xs text-gray-500">median base</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">💡 Have salary data to share?</h3>
                <p className="text-gray-600 mt-1">
                  Help students negotiate better. Takes 2 minutes, completely anonymous.
                </p>
              </div>
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Yours
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <SalarySubmissionForm 
                    onSuccess={() => {
                      setShowAddForm(false);
                      loadSalaries();
                    }}
                    onCancel={() => setShowAddForm(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </>
      )}
    </div>
  );
}