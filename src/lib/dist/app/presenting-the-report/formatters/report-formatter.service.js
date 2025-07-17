"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportFormatter = void 0;
const report_types_1 = require("../types/report.types");
const assessment_types_1 = require("../../running-the-tests/types/assessment.types");
class ReportFormatter {
    generateReport(testResults, url) {
        try {
            const overallScores = this.formatOverallScores(testResults);
            const detailedIssues = this.formatDetailedIssues(testResults.assessments);
            const summary = this.generateSummary(detailedIssues);
            const report = {
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate report'
            };
        }
    }
    formatOverallScores(testResults) {
        return {
            seoScore: testResults.seoScore,
            readabilityScore: testResults.readabilityScore,
            overallScore: testResults.overallScore,
            seoGrade: this.scoreToGrade(testResults.seoScore),
            readabilityGrade: this.scoreToGrade(testResults.readabilityScore),
            overallGrade: this.scoreToGrade(testResults.overallScore)
        };
    }
    formatDetailedIssues(assessments) {
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
    generateSummary(detailedIssues) {
        const goodIssues = detailedIssues.filter(issue => issue.rating === report_types_1.IssueRating.GOOD);
        const okIssues = detailedIssues.filter(issue => issue.rating === report_types_1.IssueRating.OK);
        const badIssues = detailedIssues.filter(issue => issue.rating === report_types_1.IssueRating.BAD);
        const criticalIssues = detailedIssues.filter(issue => issue.rating === report_types_1.IssueRating.BAD && issue.impact === 'high');
        const quickWins = detailedIssues.filter(issue => issue.rating === report_types_1.IssueRating.OK && issue.impact === 'high');
        return {
            totalIssues: detailedIssues.length,
            goodIssues: goodIssues.length,
            okIssues: okIssues.length,
            badIssues: badIssues.length,
            criticalIssues: criticalIssues.sort((a, b) => b.score - a.score).slice(0, 3),
            quickWins: quickWins.sort((a, b) => b.score - a.score).slice(0, 3)
        };
    }
    scoreToGrade(score) {
        if (score >= 90)
            return report_types_1.ScoreGrade.EXCELLENT;
        if (score >= 75)
            return report_types_1.ScoreGrade.GOOD;
        if (score >= 50)
            return report_types_1.ScoreGrade.NEEDS_IMPROVEMENT;
        return report_types_1.ScoreGrade.POOR;
    }
    statusToRating(status) {
        switch (status) {
            case assessment_types_1.AssessmentStatus.GOOD: return report_types_1.IssueRating.GOOD;
            case assessment_types_1.AssessmentStatus.OK: return report_types_1.IssueRating.OK;
            case assessment_types_1.AssessmentStatus.BAD: return report_types_1.IssueRating.BAD;
            default: return report_types_1.IssueRating.OK;
        }
    }
    generateTextSummary(report) {
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
    generateJSONReport(report) {
        return JSON.stringify(report, null, 2);
    }
}
exports.ReportFormatter = ReportFormatter;
//# sourceMappingURL=report-formatter.service.js.map