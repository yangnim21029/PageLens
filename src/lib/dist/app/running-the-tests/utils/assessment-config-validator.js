"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentConfigValidator = void 0;
const assessment_types_1 = require("../types/assessment.types");
class AssessmentConfigValidator {
    static validateConfig(config) {
        const errors = [];
        const warnings = [];
        if (config.enableAll && (config.enabledAssessments || config.enableAllSEO || config.enableAllReadability)) {
            warnings.push('enableAll is true, specific assessment configurations will be ignored');
        }
        if (config.enabledAssessments) {
            const invalidAssessments = config.enabledAssessments.filter(assessment => !Object.values(assessment_types_1.AvailableAssessments).includes(assessment));
            if (invalidAssessments.length > 0) {
                errors.push(`Invalid assessments specified: ${invalidAssessments.join(', ')}`);
            }
            const notYetImplemented = config.enabledAssessments.filter(assessment => !assessment_types_1.ALL_CURRENT_ASSESSMENTS.includes(assessment));
            if (notYetImplemented.length > 0) {
                warnings.push(`The following assessments are not yet implemented and will be skipped: ${notYetImplemented.join(', ')}`);
            }
            const validAssessments = config.enabledAssessments.filter(assessment => assessment_types_1.ALL_CURRENT_ASSESSMENTS.includes(assessment));
            if (validAssessments.length === 0 && !config.enableAllSEO && !config.enableAllReadability) {
                warnings.push('No valid assessments enabled, no tests will be run');
            }
        }
        if (!config.enableAll &&
            !config.enableAllSEO &&
            !config.enableAllReadability &&
            (!config.enabledAssessments || config.enabledAssessments.length === 0)) {
            warnings.push('No assessments enabled, all assessments will be run by default');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    static getAvailableAssessments() {
        return {
            all: Object.values(assessment_types_1.AvailableAssessments),
            currentlyImplemented: assessment_types_1.ALL_CURRENT_ASSESSMENTS,
            seo: assessment_types_1.SEO_ASSESSMENTS,
            readability: assessment_types_1.READABILITY_ASSESSMENTS,
            futureImplementations: Object.values(assessment_types_1.AvailableAssessments).filter(assessment => !assessment_types_1.ALL_CURRENT_ASSESSMENTS.includes(assessment))
        };
    }
    static sanitizeConfig(config) {
        const sanitized = { ...config };
        if (sanitized.enabledAssessments) {
            sanitized.enabledAssessments = sanitized.enabledAssessments.filter(assessment => Object.values(assessment_types_1.AvailableAssessments).includes(assessment));
        }
        return sanitized;
    }
    static getConfigurationExamples() {
        return {
            enableAll: {
                enableAll: true
            },
            onlySEO: {
                enableAllSEO: true
            },
            onlyReadability: {
                enableAllReadability: true
            },
            specific: {
                enabledAssessments: [
                    assessment_types_1.AvailableAssessments.SINGLE_H1,
                    assessment_types_1.AvailableAssessments.ALT_ATTRIBUTE,
                    assessment_types_1.AvailableAssessments.FLESCH_READING_EASE
                ]
            },
            mixed: {
                enableAllSEO: true,
                enabledAssessments: [
                    assessment_types_1.AvailableAssessments.FLESCH_READING_EASE,
                    assessment_types_1.AvailableAssessments.PARAGRAPH_TOO_LONG
                ]
            }
        };
    }
}
exports.AssessmentConfigValidator = AssessmentConfigValidator;
//# sourceMappingURL=assessment-config-validator.js.map