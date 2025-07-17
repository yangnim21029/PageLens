import { ExtendedAssessmentResult, TechnicalSEOChecks, StructuredDataCheck } from '../../types/extended-assessment.types';
import { ParsedContent } from '../../../understanding-the-page/types/parsed-content.types';
import { PageIngredients } from '../../../gathering-ingredients/types/ingredients.types';
import { AssessmentType, AssessmentStatus } from '../../types/assessment.types';

export class TechnicalSEOAssessor {
  async runTechnicalSEOChecks(parsedContent: ParsedContent, ingredients: PageIngredients): Promise<ExtendedAssessmentResult[]> {
    const assessments: ExtendedAssessmentResult[] = [];

    assessments.push(...await this.checkCanonicalUrl(parsedContent, ingredients));
    assessments.push(...await this.checkRobotsDirectives(parsedContent));
    assessments.push(...await this.checkHreflangTags(parsedContent));
    assessments.push(...await this.checkSSLSecurity(parsedContent, ingredients));
    assessments.push(...await this.checkStructuredData(parsedContent));

    return assessments;
  }

  private async checkCanonicalUrl(parsedContent: ParsedContent, ingredients: PageIngredients): Promise<ExtendedAssessmentResult[]> {
    const assessments: ExtendedAssessmentResult[] = [];
    const canonical = parsedContent.technical?.canonical;
    const currentUrl = ingredients.pageDetails.url;

    if (!canonical) {
      assessments.push({
        id: 'canonical-missing',
        type: AssessmentType.SEO,
        name: 'Missing Canonical URL',
        description: 'Page is missing a canonical URL',
        status: AssessmentStatus.BAD,
        score: 0,
        impact: 'high',
        recommendation: 'Add a canonical URL to prevent duplicate content issues.',
        category: 'technical-seo',
        data: {
          technical: {
            canonicalUrl: {
              isPresent: false,
              isValid: false
            }
          } as TechnicalSEOChecks
        }
      });
    } else {
      const isValid = this.isValidUrl(canonical);
      const isSelfReferencing = canonical === currentUrl;
      
      if (isValid && isSelfReferencing) {
        assessments.push({
          id: 'canonical-good',
          type: AssessmentType.SEO,
          name: 'Good Canonical URL',
          description: 'Canonical URL is properly set and self-referencing',
          status: AssessmentStatus.GOOD,
          score: 100,
          impact: 'medium',
          recommendation: 'Perfect! Your canonical URL is correctly configured.',
          category: 'technical-seo',
          data: {
            technical: {
              canonicalUrl: {
                isPresent: true,
                url: canonical,
                isValid: true
              }
            } as TechnicalSEOChecks
          }
        });
      } else {
        assessments.push({
          id: 'canonical-issues',
          type: AssessmentType.SEO,
          name: 'Canonical URL Issues',
          description: !isValid ? 'Canonical URL is not valid' : 'Canonical URL does not match current URL',
          status: AssessmentStatus.OK,
          score: 60,
          impact: 'medium',
          recommendation: !isValid ? 'Fix the canonical URL format.' : 'Ensure canonical URL matches the current page URL.',
          category: 'technical-seo',
          data: {
            technical: {
              canonicalUrl: {
                isPresent: true,
                url: canonical,
                isValid: isValid
              }
            } as TechnicalSEOChecks
          }
        });
      }
    }

    return assessments;
  }

