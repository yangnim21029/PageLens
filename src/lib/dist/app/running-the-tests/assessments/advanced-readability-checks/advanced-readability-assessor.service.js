"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedReadabilityAssessor = void 0;
const assessment_types_1 = require("../../types/assessment.types");
class AdvancedReadabilityAssessor {
    async runAdvancedReadabilityChecks(parsedContent) {
        const assessments = [];
        assessments.push(...await this.checkAdvancedReadabilityMetrics(parsedContent));
        assessments.push(...await this.checkContentStructureMetrics(parsedContent));
        assessments.push(...await this.checkTypographyMetrics(parsedContent));
        return assessments;
    }
    async checkAdvancedReadabilityMetrics(parsedContent) {
        const assessments = [];
        const text = parsedContent.textContent;
        if (!text || text.length < 100) {
            return assessments;
        }
        const metrics = this.calculateAdvancedMetrics(text);
        assessments.push({
            id: 'gunning-fog-index',
            type: assessment_types_1.AssessmentType.READABILITY,
            assessmentType: 'advanced-readability',
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
        assessments.push({
            id: 'smog-index',
            type: assessment_types_1.AssessmentType.READABILITY,
            assessmentType: 'advanced-readability',
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
        assessments.push({
            id: 'coleman-liau-index',
            type: assessment_types_1.AssessmentType.READABILITY,
            assessmentType: 'advanced-readability',
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
    async checkContentStructureMetrics(parsedContent) {
        const assessments = [];
        if (!parsedContent.contentStructure) {
            return assessments;
        }
        const structure = parsedContent.contentStructure;
        const totalLists = structure.lists.ordered.length + structure.lists.unordered.length;
        const totalListItems = structure.lists.ordered.reduce((sum, list) => sum + list.itemCount, 0) +
            structure.lists.unordered.reduce((sum, list) => sum + list.itemCount, 0);
        if (totalLists > 0) {
            assessments.push({
                id: 'content-lists-usage',
                type: assessment_types_1.AssessmentType.READABILITY,
                assessmentType: 'content-structure',
                name: 'Lists Usage',
                description: `Found ${totalLists} lists with ${totalListItems} total items`,
                status: assessment_types_1.AssessmentStatus.GOOD,
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
                        tables: {
                            count: structure.tables.length,
                            withHeaders: structure.tables.filter(table => table.hasHeader).length,
                            withCaption: structure.tables.filter(table => table.hasCaption).length,
                            accessibility: {
                                missingHeaders: structure.tables.filter(table => !table.hasHeader).length,
                                complexTables: structure.tables.filter(table => table.rows > 10 || table.columns > 5).length
                            }
                        },
                        blockquotes: {
                            count: structure.blockquotes.length,
                            withCitation: structure.blockquotes.filter(bq => bq.cite).length
                        },
                        codeBlocks: {
                            count: structure.codeBlocks.length,
                            withLanguage: structure.codeBlocks.filter(cb => cb.language).length,
                            languages: [...new Set(structure.codeBlocks.map(cb => cb.language).filter(Boolean))]
                        }
                    }
                }
            });
        }
        else if (parsedContent.wordCount > 500) {
            assessments.push({
                id: 'content-lists-missing',
                type: assessment_types_1.AssessmentType.READABILITY,
                assessmentType: 'content-structure',
                name: 'No Lists Found',
                description: 'Content could benefit from using lists',
                status: assessment_types_1.AssessmentStatus.OK,
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
                        tables: {
                            count: structure.tables.length,
                            withHeaders: structure.tables.filter(table => table.hasHeader).length,
                            withCaption: structure.tables.filter(table => table.hasCaption).length,
                            accessibility: {
                                missingHeaders: structure.tables.filter(table => !table.hasHeader).length,
                                complexTables: structure.tables.filter(table => table.rows > 10 || table.columns > 5).length
                            }
                        },
                        blockquotes: {
                            count: structure.blockquotes.length,
                            withCitation: structure.blockquotes.filter(bq => bq.cite).length
                        },
                        codeBlocks: {
                            count: structure.codeBlocks.length,
                            withLanguage: structure.codeBlocks.filter(cb => cb.language).length,
                            languages: [...new Set(structure.codeBlocks.map(cb => cb.language).filter(Boolean))]
                        }
                    }
                }
            });
        }
        if (structure.tables.length > 0) {
            const tablesWithHeaders = structure.tables.filter(table => table.hasHeader).length;
            const tablesWithCaptions = structure.tables.filter(table => table.hasCaption).length;
            const accessibilityScore = ((tablesWithHeaders + tablesWithCaptions) / (structure.tables.length * 2)) * 100;
            assessments.push({
                id: 'tables-accessibility',
                type: assessment_types_1.AssessmentType.READABILITY,
                assessmentType: 'content-structure',
                name: 'Table Accessibility',
                description: `${tablesWithHeaders}/${structure.tables.length} tables have headers, ${tablesWithCaptions}/${structure.tables.length} have captions`,
                status: accessibilityScore >= 80 ? assessment_types_1.AssessmentStatus.GOOD :
                    accessibilityScore >= 50 ? assessment_types_1.AssessmentStatus.OK : assessment_types_1.AssessmentStatus.BAD,
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
                        tables: {
                            count: structure.tables.length,
                            withHeaders: structure.tables.filter(table => table.hasHeader).length,
                            withCaption: structure.tables.filter(table => table.hasCaption).length,
                            accessibility: {
                                missingHeaders: structure.tables.filter(table => !table.hasHeader).length,
                                complexTables: structure.tables.filter(table => table.rows > 10 || table.columns > 5).length
                            }
                        },
                        blockquotes: {
                            count: structure.blockquotes.length,
                            withCitation: structure.blockquotes.filter(bq => bq.cite).length
                        },
                        codeBlocks: {
                            count: structure.codeBlocks.length,
                            withLanguage: structure.codeBlocks.filter(cb => cb.language).length,
                            languages: [...new Set(structure.codeBlocks.map(cb => cb.language).filter(Boolean))]
                        }
                    }
                }
            });
        }
        return assessments;
    }
    async checkTypographyMetrics(parsedContent) {
        const assessments = [];
        if (!parsedContent.typography) {
            return assessments;
        }
        const typography = parsedContent.typography;
        if (typography.fonts.length <= 3) {
            assessments.push({
                id: 'font-variety-good',
                type: assessment_types_1.AssessmentType.READABILITY,
                assessmentType: 'visual-design',
                name: 'Font Variety',
                description: `Uses ${typography.fonts.length} font families`,
                status: assessment_types_1.AssessmentStatus.GOOD,
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
        }
        else {
            assessments.push({
                id: 'font-variety-excessive',
                type: assessment_types_1.AssessmentType.READABILITY,
                assessmentType: 'visual-design',
                name: 'Too Many Fonts',
                description: `Uses ${typography.fonts.length} different font families`,
                status: assessment_types_1.AssessmentStatus.OK,
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
    calculateAdvancedMetrics(text) {
        const sentences = this.extractSentences(text);
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);
        const complexWords = words.filter(word => this.countSyllables(word) >= 3).length;
        const avgWordsPerSentence = words.length / sentences.length;
        const complexWordPercent = (complexWords / words.length) * 100;
        const gunningFog = 0.4 * (avgWordsPerSentence + complexWordPercent);
        const smog = 1.0430 * Math.sqrt(complexWords * (30 / sentences.length)) + 3.1291;
        const avgSentencesPer100Words = (sentences.length / words.length) * 100;
        const avgLettersPer100Words = (text.replace(/[^a-zA-Z]/g, '').length / words.length) * 100;
        const colemanLiau = 0.0588 * avgLettersPer100Words - 0.296 * avgSentencesPer100Words - 15.8;
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
    extractSentences(text) {
        return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    }
    countSyllables(word) {
        word = word.toLowerCase();
        if (word.length <= 3)
            return 1;
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        const matches = word.match(/[aeiouy]{1,2}/g);
        return matches ? matches.length : 1;
    }
    getReadabilityStatus(score, threshold) {
        if (score <= threshold)
            return assessment_types_1.AssessmentStatus.GOOD;
        if (score <= threshold + 3)
            return assessment_types_1.AssessmentStatus.OK;
        return assessment_types_1.AssessmentStatus.BAD;
    }
    interpretGunningFog(score) {
        if (score <= 8)
            return 'Elementary school level';
        if (score <= 12)
            return 'Middle/High school level';
        if (score <= 16)
            return 'College level';
        return 'Graduate level';
    }
    interpretSMOG(score) {
        if (score <= 9)
            return 'Elementary school level';
        if (score <= 13)
            return 'High school level';
        if (score <= 16)
            return 'College level';
        return 'Graduate level';
    }
    interpretColemanLiau(score) {
        if (score <= 8)
            return 'Elementary school level';
        if (score <= 12)
            return 'Middle/High school level';
        if (score <= 16)
            return 'College level';
        return 'Graduate level';
    }
    interpretAutomatedReadability(score) {
        if (score <= 8)
            return 'Elementary school level';
        if (score <= 12)
            return 'Middle/High school level';
        if (score <= 16)
            return 'College level';
        return 'Graduate level';
    }
}
exports.AdvancedReadabilityAssessor = AdvancedReadabilityAssessor;
//# sourceMappingURL=advanced-readability-assessor.service.js.map