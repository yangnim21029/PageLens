import { ExtendedAssessmentResult } from '../../types/extended-assessment.types';
import { ParsedContent } from '../../../understanding-the-page/types/parsed-content.types';
export declare class AdvancedReadabilityAssessor {
    runAdvancedReadabilityChecks(parsedContent: ParsedContent): Promise<ExtendedAssessmentResult[]>;
    private checkAdvancedReadabilityMetrics;
    private checkContentStructureMetrics;
    private checkTypographyMetrics;
    private calculateAdvancedMetrics;
    private extractSentences;
    private countSyllables;
    private getReadabilityStatus;
    private interpretGunningFog;
    private interpretSMOG;
    private interpretColemanLiau;
    private interpretAutomatedReadability;
}
