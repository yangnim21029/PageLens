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
      details: assessment.details,
      standards: assessment.standards
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

  generateMarkdownReport(report: AuditReport): string {
    const { overallScores, detailedIssues } = report;
    
    // 分離 SEO 和可讀性評估
    const seoAssessments = detailedIssues.filter(issue => issue.assessmentType === 'seo');
    const readabilityAssessments = detailedIssues.filter(issue => issue.assessmentType === 'readability');
    
    // 生成 SEO 評估詳情
    const seoDetails = seoAssessments.map(issue => {
      const keyValue = this.extractKeyValue(issue);
      const emoji = issue.rating === 'good' ? '✅' : issue.rating === 'ok' ? '⚠️' : '❌';
      return `${emoji} \`${issue.id}\` - **分數=${issue.score}** - ${keyValue}`;
    }).join('\n');
    
    // 生成可讀性評估詳情
    const readabilityDetails = readabilityAssessments.map(issue => {
      const keyValue = this.extractKeyValue(issue);
      const emoji = issue.rating === 'good' ? '✅' : issue.rating === 'ok' ? '⚠️' : '❌';
      return `${emoji} \`${issue.id}\` - **分數=${issue.score}** - ${keyValue}`;
    }).join('\n');
    
    // 統計通過和失敗的項目
    const seoPassCount = seoAssessments.filter(i => i.rating === 'good').length;
    const readabilityPassCount = readabilityAssessments.filter(i => i.rating === 'good').length;
    
    return `## 📊 SEO 與可讀性評估報告

**URL:** ${report.url}  
**時間:** ${new Date(report.timestamp).toLocaleString('zh-TW')}

### 📈 分數總結
- **SEO 分數:** ${overallScores.seoScore}/100 (${this.translateGrade(overallScores.seoGrade)})
- **可讀性分數:** ${overallScores.readabilityScore}/100 (${this.translateGrade(overallScores.readabilityGrade)})
- **總分:** ${overallScores.overallScore}/100 (${this.translateGrade(overallScores.overallGrade)})

### 🔍 SEO 評估結果 (${seoPassCount}/${seoAssessments.length} 通過)
${seoDetails}

### 📖 可讀性評估結果 (${readabilityPassCount}/${readabilityAssessments.length} 通過)
${readabilityDetails}

### 💡 改進建議
${this.generateRecommendations(detailedIssues)}`;
  }

  private extractKeyValue(issue: DetailedIssue): string {
    const details = issue.details || {};
    
    // 根據不同評估類型提取關鍵數值
    if ('h1Count' in details) {
      return `H1數量=${details.h1Count}`;
    } else if ('imageCount' in details && 'imagesWithoutAlt' in details) {
      return `圖片數=${details.imageCount}, 無Alt=${details.imagesWithoutAlt}`;
    } else if ('density' in details) {
      return `密度=${details.density.toFixed(1)}%`;
    } else if ('length' in details) {
      return `長度=${details.length}字`;
    } else if ('wordCount' in details) {
      return `字數=${details.wordCount}`;
    } else if ('metaDescription' in details) {
      const meta = details.metaDescription;
      return meta ? `Meta="${meta.substring(0, 30)}..."` : 'Meta=空';
    } else if ('title' in details) {
      const title = details.title;
      return title ? `Title="${title.substring(0, 30)}..."` : 'Title=空';
    } else if ('fleschScore' in details) {
      return `Flesch分數=${details.fleschScore.toFixed(1)}`;
    } else if ('longParagraphs' in details && 'paragraphCount' in details) {
      return `長段落=${details.longParagraphs}/${details.paragraphCount}`;
    } else if ('longSentences' in details && 'sentenceCount' in details) {
      return `長句子=${details.longSentences}/${details.sentenceCount}`;
    } else if ('headingCount' in details && 'wordsPerHeading' in details) {
      return `子標題數=${details.headingCount}, 每標題字數=${Math.round(details.wordsPerHeading)}`;
    } else if ('headingCount' in details && 'wordCount' in details) {
      return `子標題數=${details.headingCount}, 總字數=${details.wordCount}`;
    }
    
    return issue.name;
  }

  private translateGrade(grade: string): string {
    const gradeMap: Record<string, string> = {
      'excellent': '優秀',
      'good': '良好',
      'needs-improvement': '需改進',
      'poor': '較差'
    };
    return gradeMap[grade] || grade;
  }

  private generateRecommendations(issues: DetailedIssue[]): string {
    const badIssues = issues.filter(i => i.rating === 'bad');
    const okIssues = issues.filter(i => i.rating === 'ok');
    
    if (badIssues.length === 0 && okIssues.length === 0) {
      return '🎉 太棒了！所有評估項目都通過了，繼續保持！';
    }
    
    const recommendations: string[] = [];
    
    // 優先顯示嚴重問題
    if (badIssues.length > 0) {
      recommendations.push('**需要立即改進的項目:**');
      badIssues.slice(0, 3).forEach(issue => {
        recommendations.push(`- ❌ **${issue.name}**: ${issue.recommendation}`);
      });
    }
    
    // 顯示建議改進項目
    if (okIssues.length > 0) {
      recommendations.push('\n**建議優化的項目:**');
      okIssues.slice(0, 2).forEach(issue => {
        recommendations.push(`- ⚠️ **${issue.name}**: ${issue.recommendation}`);
      });
    }
    
    return recommendations.join('\n');
  }
}