  private async checkRobotsDirectives(parsedContent: ParsedContent): Promise<ExtendedAssessmentResult[]> {
    const assessments: ExtendedAssessmentResult[] = [];
    const robots = parsedContent.technical?.robots || { meta: undefined, xRobots: undefined };

    const isIndexable = !robots.meta || (!robots.meta.includes('noindex'));
    const isFollowable = !robots.meta || (!robots.meta.includes('nofollow'));

    if (robots.meta && (robots.meta.includes('noindex') || robots.meta.includes('nofollow'))) {
      assessments.push({
        id: 'robots-restrictive',
        type: AssessmentType.SEO,
        name: 'Restrictive Robots Directives',
        description: `Robots meta tag contains: ${robots.meta}`,
        status: AssessmentStatus.OK,
        score: 50,
        impact: 'high',
        recommendation: 'Review robots directives to ensure they align with your SEO goals.',
        category: 'technical-seo',
        data: {
          technical: {
            robots: {
              metaRobots: robots.meta,
              hasRobotsTxt: false, // This would need to be checked separately
              isIndexable
            }
          } as TechnicalSEOChecks
        }
      });
    } else {
      assessments.push({
        id: 'robots-good',
        type: AssessmentType.SEO,
        name: 'Good Robots Configuration',
        description: 'Page is indexable and followable',
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'medium',
        recommendation: 'Great! Your page allows search engine indexing and link following.',
        category: 'technical-seo',
        data: {
          technical: {
            robots: {
              metaRobots: robots.meta,
              hasRobotsTxt: false,
              isIndexable
            }
          } as TechnicalSEOChecks
        }
      });
    }

    return assessments;
  }

  private async checkHreflangTags(parsedContent: ParsedContent): Promise<ExtendedAssessmentResult[]> {
    const assessments: ExtendedAssessmentResult[] = [];
    const hreflangs = parsedContent.technical?.hreflang || [];

    if (hreflangs.length === 0) {
      assessments.push({
        id: 'hreflang-none',
        type: AssessmentType.SEO,
        name: 'No Hreflang Tags',
        description: 'Page has no hreflang tags',
        status: AssessmentStatus.OK,
        score: 80,
        impact: 'low',
        recommendation: 'If you have multilingual content, consider adding hreflang tags.',
        category: 'technical-seo',
        data: {
          technical: {
            canonicalUrl: { isPresent: false, isValid: false },
            hreflang: { tags: [], hasErrors: false },
            ssl: { isSecure: true, hasMixedContent: false },
            robots: { isIndexable: true, hasRobotsTxt: false },
            sitemap: { isReferencedInRobots: false }
          } as TechnicalSEOChecks
        }
      });
    } else {
      const hasErrors = this.validateHreflangTags(hreflangs);
      
      assessments.push({
        id: hasErrors ? 'hreflang-errors' : 'hreflang-good',
        type: AssessmentType.SEO,
        name: hasErrors ? 'Hreflang Tag Errors' : 'Good Hreflang Configuration',
        description: `Found ${hreflangs.length} hreflang tag(s)${hasErrors ? ' with errors' : ''}`,
        status: hasErrors ? AssessmentStatus.BAD : AssessmentStatus.GOOD,
        score: hasErrors ? 40 : 100,
        impact: 'medium',
        recommendation: hasErrors ? 'Fix hreflang tag errors for proper international SEO.' : 'Excellent! Your hreflang tags are properly configured.',
        category: 'technical-seo',
        data: {
          technical: {
            hreflang: {
              tags: hreflangs,
              hasErrors
            }
          } as TechnicalSEOChecks
        }
      });
    }

    return assessments;
  }

