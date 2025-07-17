import { Router } from 'express';
import { AuditPipelineOrchestrator } from '../app/audit-pipeline.orchestrator';
export declare function createAppRoutes(orchestrator: AuditPipelineOrchestrator): Router;
