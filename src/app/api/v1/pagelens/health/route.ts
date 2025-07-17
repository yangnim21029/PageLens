import { NextResponse } from 'next/server';
import { AuditPipelineOrchestrator } from '@/lib/app/audit-pipeline.orchestrator';

const auditOrchestrator = new AuditPipelineOrchestrator();

export async function GET() {
  try {
    const stats = auditOrchestrator.getProcessingStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Health check failed' },
      { status: 500 }
    );
  }
}