import { ExtendedAssessmentResult, AdvancedReadabilityMetrics, ContentStructure } from '../../types/extended-assessment.types';
import { ParsedContent } from '../../../understanding-the-page/types/parsed-content.types';
import { AssessmentType, AssessmentStatus } from '../../types/assessment.types';

export class AdvancedReadabilityAssessor {
  async runAdvancedReadabilityChecks(parsedContent: ParsedContent): Promise<ExtendedAssessmentResult[]> {
    const assessments: ExtendedAssessmentResult[] = [];

    assessments.push(...await this.checkAdvancedReadabilityMetrics(parsedContent));
    assessments.push(...await this.checkContentStructureMetrics(parsedContent));
    assessments.push(...await this.checkTypographyMetrics(parsedContent));

    return assessments;
  }

  private async checkAdvancedReadabilityMetrics(parsedContent: ParsedContent): Promise<ExtendedAssessmentResult[]> {
    const assessments: ExtendedAssessmentResult[] = [];
    const text = parsedContent.textContent;

    if (!text || text.length < 100) {
      return assessments; // Skip for very short content
    }

    const metrics = this.calculateAdvancedMetrics(text);

    // Gunning Fog Index assessment
    assessments.push({
      id: 'gunning-fog-index',
      type: AssessmentType.READABILITY,
      name: 'Gunning Fog Index',
      description: `Reading level: ${metrics.gunningFog.interpretation}`,
      status: this.getReadabilityStatus(metrics.gunningFog.score, 12),
      score: Math.max(0, 100 - Math.max(0, metrics.gunningFog.score - 12) * 10),
      impact: 'medium',
      recommendation: metrics.gunningFog.score > 12 
        ? 'Simplify your writing to improve readability (aim for grade 12 or below).'
        : 'Great! Your content is readable for most audiences.',
      category: 'advanced-readability',
      data: {
        advancedReadability: metrics
      }
    });

    // SMOG Index assessment
    assessments.push({
      id: 'smog-index',
      type: AssessmentType.READABILITY,
      name: 'SMOG Index',
      description: `Reading grade level: ${metrics.smog.score.toFixed(1)}`,
      status: this.getReadabilityStatus(metrics.smog.score, 13),
      score: Math.max(0, 100 - Math.max(0, metrics.smog.score - 13) * 8),
      impact: 'medium',
      recommendation: metrics.smog.score > 13
        ? 'Consider using shorter sentences and simpler words.'
        : 'Excellent! Your content is accessible to most readers.',
      category: 'advanced-readability',
      data: {
        advancedReadability: metrics
      }
    });

    // Coleman-Liau Index assessment
    assessments.push({
      id: 'coleman-liau-index',
      type: AssessmentType.READABILITY,
      name: 'Coleman-Liau Index',
      description: `Reading grade level: ${metrics.colemanLiau.score.toFixed(1)}`,
      status: this.getReadabilityStatus(metrics.colemanLiau.score, 12),
      score: Math.max(0, 100 - Math.max(0, metrics.colemanLiau.score - 12) * 10),
      impact: 'medium',
      recommendation: metrics.colemanLiau.score > 12
        ? 'Reduce sentence complexity and use shorter words.'
        : 'Perfect! Your writing is clear and accessible.',
      category: 'advanced-readability',
      data: {
        advancedReadability: metrics
      }
    });

    return assessments;
  }

