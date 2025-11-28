import { IngredientsGatherer } from './gathering-ingredients/services/ingredients-gatherer.service';
import { ReportFormatter } from './presenting-the-report/formatters/report-formatter.service';
import { TestRunner } from './running-the-tests/assessments/test-runner.service';
import {
  ContentExtractionOptions,
  ContentExtractor
} from './understanding-the-page/extractors/content-extractor.service';
import { AssessmentConfiguration } from './running-the-tests/types/assessment.types';

import { PageDetails } from './gathering-ingredients/types/ingredients.types';
import { AuditReport } from './presenting-the-report/types/report.types';
import { ParsedContent } from './understanding-the-page/types/parsed-content.types';

export interface AuditPipelineInput {
  htmlContent: string;
  pageDetails: PageDetails;
  focusKeyword: string;
  relatedKeywords?: string[];
  synonyms?: string[];  // 預留給未來真正的同義詞功能
}

export interface AuditPipelineOptions {
  contentSelectors?: string[];
  excludeSelectors?: string[];
  extractMainContent?: boolean;
  baseUrl?: string;
  assessmentConfig?: AssessmentConfiguration;
}

export interface PageUnderstanding {
  // 基本資訊
  title: string;
  metaDescription?: string;
  wordCount: number;
  readingTime: number; // 分鐘
  
  // 內容結構
  headingStructure: {
    h1Count: number;
    h2Count: number;
    totalHeadings: number;
    h1Text?: string;
    headings: Array<{
      tag: string;
      text: string;
      level: number;
      order: number;
    }>;
    h2Headings: Array<{
      tag: string;
      text: string;
      order: number;
    }>;
    h2Texts: string[];
  };
  
  // 媒體資訊
  mediaInfo: {
    imageCount: number;
    imagesWithoutAlt: number;
    videoCount: number;
    imagesWithAlt: Array<{
      src: string;
      alt: string;
    }>;
    altTexts: string[];
  };
  
  // 連結資訊
  linkInfo: {
    totalLinks: number;
    externalLinks: number;
    internalLinks: number;
    internalLinkList: Array<{
      href: string;
      text: string;
    }>;
    allLinks: Array<{
      href: string;
      text: string;
      isExternal: boolean;
      isNoFollow: boolean;
      title?: string;
      rel?: string;
      target?: string;
      isUGC?: boolean;
      isSponsored?: boolean;
    }>;
  };
  
  // 文字統計
  textStats: {
    paragraphCount: number;
    sentenceCount: number;
    averageWordsPerSentence: number;
  };
}

export interface AuditPipelineResult {
  success: boolean;
  report?: AuditReport;
  pageUnderstanding?: PageUnderstanding;
  error?: string;
  processingTime?: number;
}

export class AuditPipelineOrchestrator {
  private ingredientsGatherer: IngredientsGatherer;
  private contentExtractor: ContentExtractor;
  private testRunner: TestRunner;
  private reportFormatter: ReportFormatter;

  constructor() {
    this.ingredientsGatherer = new IngredientsGatherer();
    this.contentExtractor = new ContentExtractor();
    this.testRunner = new TestRunner();
    this.reportFormatter = new ReportFormatter();
  }

  async executeAuditPipeline(
    input: AuditPipelineInput,
    options: AuditPipelineOptions = {}
  ): Promise<AuditPipelineResult> {
    const startTime = Date.now();

    try {
      // Step 1: Gathering Ingredients
      const ingredientsResult =
        await this.ingredientsGatherer.gatherIngredients(input);
      if (!ingredientsResult.success || !ingredientsResult.ingredients) {
        return {
          success: false,
          error: `Ingredients gathering failed: ${ingredientsResult.error}`,
          processingTime: Date.now() - startTime
        };
      }

      // Step 2: Understanding the Page
      const extractionOptions: ContentExtractionOptions = {
        contentSelectors: options.contentSelectors,
        excludeSelectors: options.excludeSelectors,
        baseUrl: options.baseUrl || input.pageDetails.url,
        extractMainContent: options.extractMainContent
      };

      const extractionResult = await this.contentExtractor.extractContent(
        input.htmlContent,
        extractionOptions
      );
      if (!extractionResult.success || !extractionResult.parsedContent) {
        return {
          success: false,
          error: `Content extraction failed: ${extractionResult.error}`,
          processingTime: Date.now() - startTime
        };
      }

      // Step 3: Running the Tests
      const testResult = await this.testRunner.runTests(
        extractionResult.parsedContent,
        ingredientsResult.ingredients,
        options.assessmentConfig
      );
      if (!testResult.success || !testResult.results) {
        return {
          success: false,
          error: `Test execution failed: ${testResult.error}`,
          processingTime: Date.now() - startTime
        };
      }

      // Step 4: Presenting the Report
      const reportResult = this.reportFormatter.generateReport(
        testResult.results,
        input.pageDetails.url
      );
      if (!reportResult.success || !reportResult.report) {
        return {
          success: false,
          error: `Report generation failed: ${reportResult.error}`,
          processingTime: Date.now() - startTime
        };
      }

      const pageUnderstanding = this.createPageUnderstanding(extractionResult.parsedContent);
      
      return {
        success: true,
        report: reportResult.report,
        pageUnderstanding,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error in audit pipeline',
        processingTime: Date.now() - startTime
      };
    }
  }

