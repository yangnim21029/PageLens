import { NextRequest, NextResponse } from 'next/server';
import { AuditPipelineOrchestrator } from '@/lib/app/audit-pipeline.orchestrator';
import { AssessmentConfigValidator } from '@/lib/app/running-the-tests/utils/assessment-config-validator';
import type { AuditPipelineInput, AuditPipelineOptions } from '@/lib/app/audit-pipeline.orchestrator';

// Create a single instance of the orchestrator
const auditOrchestrator = new AuditPipelineOrchestrator();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html, url, htmlContent, pageDetails, focusKeyword, synonyms, options } = body;

    // 支援新的簡化格式和舊格式
    const finalHtmlContent = htmlContent || html;
    const finalPageDetails = pageDetails || { url: url || 'unknown' };
    const finalFocusKeyword = focusKeyword; // Allow empty/undefined for proper empty keyphrase handling

    if (!finalHtmlContent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: html or htmlContent'
        },
        { status: 400 }
      );
    }

    const auditOptions: AuditPipelineOptions = options || {};
    
    // Validate assessment configuration if provided
    if (auditOptions.assessmentConfig) {
      const validation = AssessmentConfigValidator.validateConfig(auditOptions.assessmentConfig);
      if (!validation.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid assessment configuration',
            details: validation.errors
          },
          { status: 400 }
        );
      }
      
      // Include warnings in response if any
      if (validation.warnings.length > 0) {
        console.warn('[Assessment Config] Warnings:', validation.warnings);
      }
      
      // Sanitize configuration
      auditOptions.assessmentConfig = AssessmentConfigValidator.sanitizeConfig(auditOptions.assessmentConfig);
    }

    const input: AuditPipelineInput = { 
      htmlContent: finalHtmlContent, 
      pageDetails: finalPageDetails, 
      focusKeyword: finalFocusKeyword, 
      synonyms 
    };

    const result = await auditOrchestrator.executeAuditPipeline(input, auditOptions);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        report: result.report, 
        processingTime: result.processingTime 
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Audit Route] 審核失敗:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Audit failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}