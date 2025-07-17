import { AssessmentResult } from '../../types/assessment.types';
import { ParsedContent } from '../../../understanding-the-page/types/parsed-content.types';
export declare class ReadabilityAssessor {
    runReadabilityChecks(parsedContent: ParsedContent): Promise<AssessmentResult[]>;
    private checkSentenceLength;
    private checkFleschReadingEase;
    private checkParagraphLength;
    private checkSubheadingDistribution;
    private extractSentences;
    private calculateFleschReadingEase;
    private countSyllables;
    private countWordsInSentence;
    private getLongSentenceThreshold;
}
