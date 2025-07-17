import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'PageLens Service',
    version: '1.0.0',
    description: 'Specialized service for WordPress SEO page auditing',
    focus: 'WordPress page SEO analysis and auditing',
    status: 'healthy',
    platform: 'Next.js on Vercel',
    features: [
      'WordPress Page Auditing',
      'SEO Content Analysis',
      'Batch Processing',
      'Health Monitoring'
    ],
    timestamp: new Date().toISOString(),
    endpoints: {
      pageAudit: 'POST /api/v1/pagelens - Audit WordPress page',
      batchPageAudit: 'POST /api/v1/pagelens/batch - Batch audit pages',
      pageAuditHealth: 'GET /api/v1/pagelens/health - Page audit service status',
      availableAssessments: 'GET /api/v1/pagelens/assessments - Get available assessments'
    }
  });
}