  private async checkContentStructureMetrics(parsedContent: ParsedContent): Promise<ExtendedAssessmentResult[]> {
    const assessments: ExtendedAssessmentResult[] = [];
    
    if (!parsedContent.contentStructure) {
      return assessments;
    }

    const structure = parsedContent.contentStructure;

    // Lists usage assessment
    const totalLists = structure.lists.ordered.length + structure.lists.unordered.length;
    const totalListItems = structure.lists.ordered.reduce((sum, list) => sum + list.itemCount, 0) +
                          structure.lists.unordered.reduce((sum, list) => sum + list.itemCount, 0);

    if (totalLists > 0) {
      assessments.push({
        id: 'content-lists-usage',
        type: AssessmentType.READABILITY,
        name: 'Lists Usage',
        description: `Found ${totalLists} lists with ${totalListItems} total items`,
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'low',
        recommendation: 'Great! You use lists to organize information effectively.',
        category: 'content-structure',
        data: {
          contentStructure: {
            lists: {
              ordered: structure.lists.ordered.length,
              unordered: structure.lists.unordered.length,
              totalItems: structure.lists.ordered.reduce((sum, list) => sum + list.itemCount, 0) +
                         structure.lists.unordered.reduce((sum, list) => sum + list.itemCount, 0),
              averageItemsPerList: (structure.lists.ordered.length + structure.lists.unordered.length) > 0 ?
                (structure.lists.ordered.reduce((sum, list) => sum + list.itemCount, 0) +
                 structure.lists.unordered.reduce((sum, list) => sum + list.itemCount, 0)) /
                (structure.lists.ordered.length + structure.lists.unordered.length) : 0
            },
            tables: structure.tables,
            blockquotes: structure.blockquotes,
            codeBlocks: structure.codeBlocks
          } as ContentStructure
        }
      });
    } else if (parsedContent.wordCount > 500) {
      assessments.push({
        id: 'content-lists-missing',
        type: AssessmentType.READABILITY,
        name: 'No Lists Found',
        description: 'Content could benefit from using lists',
        status: AssessmentStatus.OK,
        score: 70,
        impact: 'low',
        recommendation: 'Consider using bullet points or numbered lists to break up dense content.',
        category: 'content-structure',
        data: {
          contentStructure: {
            lists: {
              ordered: structure.lists.ordered.length,
              unordered: structure.lists.unordered.length,
              totalItems: structure.lists.ordered.reduce((sum, list) => sum + list.itemCount, 0) +
                         structure.lists.unordered.reduce((sum, list) => sum + list.itemCount, 0),
              averageItemsPerList: (structure.lists.ordered.length + structure.lists.unordered.length) > 0 ?
                (structure.lists.ordered.reduce((sum, list) => sum + list.itemCount, 0) +
                 structure.lists.unordered.reduce((sum, list) => sum + list.itemCount, 0)) /
                (structure.lists.ordered.length + structure.lists.unordered.length) : 0
            },
            tables: structure.tables,
            blockquotes: structure.blockquotes,
            codeBlocks: structure.codeBlocks
          } as ContentStructure
        }
      });
    }

    // Tables accessibility assessment
    if (structure.tables.length > 0) {
      const tablesWithHeaders = structure.tables.filter(table => table.hasHeader).length;
      const tablesWithCaptions = structure.tables.filter(table => table.hasCaption).length;
      const accessibilityScore = ((tablesWithHeaders + tablesWithCaptions) / (structure.tables.length * 2)) * 100;

      assessments.push({
        id: 'tables-accessibility',
        type: AssessmentType.READABILITY,
        name: 'Table Accessibility',
        description: `${tablesWithHeaders}/${structure.tables.length} tables have headers, ${tablesWithCaptions}/${structure.tables.length} have captions`,
        status: accessibilityScore >= 80 ? AssessmentStatus.GOOD : 
                accessibilityScore >= 50 ? AssessmentStatus.OK : AssessmentStatus.BAD,
        score: Math.round(accessibilityScore),
        impact: 'medium',
        recommendation: accessibilityScore >= 80 
          ? 'Excellent! Your tables are well-structured for accessibility.'
          : 'Add headers and captions to your tables for better accessibility.',
        category: 'content-structure',
        data: {
          contentStructure: {
            lists: {
              ordered: structure.lists.ordered.length,
              unordered: structure.lists.unordered.length,
              totalItems: structure.lists.ordered.reduce((sum, list) => sum + list.itemCount, 0) +
                         structure.lists.unordered.reduce((sum, list) => sum + list.itemCount, 0),
              averageItemsPerList: (structure.lists.ordered.length + structure.lists.unordered.length) > 0 ?
                (structure.lists.ordered.reduce((sum, list) => sum + list.itemCount, 0) +
                 structure.lists.unordered.reduce((sum, list) => sum + list.itemCount, 0)) /
                (structure.lists.ordered.length + structure.lists.unordered.length) : 0
            },
            tables: structure.tables,
            blockquotes: structure.blockquotes,
            codeBlocks: structure.codeBlocks
          } as ContentStructure
        }
      });
    }

    return assessments;
  }