  // Helper method to create simplified page understanding from parsed content
  private createPageUnderstanding(parsedContent: ParsedContent): PageUnderstanding {
    const h1Headings = parsedContent.headings.filter(h => h.level === 1);
    const h2Headings = parsedContent.headings.filter(h => h.level === 2);
    const headingDetails = parsedContent.headings.map(h => ({
      tag: `h${h.level}`,
      text: h.text,
      level: h.level,
      order: h.order
    }));
    const h2HeadingDetails = h2Headings.map(h => ({
      tag: 'h2',
      text: h.text,
      order: h.order
    }));
    const externalLinks = parsedContent.links.filter(l => l.isExternal);
    const internalLinks = parsedContent.links.filter(l => !l.isExternal);
    const imagesWithoutAlt = parsedContent.images.filter(img => !img.alt || img.alt.trim() === '');
    const imagesWithAlt = parsedContent.images
      .filter(img => img.alt && img.alt.trim().length > 0)
      .map(img => ({
        src: img.src,
        alt: (img.alt || '').trim()
      }));
    const internalLinkList = internalLinks.map(link => ({
      href: link.href,
      text: link.text
    }));
    const allLinks = parsedContent.links.map(link => ({
      href: link.href,
      text: link.text,
      isExternal: link.isExternal,
      isNoFollow: link.isNoFollow,
      title: link.title,
      rel: link.rel,
      target: link.target,
      isUGC: link.isUGC,
      isSponsored: link.isSponsored
    }));
    
    // Calculate average words per sentence
    const sentences = parsedContent.textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = parsedContent.textContent.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
    
    return {
      title: parsedContent.title,
      metaDescription: parsedContent.metaDescription,
      wordCount: parsedContent.wordCount,
      readingTime: parsedContent.textStats.readingTime,
      
      headingStructure: {
        h1Count: h1Headings.length,
        h2Count: h2Headings.length,
        totalHeadings: parsedContent.headings.length,
        h1Text: h1Headings[0]?.text,
        headings: headingDetails,
        h2Headings: h2HeadingDetails,
        h2Texts: h2HeadingDetails.map(h => h.text)
      },
      
      mediaInfo: {
        imageCount: parsedContent.images.length,
        imagesWithoutAlt: imagesWithoutAlt.length,
        videoCount: parsedContent.videos.length,
        imagesWithAlt,
        altTexts: imagesWithAlt.map(img => img.alt)
      },
      
      linkInfo: {
        totalLinks: parsedContent.links.length,
        externalLinks: externalLinks.length,
        internalLinks: internalLinks.length,
        internalLinkList,
        allLinks
      },
      
      textStats: {
        paragraphCount: parsedContent.textStats.paragraphCount,
        sentenceCount: parsedContent.textStats.sentences,
        averageWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10
      }
    };
  }

  // Helper method to get processing statistics
  getProcessingStats(): any {
    return {
      pipelineSteps: [
        'Gathering Ingredients',
        'Understanding the Page',
        'Running the Tests',
        'Presenting the Report'
      ],
      supportedChecks: {
        seo: [
          'H1 Tag Validation',
          'Image Alt Text',
          'Keyword Optimization',
          'Meta Elements',
          'Content Length'
        ],
        readability: [
          'Sentence Length',
          'Flesch Reading Ease',
          'Paragraph Length',
          'Subheading Distribution'
        ]
      }
    };
  }
}
