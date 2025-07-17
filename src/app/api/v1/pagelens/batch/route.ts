import { NextRequest, NextResponse } from 'next/server';
import { AuditPipelineOrchestrator } from '@/lib/app/audit-pipeline.orchestrator';
import { AssessmentConfigValidator } from '@/lib/app/running-the-tests/utils/assessment-config-validator';
import type { AuditPipelineInput, AuditPipelineOptions } from '@/lib/app/audit-pipeline.orchestrator';

const auditOrchestrator = new AuditPipelineOrchestrator();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audits } = body; // audits: Array<{ htmlContent, pageDetails, focusKeyword, synonyms, options }>

    if (!Array.isArray(audits) || audits.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Audits must be a non-empty array'
        },
        { status: 400 }
      );
    }

    if (audits.length > 10) { // Limit batch size
      return NextResponse.json(
        {
          success: false,
          error: 'Maximum 10 audits allowed per batch'
        },
        { status: 400 }
      );
    }

    console.log(`[Batch Audit Route] 處理 ${audits.length} 個審核請求`);

    const results = await Promise.all(
      audits.map(async (audit: any, index: number) => {
        const { htmlContent, pageDetails, focusKeyword, synonyms, options } = audit;
        if (!htmlContent || !pageDetails || !focusKeyword) {
          return { success: false, error: 'Missing required fields in one or more audit inputs' };
        }
        
        const auditOptions: AuditPipelineOptions = options || {};
        
        // Validate assessment configuration if provided
        if (auditOptions.assessmentConfig) {
          const validation = AssessmentConfigValidator.validateConfig(auditOptions.assessmentConfig);
          if (!validation.isValid) {
            return { 
              success: false, 
              error: `Invalid assessment configuration for audit ${index + 1}: ${validation.errors.join(', ')}` 
            };
          }
          
          // Sanitize configuration
          auditOptions.assessmentConfig = AssessmentConfigValidator.sanitizeConfig(auditOptions.assessmentConfig);
        }
        
        const input: AuditPipelineInput = { htmlContent, pageDetails, focusKeyword, synonyms };
        return await auditOrchestrator.executeAuditPipeline(input, auditOptions);
      })
    );

    const successfulAudits = results.filter(r => r.success).length;
    const failedAudits = results.length - successfulAudits;

    return NextResponse.json({
      success: true,
      totalAudits: results.length,
      successfulAudits,
      failedAudits,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Batch Audit Route] 批量審核失敗:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Batch audit failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}