  private async checkSSLSecurity(parsedContent: ParsedContent, ingredients: PageIngredients): Promise<ExtendedAssessmentResult[]> {
    const assessments: ExtendedAssessmentResult[] = [];
    const isSecure = ingredients.pageDetails.url.startsWith('https://');
    const hasMixedContent = parsedContent.security?.hasMixedContent || false;

    if (isSecure && !hasMixedContent) {
      assessments.push({
        id: 'ssl-good',
        type: AssessmentType.SEO,
        name: 'Secure HTTPS Connection',
        description: 'Page is served over HTTPS without mixed content',
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'high',
        recommendation: 'Perfect! Your page is fully secure.',
        category: 'technical-seo',
        data: {
          technical: {
            ssl: {
              isSecure: true,
              hasMixedContent: false
            }
          } as TechnicalSEOChecks
        }
      });
    } else if (isSecure && hasMixedContent) {
      assessments.push({
        id: 'ssl-mixed-content',
        type: AssessmentType.SEO,
        name: 'Mixed Content Issues',
        description: 'Page is HTTPS but has mixed content',
        status: AssessmentStatus.OK,
        score: 70,
        impact: 'medium',
        recommendation: 'Fix mixed content issues by ensuring all resources are served over HTTPS.',
        category: 'technical-seo',
        data: {
          technical: {
            ssl: {
              isSecure: true,
              hasMixedContent: true
            }
          } as TechnicalSEOChecks
        }
      });
    } else {
      assessments.push({
        id: 'ssl-insecure',
        type: AssessmentType.SEO,
        name: 'Insecure HTTP Connection',
        description: 'Page is not served over HTTPS',
        status: AssessmentStatus.BAD,
        score: 0,
        impact: 'high',
        recommendation: 'Implement HTTPS for better security and SEO rankings.',
        category: 'technical-seo',
        data: {
          technical: {
            ssl: {
              isSecure: false,
              hasMixedContent: false
            }
          } as TechnicalSEOChecks
        }
      });
    }

    return assessments;
  }

  private async checkStructuredData(parsedContent: ParsedContent): Promise<ExtendedAssessmentResult[]> {
    const assessments: ExtendedAssessmentResult[] = [];
    const structuredData = parsedContent.structuredDataDetailed;
    
    const totalSchemas = structuredData ? (structuredData.jsonLd.length + structuredData.microdata.length + structuredData.rdfa.length) : 0;
    
    if (totalSchemas === 0) {
      assessments.push({
        id: 'structured-data-missing',
        type: AssessmentType.SEO,
        name: 'No Structured Data',
        description: 'Page has no structured data markup',
        status: AssessmentStatus.OK,
        score: 60,
        impact: 'medium',
        recommendation: 'Add structured data markup to help search engines understand your content better.',
        category: 'structured-data',
        data: {
          structuredData: []
        }
      });
    } else {
      const checks: StructuredDataCheck[] = [];
      
      // Check JSON-LD schemas
      if (structuredData) {
        structuredData.jsonLd.forEach(schema => {
          checks.push({
            type: schema.type as any,
            isPresent: true,
            isValid: this.validateJsonLdSchema(schema),
            errors: [],
            warnings: []
          });
        });
      }

      const validSchemas = checks.filter(check => check.isValid).length;
      const score = totalSchemas > 0 ? (validSchemas / totalSchemas) * 100 : 0;

      assessments.push({
        id: 'structured-data-present',
        type: AssessmentType.SEO,
        name: 'Structured Data Found',
        description: `Found ${totalSchemas} structured data schema(s), ${validSchemas} valid`,
        status: score >= 80 ? AssessmentStatus.GOOD : score >= 50 ? AssessmentStatus.OK : AssessmentStatus.BAD,
        score: Math.round(score),
        impact: 'medium',
        recommendation: score >= 80 ? 'Great! Your structured data is well implemented.' : 'Review and fix structured data validation errors.',
        category: 'structured-data',
        data: {
          structuredData: checks
        }
      });
    }

    return assessments;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private validateHreflangTags(hreflangs: Array<{ lang: string; href: string }>): boolean {
    // Simple validation - check for proper language codes and valid URLs
    return hreflangs.some(tag => {
      const isValidLang = /^[a-z]{2}(-[A-Z]{2})?$/.test(tag.lang) || tag.lang === 'x-default';
      const isValidUrl = this.isValidUrl(tag.href);
      return !isValidLang || !isValidUrl;
    });
  }

  private validateJsonLdSchema(schema: any): boolean {
    // Basic validation - check if required properties exist based on schema type
    const data = schema.data;
    
    switch (schema.type) {
      case 'Article':
      case 'BlogPosting':
        return !!(data.headline && data.author && data.datePublished);
      case 'Organization':
        return !!(data.name && data.url);
      case 'Person':
        return !!(data.name);
      case 'BreadcrumbList':
        return !!(data.itemListElement && Array.isArray(data.itemListElement));
      default:
        return true; // For unknown types, assume valid
    }
  }
}