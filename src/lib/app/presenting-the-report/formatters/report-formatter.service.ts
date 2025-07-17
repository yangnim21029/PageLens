import { 
  AuditReport, 
  OverallScores, 
  DetailedIssue, 
  ReportSummary, 
  ScoreGrade, 
  IssueRating,
  ReportGenerationResult 
} from '../types/report.types';
import { TestResults, AssessmentResult, AssessmentStatus } from '../../running-the-tests/types/assessment.types';

export class ReportFormatter {
  generateReport(testResults: TestResults, url: string): ReportGenerationResult {
    try {
      const overallScores = this.formatOverallScores(testResults);
      const detailedIssues = this.formatDetailedIssues(testResults.assessments);
      const summary = this.generateSummary(detailedIssues);

      const report: AuditReport = {
        url,
        timestamp: testResults.timestamp,
        overallScores,
        detailedIssues,
        summary
      };

      return {
        success: true,
        report
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate report'
      };
    }
  }

  private formatOverallScores(testResults: TestResults): OverallScores {
    return {
      seoScore: testResults.seoScore,
      readabilityScore: testResults.readabilityScore,
      overallScore: testResults.overallScore,
      seoGrade: this.scoreToGrade(testResults.seoScore),
      readabilityGrade: this.scoreToGrade(testResults.readabilityScore),
      overallGrade: this.scoreToGrade(testResults.overallScore)
    };
  }

  private formatDetailedIssues(assessments: AssessmentResult[]): DetailedIssue[] {
    return assessments.map(assessment => ({
      id: assessment.id,
      name: assessment.name,
      description: assessment.description,
      rating: this.statusToRating(assessment.status),
      recommendation: assessment.recommendation,
      impact: assessment.impact,
      assessmentType: assessment.type,
      score: assessment.score,
      details: assessment.details
    }));
  }

  private generateSummary(detailedIssues: DetailedIssue[]): ReportSummary {
    const goodIssues = detailedIssues.filter(issue => issue.rating === IssueRating.GOOD);
    const okIssues = detailedIssues.filter(issue => issue.rating === IssueRating.OK);
    const badIssues = detailedIssues.filter(issue => issue.rating === IssueRating.BAD);

    const criticalIssues = detailedIssues.filter(issue => 
      issue.rating === IssueRating.BAD && issue.impact === 'high'
    );

    const quickWins = detailedIssues.filter(issue => 
      issue.rating === IssueRating.OK && issue.impact === 'high'
    );

    return {
      totalIssues: detailedIssues.length,
      goodIssues: goodIssues.length,
      okIssues: okIssues.length,
      badIssues: badIssues.length,
      criticalIssues: criticalIssues.sort((a, b) => b.score - a.score).slice(0, 3),
      quickWins: quickWins.sort((a, b) => b.score - a.score).slice(0, 3)
    };
  }

  private scoreToGrade(score: number): ScoreGrade {
    if (score >= 90) return ScoreGrade.EXCELLENT;
    if (score >= 75) return ScoreGrade.GOOD;
    if (score >= 50) return ScoreGrade.NEEDS_IMPROVEMENT;
    return ScoreGrade.POOR;
  }

  private statusToRating(status: AssessmentStatus): IssueRating {
    switch (status) {
      case AssessmentStatus.GOOD: return IssueRating.GOOD;
      case AssessmentStatus.OK: return IssueRating.OK;
      case AssessmentStatus.BAD: return IssueRating.BAD;
      default: return IssueRating.OK;
    }
  }

  // Helper methods for different report formats
  generateTextSummary(report: AuditReport): string {
    const { overallScores, summary } = report;
    
    return `
SEO & Readability Audit Report
==============================

Overall Scores:
- SEO Score: ${overallScores.seoScore}/100 (${overallScores.seoGrade})
- Readability Score: ${overallScores.readabilityScore}/100 (${overallScores.readabilityGrade})
- Overall Score: ${overallScores.overallScore}/100 (${overallScores.overallGrade})

Summary:
- Total Issues: ${summary.totalIssues}
- Good: ${summary.goodIssues} | OK: ${summary.okIssues} | Bad: ${summary.badIssues}
- Critical Issues: ${summary.criticalIssues.length}
- Quick Wins: ${summary.quickWins.length}

Generated: ${report.timestamp.toLocaleString()}
    `.trim();
  }

  generateJSONReport(report: AuditReport): string {
    return JSON.stringify(report, null, 2);
  }
}