import { 
  AssessmentConfiguration, 
  AvailableAssessments, 
  ALL_CURRENT_ASSESSMENTS,
  SEO_ASSESSMENTS,
  READABILITY_ASSESSMENTS 
} from '../types/assessment.types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class AssessmentConfigValidator {
  
  /**
   * Validate assessment configuration
   */
  static validateConfig(config: AssessmentConfiguration): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for conflicting configurations
    if (config.enableAll && (config.enabledAssessments || config.enableAllSEO || config.enableAllReadability)) {
      warnings.push('enableAll is true, specific assessment configurations will be ignored');
    }

    // Validate specific assessments if provided
    if (config.enabledAssessments) {
      const invalidAssessments = config.enabledAssessments.filter(
        assessment => !Object.values(AvailableAssessments).includes(assessment)
      );

      if (invalidAssessments.length > 0) {
        errors.push(`Invalid assessments specified: ${invalidAssessments.join(', ')}`);
      }

      // Check for extended assessments that are not yet implemented
      const notYetImplemented = config.enabledAssessments.filter(
        assessment => !ALL_CURRENT_ASSESSMENTS.includes(assessment)
      );

      if (notYetImplemented.length > 0) {
        warnings.push(`The following assessments are not yet implemented and will be skipped: ${notYetImplemented.join(', ')}`);
      }

      // Warn if no valid assessments are enabled
      const validAssessments = config.enabledAssessments.filter(
        assessment => ALL_CURRENT_ASSESSMENTS.includes(assessment)
      );

      if (validAssessments.length === 0 && !config.enableAllSEO && !config.enableAllReadability) {
        warnings.push('No valid assessments enabled, no tests will be run');
      }
    }

    // Check for empty configuration
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

  /**
   * Get available assessment options for API documentation
   */
  static getAvailableAssessments() {
    return {
      all: Object.values(AvailableAssessments),
      currentlyImplemented: ALL_CURRENT_ASSESSMENTS,
      seo: SEO_ASSESSMENTS,
      readability: READABILITY_ASSESSMENTS,
      futureImplementations: Object.values(AvailableAssessments).filter(
        assessment => !ALL_CURRENT_ASSESSMENTS.includes(assessment)
      )
    };
  }

  /**
   * Sanitize configuration by removing invalid assessments
   */
  static sanitizeConfig(config: AssessmentConfiguration): AssessmentConfiguration {
    const sanitized = { ...config };

    if (sanitized.enabledAssessments) {
      sanitized.enabledAssessments = sanitized.enabledAssessments.filter(
        assessment => Object.values(AvailableAssessments).includes(assessment)
      );
    }

    return sanitized;
  }

  /**
   * Get configuration examples for documentation
   */
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
          AvailableAssessments.SINGLE_H1,
          AvailableAssessments.ALT_ATTRIBUTE,
          AvailableAssessments.FLESCH_READING_EASE
        ]
      },
      mixed: {
        enableAllSEO: true,
        enabledAssessments: [
          AvailableAssessments.FLESCH_READING_EASE,
          AvailableAssessments.PARAGRAPH_TOO_LONG
        ]
      }
    };
  }
}