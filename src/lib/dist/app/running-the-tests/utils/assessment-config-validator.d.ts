import { AssessmentConfiguration, AvailableAssessments } from '../types/assessment.types';
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class AssessmentConfigValidator {
    static validateConfig(config: AssessmentConfiguration): ValidationResult;
    static getAvailableAssessments(): {
        all: AvailableAssessments[];
        currentlyImplemented: AvailableAssessments[];
        seo: AvailableAssessments[];
        readability: AvailableAssessments[];
        futureImplementations: AvailableAssessments[];
    };
    static sanitizeConfig(config: AssessmentConfiguration): AssessmentConfiguration;
    static getConfigurationExamples(): {
        enableAll: {
            enableAll: boolean;
        };
        onlySEO: {
            enableAllSEO: boolean;
        };
        onlyReadability: {
            enableAllReadability: boolean;
        };
        specific: {
            enabledAssessments: AvailableAssessments[];
        };
        mixed: {
            enableAllSEO: boolean;
            enabledAssessments: AvailableAssessments[];
        };
    };
}
