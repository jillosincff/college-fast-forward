// Recommendation Engine Logic

export class RecommendationEngine {
  /**
   * Calculate relevance score for an opportunity based on user profile
   */
  static calculateRelevanceScore(opportunity, user) {
    let score = 0;
    const weights = {
      major: 30,
      skills: 25,
      location: 20,
      timing: 15,
      freshness: 10
    };

    // Major matching
    if (user.major && opportunity.description) {
      const majorLower = user.major.toLowerCase();
      const descLower = opportunity.description.toLowerCase();
      const titleLower = opportunity.title.toLowerCase();
      
      if (titleLower.includes(majorLower) || descLower.includes(majorLower)) {
        score += weights.major;
      } else if (this.getRelatedTerms(majorLower).some(term => 
        descLower.includes(term) || titleLower.includes(term))) {
        score += weights.major * 0.7; // Partial match
      }
    }

    // Skills matching
    if (user.skills_showcase?.length > 0 && opportunity.description) {
      const matchingSkills = user.skills_showcase.filter(skill =>
        opportunity.description.toLowerCase().includes(skill.toLowerCase())
      );
      score += (matchingSkills.length / user.skills_showcase.length) * weights.skills;
    }

    // Location matching
    if (user.location && opportunity.city) {
      if (opportunity.location_type === 'remote') {
        score += weights.location * 0.8; // Remote is usually good
      } else if (opportunity.city.toLowerCase().includes(user.location.toLowerCase()) ||
                 user.location.toLowerCase().includes(opportunity.city.toLowerCase())) {
        score += weights.location;
      }
    }

    // Timing - prefer internships if graduation is >1 year away
    if (user.graduation_year) {
      const yearsUntilGrad = user.graduation_year - new Date().getFullYear();
      if (yearsUntilGrad > 1 && opportunity.opportunity_type === 'internship') {
        score += weights.timing;
      } else if (yearsUntilGrad <= 1 && 
                (opportunity.opportunity_type === 'full_time' || opportunity.opportunity_type === 'job')) {
        score += weights.timing;
      }
    }

    // Freshness - newer posts get slight boost
    const daysSincePosted = Math.floor(
      (Date.now() - new Date(opportunity.created_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSincePosted <= 3) {
      score += weights.freshness;
    } else if (daysSincePosted <= 7) {
      score += weights.freshness * 0.5;
    }

    return Math.round(score);
  }

  /**
   * Get related terms for better matching
   */
  static getRelatedTerms(major) {
    const termMap = {
      'computer science': ['software', 'programming', 'developer', 'engineer', 'tech', 'coding'],
      'business': ['management', 'operations', 'strategy', 'consulting', 'analyst'],
      'marketing': ['brand', 'digital', 'social media', 'content', 'advertising'],
      'engineering': ['technical', 'systems', 'design', 'development'],
      'psychology': ['research', 'behavioral', 'ux', 'user experience', 'human factors'],
      'biology': ['research', 'lab', 'science', 'healthcare', 'medical'],
      'finance': ['analyst', 'banking', 'investment', 'financial'],
      'journalism': ['writing', 'content', 'media', 'communications'],
    };

    const majorLower = major.toLowerCase();
    for (const [key, terms] of Object.entries(termMap)) {
      if (majorLower.includes(key)) {
        return terms;
      }
    }
    return [];
  }

  /**
   * Generate recommendation explanation
   */
  static getRecommendationReason(opportunity, user, score) {
    const reasons = [];

    // Major match
    if (user.major && (
      opportunity.title.toLowerCase().includes(user.major.toLowerCase()) ||
      opportunity.description?.toLowerCase().includes(user.major.toLowerCase())
    )) {
      reasons.push(`Matches your ${user.major} major`);
    }

    // Skills match
    if (user.skills_showcase?.length > 0) {
      const matchingSkills = user.skills_showcase.filter(skill =>
        opportunity.description?.toLowerCase().includes(skill.toLowerCase())
      );
      if (matchingSkills.length > 0) {
        reasons.push(`Uses your skills: ${matchingSkills.slice(0, 2).join(', ')}`);
      }
    }

    // Location match
    if (opportunity.location_type === 'remote') {
      reasons.push('Remote-friendly');
    } else if (user.location && opportunity.city?.toLowerCase().includes(user.location.toLowerCase())) {
      reasons.push(`Near ${user.location}`);
    }

    // Timing
    if (user.graduation_year) {
      const yearsUntilGrad = user.graduation_year - new Date().getFullYear();
      if (yearsUntilGrad > 1 && opportunity.opportunity_type === 'internship') {
        reasons.push('Good for your year');
      } else if (yearsUntilGrad <= 1 && opportunity.opportunity_type === 'full_time') {
        reasons.push('Perfect timing for graduation');
      }
    }

    // Freshness
    const daysSincePosted = Math.floor(
      (Date.now() - new Date(opportunity.created_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSincePosted <= 3) {
      reasons.push('Just posted');
    }

    return reasons.length > 0 ? reasons : ['Recommended for students like you'];
  }

  /**
   * Organize opportunities into streams
   */
  static organizeIntoStreams(opportunities, user) {
    const scored = opportunities.map(opp => ({
      ...opp,
      relevanceScore: this.calculateRelevanceScore(opp, user),
      reasons: this.getRecommendationReason(opp, user)
    }));

    return {
      perfectMatches: scored
        .filter(opp => opp.relevanceScore >= 60)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5),
      
      stretch: scored
        .filter(opp => opp.relevanceScore >= 40 && opp.relevanceScore < 60)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5),
      
      quickApply: scored
        .filter(opp => opp.application_email || opp.contact_email)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5),
      
      fresh: scored
        .filter(opp => {
          const daysSince = Math.floor((Date.now() - new Date(opp.created_date).getTime()) / (1000 * 60 * 60 * 24));
          return daysSince <= 3;
        })
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 5),
      
      local: scored
        .filter(opp => {
          if (!user.location) return false;
          return opp.city?.toLowerCase().includes(user.location.toLowerCase()) ||
                 opp.location_type === 'remote' ||
                 opp.location_type === 'hybrid';
        })
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5)
    };
  }
}

export default RecommendationEngine;