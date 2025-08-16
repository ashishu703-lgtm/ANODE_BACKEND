const { query } = require('../config/database');
const logger = require('../utils/logger');

class ReviewService {
  // Analyze content and generate scores
  async analyzeContent(content, category) {
    try {
      // Get criteria for the category
      const criteriaResult = await query(
        'SELECT id, name, weight FROM review_criteria WHERE category = $1 AND is_active = true ORDER BY weight DESC',
        [category]
      );

      const criteria = criteriaResult.rows;
      const scores = [];
      let totalWeightedScore = 0;
      let totalWeight = 0;

      // Analyze each criterion
      for (const criterion of criteria) {
        const score = await this.analyzeCriterion(content, criterion, category);
        scores.push({
          criteriaId: criterion.id,
          score: score,
          weight: criterion.weight
        });

        totalWeightedScore += score * criterion.weight;
        totalWeight += criterion.weight;
      }

      // Calculate overall score
      const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

      return {
        overallScore: Math.round(overallScore * 100) / 100,
        scores: scores
      };
    } catch (error) {
      logger.error('Content analysis error:', error);
      throw error;
    }
  }

  // Analyze individual criterion
  async analyzeCriterion(content, criterion, category) {
    const { name, weight } = criterion;
    
    // Simulate AI analysis based on criterion type
    let score = 0;
    let feedback = '';

    switch (name.toLowerCase()) {
      case 'grammar and spelling':
        score = this.analyzeGrammarAndSpelling(content);
        feedback = this.generateGrammarFeedback(score);
        break;
      
      case 'content quality':
        score = this.analyzeContentQuality(content);
        feedback = this.generateContentFeedback(score);
        break;
      
      case 'structure and organization':
        score = this.analyzeStructure(content);
        feedback = this.generateStructureFeedback(score);
        break;
      
      case 'originality':
        score = this.analyzeOriginality(content);
        feedback = this.generateOriginalityFeedback(score);
        break;
      
      case 'technical accuracy':
        score = this.analyzeTechnicalAccuracy(content, category);
        feedback = this.generateTechnicalFeedback(score);
        break;
      
      case 'business logic':
        score = this.analyzeBusinessLogic(content);
        feedback = this.generateBusinessFeedback(score);
        break;
      
      case 'market analysis':
        score = this.analyzeMarketAnalysis(content);
        feedback = this.generateMarketFeedback(score);
        break;
      
      case 'financial viability':
        score = this.analyzeFinancialViability(content);
        feedback = this.generateFinancialFeedback(score);
        break;
      
      case 'risk assessment':
        score = this.analyzeRiskAssessment(content);
        feedback = this.generateRiskFeedback(score);
        break;
      
      case 'creativity':
        score = this.analyzeCreativity(content);
        feedback = this.generateCreativityFeedback(score);
        break;
      
      case 'artistic merit':
        score = this.analyzeArtisticMerit(content);
        feedback = this.generateArtisticFeedback(score);
        break;
      
      case 'technical skill':
        score = this.analyzeTechnicalSkill(content);
        feedback = this.generateTechnicalSkillFeedback(score);
        break;
      
      case 'code quality':
        score = this.analyzeCodeQuality(content);
        feedback = this.generateCodeFeedback(score);
        break;
      
      case 'performance':
        score = this.analyzePerformance(content);
        feedback = this.generatePerformanceFeedback(score);
        break;
      
      case 'security':
        score = this.analyzeSecurity(content);
        feedback = this.generateSecurityFeedback(score);
        break;
      
      case 'documentation':
        score = this.analyzeDocumentation(content);
        feedback = this.generateDocumentationFeedback(score);
        break;
      
      default:
        score = this.analyzeGeneric(content);
        feedback = this.generateGenericFeedback(score);
    }

    return {
      score: Math.round(score * 100) / 100,
      feedback: feedback
    };
  }

