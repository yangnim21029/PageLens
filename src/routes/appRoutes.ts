import { Router } from 'express';
import { AuditPipelineOrchestrator, AuditPipelineInput, AuditPipelineOptions } from '../app/audit-pipeline.orchestrator';
import { AssessmentConfigValidator } from '../app/running-the-tests/utils/assessment-config-validator';

/**
 * 創建應用程式路由
 * 處理核心審核功能
 */
export function createAppRoutes(
  orchestrator: AuditPipelineOrchestrator
): Router {
  const router = Router();

  // POST /api/v1/pagelens - 執行單個頁面審核
  router.post('/pagelens', async (req, res) => {
    try {
      const { html, url, htmlContent, pageDetails, focusKeyword, synonyms, options } = req.body;

      // 支援新的簡化格式和舊格式
      const finalHtmlContent = htmlContent || html;
      const finalPageDetails = pageDetails || { url: url || 'unknown' };
      const finalFocusKeyword = focusKeyword || 'SEO';

      if (!finalHtmlContent) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: html or htmlContent'
        });
        return;
      }

      const auditOptions: AuditPipelineOptions = options || {};
      
      // Validate assessment configuration if provided
      if (auditOptions.assessmentConfig) {
        const validation = AssessmentConfigValidator.validateConfig(auditOptions.assessmentConfig);
        if (!validation.isValid) {
          res.status(400).json({
            success: false,
            error: 'Invalid assessment configuration',
            details: validation.errors
          });
          return;
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

      const result = await orchestrator.executeAuditPipeline(input, auditOptions);

      if (result.success) {
        res.json({ success: true, report: result.report, processingTime: result.processingTime });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('[Audit Route] 審核失敗:', error);
      res.status(500).json({
        success: false,
        error: 'Audit failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/v1/pagelens/batch - 執行批量頁面審核
  router.post('/pagelens/batch', async (req, res) => {
    try {
      const { audits } = req.body; // audits: Array<{ htmlContent, pageDetails, focusKeyword, synonyms, options }>

      if (!Array.isArray(audits) || audits.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Audits must be a non-empty array'
        });
        return;
      }

      if (audits.length > 10) { // Limit batch size
        res.status(400).json({
          success: false,
          error: 'Maximum 10 audits allowed per batch'
        });
        return;
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
          return await orchestrator.executeAuditPipeline(input, auditOptions);
        })
      );

      const successfulAudits = results.filter(r => r.success).length;
      const failedAudits = results.length - successfulAudits;

      res.json({
        success: true,
        totalAudits: results.length,
        successfulAudits,
        failedAudits,
        results,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[Batch Audit Route] 批量審核失敗:', error);
      res.status(500).json({
        success: false,
        error: 'Batch audit failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/v1/pagelens/health - 獲取處理統計信息
  router.get('/pagelens/health', (req, res) => {
    const stats = orchestrator.getProcessingStats();
    res.json({ success: true, stats });
  });

  // GET /api/v1/pagelens/assessments - 獲取可用的檢測項目
  router.get('/pagelens/assessments', (req, res) => {
    const assessments = AssessmentConfigValidator.getAvailableAssessments();
    const examples = AssessmentConfigValidator.getConfigurationExamples();
    
    res.json({ 
      success: true, 
      assessments,
      configurationExamples: examples
    });
  });

  return router;
}