  private async checkTypographyMetrics(parsedContent: ParsedContent): Promise<ExtendedAssessmentResult[]> {
    const assessments: ExtendedAssessmentResult[] = [];
    
    if (!parsedContent.typography) {
      return assessments;
    }

    const typography = parsedContent.typography;

    // Font variety assessment
    if (typography.fonts.length <= 3) {
      assessments.push({
        id: 'font-variety-good',
        type: AssessmentType.READABILITY,
        name: 'Font Variety',
        description: `Uses ${typography.fonts.length} font families`,
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'low',
        recommendation: 'Good! Limited font variety maintains visual consistency.',
        category: 'visual-design',
        data: {
          visualDesign: {
            typography: {
              fontSize: { min: 0, max: 0, average: 0, isMobileReadable: true },
              lineHeight: { average: 0, isOptimal: true },
              fontFamilies: typography.fonts
            },
            contrast: { textContrast: [] },
            responsive: { hasViewportMeta: true, hasMobileStyles: true, breakpoints: [] }
          }
        }
      });
    } else {
      assessments.push({
        id: 'font-variety-excessive',
        type: AssessmentType.READABILITY,
        name: 'Too Many Fonts',
        description: `Uses ${typography.fonts.length} different font families`,
        status: AssessmentStatus.OK,
        score: 60,
        impact: 'low',
        recommendation: 'Consider reducing the number of font families for better visual consistency.',
        category: 'visual-design',
        data: {
          visualDesign: {
            typography: {
              fontSize: { min: 0, max: 0, average: 0, isMobileReadable: true },
              lineHeight: { average: 0, isOptimal: true },
              fontFamilies: typography.fonts
            },
            contrast: { textContrast: [] },
            responsive: { hasViewportMeta: true, hasMobileStyles: true, breakpoints: [] }
          }
        }
      });
    }

    return assessments;
  }

  private calculateAdvancedMetrics(text: string): AdvancedReadabilityMetrics {
    const sentences = this.extractSentences(text);
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);
    const complexWords = words.filter(word => this.countSyllables(word) >= 3).length;

    // Gunning Fog Index
    const avgWordsPerSentence = words.length / sentences.length;
    const complexWordPercent = (complexWords / words.length) * 100;
    const gunningFog = 0.4 * (avgWordsPerSentence + complexWordPercent);

    // SMOG Index
    const smog = 1.0430 * Math.sqrt(complexWords * (30 / sentences.length)) + 3.1291;

    // Coleman-Liau Index
    const avgSentencesPer100Words = (sentences.length / words.length) * 100;
    const avgLettersPer100Words = (text.replace(/[^a-zA-Z]/g, '').length / words.length) * 100;
    const colemanLiau = 0.0588 * avgLettersPer100Words - 0.296 * avgSentencesPer100Words - 15.8;

    // Automated Readability Index
    const avgCharsPerWord = text.replace(/[^a-zA-Z]/g, '').length / words.length;
    const automatedReadability = 4.71 * avgCharsPerWord + 0.5 * avgWordsPerSentence - 21.43;

    return {
      gunningFog: {
        score: gunningFog,
        interpretation: this.interpretGunningFog(gunningFog)
      },
      smog: {
        score: smog,
        interpretation: this.interpretSMOG(smog)
      },
      colemanLiau: {
        score: colemanLiau,
        interpretation: this.interpretColemanLiau(colemanLiau)
      },
      automatedReadability: {
        score: automatedReadability,
        interpretation: this.interpretAutomatedReadability(automatedReadability)
      }
    };
  }

  private extractSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  private getReadabilityStatus(score: number, threshold: number): AssessmentStatus {
    if (score <= threshold) return AssessmentStatus.GOOD;
    if (score <= threshold + 3) return AssessmentStatus.OK;
    return AssessmentStatus.BAD;
  }

  private interpretGunningFog(score: number): string {
    if (score <= 8) return 'Elementary school level';
    if (score <= 12) return 'Middle/High school level';
    if (score <= 16) return 'College level';
    return 'Graduate level';
  }

  private interpretSMOG(score: number): string {
    if (score <= 9) return 'Elementary school level';
    if (score <= 13) return 'High school level';
    if (score <= 16) return 'College level';
    return 'Graduate level';
  }

  private interpretColemanLiau(score: number): string {
    if (score <= 8) return 'Elementary school level';
    if (score <= 12) return 'Middle/High school level';
    if (score <= 16) return 'College level';
    return 'Graduate level';
  }

  private interpretAutomatedReadability(score: number): string {
    if (score <= 8) return 'Elementary school level';
    if (score <= 12) return 'Middle/High school level';
    if (score <= 16) return 'College level';
    return 'Graduate level';
  }
}