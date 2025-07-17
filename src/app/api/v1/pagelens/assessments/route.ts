import { NextResponse } from 'next/server';
import { AssessmentConfigValidator } from '@/lib/app/running-the-tests/utils/assessment-config-validator';

export async function GET() {
  try {
    const assessments = AssessmentConfigValidator.getAvailableAssessments();
    const examples = AssessmentConfigValidator.getConfigurationExamples();
    
    return NextResponse.json({ 
      success: true, 
      assessments,
      configurationExamples: examples
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get assessments' },
      { status: 500 }
    );
  }
}