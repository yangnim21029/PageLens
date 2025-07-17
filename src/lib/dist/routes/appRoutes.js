"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppRoutes = createAppRoutes;
const express_1 = require("express");
const assessment_config_validator_1 = require("../app/running-the-tests/utils/assessment-config-validator");
function createAppRoutes(orchestrator) {
    const router = (0, express_1.Router)();
    router.post('/pagelens', async (req, res) => {
        try {
            const { html, url, htmlContent, pageDetails, focusKeyword, synonyms, options } = req.body;
            const finalHtmlContent = htmlContent || html;
            const finalPageDetails = pageDetails || { url: url || 'unknown' };
            const finalFocusKeyword = focusKeyword;
            if (!finalHtmlContent) {
                res.status(400).json({
                    success: false,
                    error: 'Missing required field: html or htmlContent'
                });
                return;
            }
            const auditOptions = options || {};
            if (auditOptions.assessmentConfig) {
                const validation = assessment_config_validator_1.AssessmentConfigValidator.validateConfig(auditOptions.assessmentConfig);
                if (!validation.isValid) {
                    res.status(400).json({
                        success: false,
                        error: 'Invalid assessment configuration',
                        details: validation.errors
                    });
                    return;
                }
                if (validation.warnings.length > 0) {
                    console.warn('[Assessment Config] Warnings:', validation.warnings);
                }
                auditOptions.assessmentConfig = assessment_config_validator_1.AssessmentConfigValidator.sanitizeConfig(auditOptions.assessmentConfig);
            }
            const input = {
                htmlContent: finalHtmlContent,
                pageDetails: finalPageDetails,
                focusKeyword: finalFocusKeyword,
                synonyms
            };
            const result = await orchestrator.executeAuditPipeline(input, auditOptions);
            if (result.success) {
                res.json({ success: true, report: result.report, processingTime: result.processingTime });
            }
            else {
                res.status(500).json({ success: false, error: result.error });
            }
        }
        catch (error) {
            console.error('[Audit Route] 審核失敗:', error);
            res.status(500).json({
                success: false,
                error: 'Audit failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    router.post('/pagelens/batch', async (req, res) => {
        try {
            const { audits } = req.body;
            if (!Array.isArray(audits) || audits.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'Audits must be a non-empty array'
                });
                return;
            }
            if (audits.length > 10) {
                res.status(400).json({
                    success: false,
                    error: 'Maximum 10 audits allowed per batch'
                });
                return;
            }
            console.log(`[Batch Audit Route] 處理 ${audits.length} 個審核請求`);
            const results = await Promise.all(audits.map(async (audit, index) => {
                const { htmlContent, pageDetails, focusKeyword, synonyms, options } = audit;
                if (!htmlContent || !pageDetails || !focusKeyword) {
                    return { success: false, error: 'Missing required fields in one or more audit inputs' };
                }
                const auditOptions = options || {};
                if (auditOptions.assessmentConfig) {
                    const validation = assessment_config_validator_1.AssessmentConfigValidator.validateConfig(auditOptions.assessmentConfig);
                    if (!validation.isValid) {
                        return {
                            success: false,
                            error: `Invalid assessment configuration for audit ${index + 1}: ${validation.errors.join(', ')}`
                        };
                    }
                    auditOptions.assessmentConfig = assessment_config_validator_1.AssessmentConfigValidator.sanitizeConfig(auditOptions.assessmentConfig);
                }
                const input = { htmlContent, pageDetails, focusKeyword, synonyms };
                return await orchestrator.executeAuditPipeline(input, auditOptions);
            }));
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
        }
        catch (error) {
            console.error('[Batch Audit Route] 批量審核失敗:', error);
            res.status(500).json({
                success: false,
                error: 'Batch audit failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    router.get('/pagelens/health', (req, res) => {
        const stats = orchestrator.getProcessingStats();
        res.json({ success: true, stats });
    });
    router.get('/pagelens/assessments', (req, res) => {
        const assessments = assessment_config_validator_1.AssessmentConfigValidator.getAvailableAssessments();
        const examples = assessment_config_validator_1.AssessmentConfigValidator.getConfigurationExamples();
        res.json({
            success: true,
            assessments,
            configurationExamples: examples
        });
    });
    return router;
}
//# sourceMappingURL=appRoutes.js.map