  // Analysis methods (simulated AI analysis)
  analyzeGrammarAndSpelling(content) {
    const words = content.toLowerCase().split(/\s+/);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Simple grammar check simulation
    let score = 0.8; // Base score
    
    // Check for common issues
    const commonErrors = [
      /your\s+you're/, /you're\s+your/, /its\s+it's/, /it's\s+its/,
      /their\s+they're/, /they're\s+their/, /there\s+their/, /their\s+there/
    ];
    
    let errorCount = 0;
    commonErrors.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) errorCount += matches.length;
    });
    
    // Penalize for errors
    score -= (errorCount * 0.05);
    
    return Math.max(0, Math.min(1, score));
  }

  analyzeContentQuality(content) {
    const words = content.split(/\s+/);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let score = 0.7; // Base score
    
    // Length analysis
    if (words.length > 100) score += 0.1;
    if (words.length > 500) score += 0.1;
    
    // Sentence variety
    const avgSentenceLength = words.length / sentences.length;
    if (avgSentenceLength > 5 && avgSentenceLength < 25) score += 0.1;
    
    // Vocabulary complexity (simple heuristic)
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const vocabularyRatio = uniqueWords.size / words.length;
    if (vocabularyRatio > 0.6) score += 0.1;
    
    return Math.max(0, Math.min(1, score));
  }

  analyzeStructure(content) {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let score = 0.6; // Base score
    
    // Paragraph structure
    if (paragraphs.length > 2) score += 0.2;
    
    // Sentence flow
    if (sentences.length > 5) score += 0.1;
    
    // Check for transition words
    const transitionWords = ['however', 'therefore', 'furthermore', 'moreover', 'consequently', 'in addition'];
    const transitionCount = transitionWords.filter(word => 
      content.toLowerCase().includes(word)
    ).length;
    
    if (transitionCount > 1) score += 0.1;
    
    return Math.max(0, Math.min(1, score));
  }

  analyzeOriginality(content) {
    // Simulate plagiarism detection
    let score = 0.8; // Base score
    
    // Check for common phrases (simplified)
    const commonPhrases = [
      'in conclusion', 'as a result', 'it is important to note',
      'furthermore', 'moreover', 'in addition'
    ];
    
    const phraseCount = commonPhrases.filter(phrase => 
      content.toLowerCase().includes(phrase)
    ).length;
    
    // Too many common phrases might indicate lack of originality
    if (phraseCount > 3) score -= 0.1;
    
    return Math.max(0, Math.min(1, score));
  }

  analyzeTechnicalAccuracy(content, category) {
    let score = 0.7; // Base score
    
    // Category-specific technical terms
    const technicalTerms = {
      technical: ['algorithm', 'database', 'api', 'framework', 'optimization'],
      business: ['revenue', 'profit', 'market', 'strategy', 'analysis'],
      academic: ['research', 'methodology', 'hypothesis', 'conclusion', 'analysis']
    };
    
    const terms = technicalTerms[category] || [];
    const termCount = terms.filter(term => 
      content.toLowerCase().includes(term)
    ).length;
    
    if (termCount > 2) score += 0.2;
    
    return Math.max(0, Math.min(1, score));
  }

  analyzeBusinessLogic(content) {
    let score = 0.6;
    
    // Check for business-related concepts
    const businessConcepts = ['market', 'customer', 'revenue', 'cost', 'profit', 'strategy'];
    const conceptCount = businessConcepts.filter(concept => 
      content.toLowerCase().includes(concept)
    ).length;
    
    if (conceptCount > 2) score += 0.3;
    
    return Math.max(0, Math.min(1, score));
  }

  analyzeMarketAnalysis(content) {
    let score = 0.5;
    
    const marketTerms = ['market', 'competition', 'demand', 'supply', 'trend', 'growth'];
    const termCount = marketTerms.filter(term => 
      content.toLowerCase().includes(term)
    ).length;
    
    if (termCount > 2) score += 0.4;
    
    return Math.max(0, Math.min(1, score));
  }

  analyzeFinancialViability(content) {
    let score = 0.5;
    
    const financialTerms = ['revenue', 'cost', 'profit', 'investment', 'return', 'budget'];
    const termCount = financialTerms.filter(term => 
      content.toLowerCase().includes(term)
    ).length;
    
    if (termCount > 2) score += 0.4;
    
    return Math.max(0, Math.min(1, score));
  }

  analyzeRiskAssessment(content) {
    let score = 0.6;
    
    const riskTerms = ['risk', 'challenge', 'threat', 'vulnerability', 'mitigation'];
    const termCount = riskTerms.filter(term => 
      content.toLowerCase().includes(term)
    ).length;
    
    if (termCount > 1) score += 0.3;
    
    return Math.max(0, Math.min(1, score));
  }

  analyzeCreativity(content) {
    let score = 0.7;
    
    // Check for creative elements
    const creativeIndicators = ['innovative', 'creative', 'unique', 'original', 'novel'];
    const indicatorCount = creativeIndicators.filter(indicator => 
      content.toLowerCase().includes(indicator)
    ).length;
    
    if (indicatorCount > 1) score += 0.2;
    
    return Math.max(0, Math.min(1, score));
  }

  analyzeArtisticMerit(content) {
    let score = 0.6;
    
    const artisticTerms = ['aesthetic', 'beauty', 'artistic', 'visual', 'design'];
    const termCount = artisticTerms.filter(term => 
      content.toLowerCase().includes(term)
    ).length;
    
    if (termCount > 1) score += 0.3;
    
    return Math.max(0, Math.min(1, score));
  }

  analyzeTechnicalSkill(content) {
    let score = 0.6;
    
    const skillTerms = ['technique', 'skill', 'expertise', 'proficiency', 'mastery'];
    const termCount = skillTerms.filter(term => 
      content.toLowerCase().includes(term)
    ).length;
    
    if (termCount > 1) score += 0.3;
    
    return Math.max(0, Math.min(1, score));
  }

  analyzeCodeQuality(content) {
    let score = 0.5;
    
    // Check for code-related patterns
    const codePatterns = ['function', 'class', 'variable', 'loop', 'condition'];
    const patternCount = codePatterns.filter(pattern => 
      content.toLowerCase().includes(pattern)
    ).length;
    
    if (patternCount > 2) score += 0.4;
    
    return Math.max(0, Math.min(1, score));
  }

  analyzePerformance(content) {
    let score = 0.6;
    
    const performanceTerms = ['efficiency', 'optimization', 'speed', 'performance', 'scalability'];
    const termCount = performanceTerms.filter(term => 
      content.toLowerCase().includes(term)
    ).length;
    
    if (termCount > 1) score += 0.3;
    
    return Math.max(0, Math.min(1, score));
  }

  analyzeSecurity(content) {
    let score = 0.5;
    
    const securityTerms = ['security', 'authentication', 'encryption', 'vulnerability', 'protection'];
    const termCount = securityTerms.filter(term => 
      content.toLowerCase().includes(term)
    ).length;
    
    if (termCount > 1) score += 0.4;
    
    return Math.max(0, Math.min(1, score));
  }

  analyzeDocumentation(content) {
    let score = 0.6;
    
    const docTerms = ['comment', 'documentation', 'explain', 'describe', 'note'];
    const termCount = docTerms.filter(term => 
      content.toLowerCase().includes(term)
    ).length;
    
    if (termCount > 1) score += 0.3;
    
    return Math.max(0, Math.min(1, score));
  }

  analyzeGeneric(content) {
    return 0.6; // Default score
  }

  // Feedback generation methods
  generateGrammarFeedback(score) {
    if (score >= 0.9) return 'Excellent grammar and spelling throughout.';
    if (score >= 0.8) return 'Good grammar with minor issues.';
    if (score >= 0.7) return 'Generally good grammar with some errors.';
    if (score >= 0.6) return 'Several grammar and spelling issues found.';
    return 'Significant grammar and spelling problems need attention.';
  }

  generateContentFeedback(score) {
    if (score >= 0.9) return 'Outstanding content quality and depth.';
    if (score >= 0.8) return 'High-quality content with good depth.';
    if (score >= 0.7) return 'Good content quality with room for improvement.';
    if (score >= 0.6) return 'Content needs more depth and quality.';
    return 'Content quality requires significant improvement.';
  }

  generateStructureFeedback(score) {
    if (score >= 0.9) return 'Excellent structure and organization.';
    if (score >= 0.8) return 'Well-structured and organized content.';
    if (score >= 0.7) return 'Good structure with minor organizational issues.';
    if (score >= 0.6) return 'Structure needs improvement.';
    return 'Poor structure and organization.';
  }

  generateOriginalityFeedback(score) {
    if (score >= 0.9) return 'Highly original and creative content.';
    if (score >= 0.8) return 'Good originality with fresh perspectives.';
    if (score >= 0.7) return 'Generally original with some common elements.';
    if (score >= 0.6) return 'Limited originality detected.';
    return 'Content lacks originality and creativity.';
  }

  generateTechnicalFeedback(score) {
    if (score >= 0.9) return 'Excellent technical accuracy and precision.';
    if (score >= 0.8) return 'Good technical accuracy with minor issues.';
    if (score >= 0.7) return 'Generally accurate with some technical concerns.';
    if (score >= 0.6) return 'Several technical inaccuracies found.';
    return 'Significant technical accuracy issues.';
  }

  generateBusinessFeedback(score) {
    if (score >= 0.9) return 'Excellent business logic and reasoning.';
    if (score >= 0.8) return 'Strong business logic with good reasoning.';
    if (score >= 0.7) return 'Good business logic with room for improvement.';
    if (score >= 0.6) return 'Business logic needs strengthening.';
    return 'Weak business logic and reasoning.';
  }

  generateMarketFeedback(score) {
    if (score >= 0.9) return 'Comprehensive market analysis.';
    if (score >= 0.8) return 'Good market analysis with key insights.';
    if (score >= 0.7) return 'Basic market analysis provided.';
    if (score >= 0.6) return 'Limited market analysis.';
    return 'Insufficient market analysis.';
  }

  generateFinancialFeedback(score) {
    if (score >= 0.9) return 'Excellent financial analysis and projections.';
    if (score >= 0.8) return 'Good financial analysis with realistic projections.';
    if (score >= 0.7) return 'Basic financial analysis provided.';
    if (score >= 0.6) return 'Limited financial analysis.';
    return 'Insufficient financial analysis.';
  }

  generateRiskFeedback(score) {
    if (score >= 0.9) return 'Comprehensive risk assessment and mitigation.';
    if (score >= 0.8) return 'Good risk assessment with mitigation strategies.';
    if (score >= 0.7) return 'Basic risk assessment provided.';
    if (score >= 0.6) return 'Limited risk assessment.';
    return 'Insufficient risk assessment.';
  }

  generateCreativityFeedback(score) {
    if (score >= 0.9) return 'Exceptional creativity and innovation.';
    if (score >= 0.8) return 'High level of creativity demonstrated.';
    if (score >= 0.7) return 'Good creative elements present.';
    if (score >= 0.6) return 'Limited creativity shown.';
    return 'Lacks creative elements.';
  }

  generateArtisticFeedback(score) {
    if (score >= 0.9) return 'Outstanding artistic merit and aesthetic appeal.';
    if (score >= 0.8) return 'High artistic merit with good aesthetics.';
    if (score >= 0.7) return 'Good artistic elements present.';
    if (score >= 0.6) return 'Limited artistic merit.';
    return 'Poor artistic merit and aesthetics.';
  }

  generateTechnicalSkillFeedback(score) {
    if (score >= 0.9) return 'Exceptional technical skill demonstrated.';
    if (score >= 0.8) return 'High level of technical skill shown.';
    if (score >= 0.7) return 'Good technical skill level.';
    if (score >= 0.6) return 'Limited technical skill.';
    return 'Poor technical skill level.';
  }

  generateCodeFeedback(score) {
    if (score >= 0.9) return 'Excellent code quality and best practices.';
    if (score >= 0.8) return 'Good code quality with minor issues.';
    if (score >= 0.7) return 'Generally good code with room for improvement.';
    if (score >= 0.6) return 'Code quality needs improvement.';
    return 'Poor code quality and practices.';
  }

  generatePerformanceFeedback(score) {
    if (score >= 0.9) return 'Excellent performance considerations.';
    if (score >= 0.8) return 'Good performance optimization.';
    if (score >= 0.7) return 'Basic performance considerations.';
    if (score >= 0.6) return 'Limited performance focus.';
    return 'Poor performance considerations.';
  }

  generateSecurityFeedback(score) {
    if (score >= 0.9) return 'Excellent security practices and considerations.';
    if (score >= 0.8) return 'Good security awareness and practices.';
    if (score >= 0.7) return 'Basic security considerations.';
    if (score >= 0.6) return 'Limited security focus.';
    return 'Poor security practices and awareness.';
  }

  generateDocumentationFeedback(score) {
    if (score >= 0.9) return 'Excellent documentation and comments.';
    if (score >= 0.8) return 'Good documentation with clear explanations.';
    if (score >= 0.7) return 'Basic documentation provided.';
    if (score >= 0.6) return 'Limited documentation.';
    return 'Poor documentation and comments.';
  }

  generateGenericFeedback(score) {
    if (score >= 0.9) return 'Excellent work overall.';
    if (score >= 0.8) return 'Good work with minor areas for improvement.';
    if (score >= 0.7) return 'Generally good with room for enhancement.';
    if (score >= 0.6) return 'Needs improvement in several areas.';
    return 'Significant improvement required.';
  }
}

module.exports = new ReviewService(); 