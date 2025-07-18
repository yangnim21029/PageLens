#!/usr/bin/env node

/**
 * Assessment ID Consistency Test
 * 
 * This script verifies that assessment IDs in documentation match
 * the actual enum values in the codebase and API endpoints.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Read the assessment types from the actual enum file
function getActualAssessmentIds() {
  const assessmentTypesPath = path.join(__dirname, '../lib/app/running-the-tests/types/assessment.types.ts');
  const content = fs.readFileSync(assessmentTypesPath, 'utf8');
  
  // Extract enum values using regex
  const enumMatch = content.match(/export enum AssessmentType \{([\s\S]*?)\}/);
  if (!enumMatch) {
    throw new Error('Could not find AssessmentType enum');
  }
  
  const enumContent = enumMatch[1];
  const idMatches = enumContent.match(/\s*([A-Z_]+)\s*=\s*'([A-Z_]+)',?/g);
  
  if (!idMatches) {
    throw new Error('Could not extract enum values');
  }
  
  const actualIds = {};
  idMatches.forEach(match => {
    const [, key, value] = match.match(/\s*([A-Z_]+)\s*=\s*'([A-Z_]+)',?/);
    if (key && value && !key.startsWith('EXTENDED_')) {
      actualIds[key] = value;
    }
  });
  
  return actualIds;
}

// Read assessment IDs from API documentation
function getDocumentedAssessmentIds() {
  const apiDocsPath = path.join(__dirname, '../api/index.ts');
  const content = fs.readFileSync(apiDocsPath, 'utf8');
  
  // Extract SEO assessments
  const seoMatch = content.match(/"seoAssessments":\s*\[([\s\S]*?)\]/);
  const readabilityMatch = content.match(/"readabilityAssessments":\s*\[([\s\S]*?)\]/);
  
  if (!seoMatch || !readabilityMatch) {
    throw new Error('Could not find assessment lists in API docs');
  }
  
  const extractIds = (matchContent) => {
    const idMatches = matchContent.match(/"([A-Z_]+)"/g);
    return idMatches ? idMatches.map(id => id.replace(/"/g, '')) : [];
  };
  
  const seoIds = extractIds(seoMatch[1]);
  const readabilityIds = extractIds(readabilityMatch[1]);
  
  return [...seoIds, ...readabilityIds];
}

// Read assessment IDs from CLAUDE.md
function getClauldeMdAssessmentIds() {
  const claudeMdPath = path.join(__dirname, '../CLAUDE.md');
  const content = fs.readFileSync(claudeMdPath, 'utf8');
  
  // Extract enum section
  const enumMatch = content.match(/```typescript\s*\/\/ SEO Assessments([\s\S]*?)```/);
  if (!enumMatch) {
    throw new Error('Could not find assessment enum in CLAUDE.md');
  }
  
  const idMatches = enumMatch[1].match(/^([A-Z_]+)\s*=/gm);
  if (!idMatches) {
    throw new Error('Could not extract IDs from CLAUDE.md');
  }
  
  return idMatches.map(match => match.replace(/\s*=.*/, ''));
}

// Test API endpoints for actual ID usage
async function testApiEndpoints() {
  const testUrl = process.env.API_URL || 'http://localhost:3000';
  
  console.log(`🌐 Testing API endpoints at: ${testUrl}`);
  
  // Test WordPress URL endpoint first
  const wpTestPayload = {
    url: 'https://pretty.presslogic.com/article/746508/%E7%94%B7%E5%A3%AB%E9%AB%AE%E5%9E%8B%E6%8E%A8%E8%96%A6'
  };
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(wpTestPayload);
    const options = {
      hostname: testUrl.includes('localhost') ? 'localhost' : testUrl.replace(/https?:\/\//, ''),
      port: testUrl.includes('localhost') ? 3000 : (testUrl.startsWith('https') ? 443 : 80),
      path: '/analyze-wp-url',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const protocol = testUrl.startsWith('https') ? https : http;
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (!response.success || !response.report) {
            reject(new Error(`API request failed: ${data}`));
            return;
          }
          
          const apiIds = response.report.detailedIssues.map(issue => issue.id);
          resolve(apiIds);
          
        } catch (error) {
          reject(new Error(`Failed to parse API response: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Main test function
async function testAssessmentIdConsistency() {
  console.log('🧪 Testing Assessment ID Consistency...\n');
  
  try {
    const actualIds = getActualAssessmentIds();
    const documentedIds = getDocumentedAssessmentIds();
    const claudeMdIds = getClauldeMdAssessmentIds();
    
    console.log('📋 Found Assessment IDs:');
    console.log(`  Actual enum: ${Object.keys(actualIds).length} IDs`);
    console.log(`  API docs: ${documentedIds.length} IDs`);
    console.log(`  CLAUDE.md: ${claudeMdIds.length} IDs\n`);
    
    // Test live API endpoints
    let apiReturnedIds = [];
    try {
      apiReturnedIds = await testApiEndpoints();
      console.log(`  Live API: ${apiReturnedIds.length} IDs returned\n`);
    } catch (error) {
      console.log(`  Live API: ⚠️  Could not test (${error.message})\n`);
    }
    
    // Check if documented IDs exist in actual enum
    let hasErrors = false;
    
    console.log('🔍 Checking API Documentation IDs:');
    documentedIds.forEach(id => {
      if (!actualIds[id]) {
        console.log(`  ❌ ID "${id}" in API docs but not in enum`);
        hasErrors = true;
      } else if (actualIds[id] !== id) {
        console.log(`  ❌ ID "${id}" enum value mismatch: "${actualIds[id]}"`);
        hasErrors = true;
      } else {
        console.log(`  ✅ ${id}`);
      }
    });
    
    console.log('\n🔍 Checking CLAUDE.md IDs:');
    claudeMdIds.forEach(id => {
      if (!actualIds[id]) {
        console.log(`  ❌ ID "${id}" in CLAUDE.md but not in enum`);
        hasErrors = true;
      } else if (actualIds[id] !== id) {
        console.log(`  ❌ ID "${id}" enum value mismatch: "${actualIds[id]}"`);
        hasErrors = true;
      } else {
        console.log(`  ✅ ${id}`);
      }
    });
    
    // Check for missing IDs in documentation
    console.log('\n🔍 Checking for Missing IDs in Documentation:');
    Object.keys(actualIds).forEach(id => {
      if (!documentedIds.includes(id)) {
        console.log(`  ⚠️  ID "${id}" in enum but missing from API docs`);
        hasErrors = true;
      }
      if (!claudeMdIds.includes(id)) {
        console.log(`  ⚠️  ID "${id}" in enum but missing from CLAUDE.md`);
        hasErrors = true;
      }
    });
    
    // Check live API endpoint IDs if available
    if (apiReturnedIds.length > 0) {
      console.log('\n🔍 Checking Live API Response IDs:');
      const uniqueApiIds = [...new Set(apiReturnedIds)];
      
      uniqueApiIds.forEach(id => {
        if (!actualIds[id]) {
          console.log(`  ❌ API returned ID "${id}" but not found in enum`);
          hasErrors = true;
        } else if (actualIds[id] !== id) {
          console.log(`  ❌ API returned ID "${id}" with enum value mismatch: "${actualIds[id]}"`);
          hasErrors = true;
        } else {
          console.log(`  ✅ ${id} (returned by API)`);
        }
      });
      
      // Check if API is missing any expected IDs
      Object.keys(actualIds).forEach(id => {
        if (!uniqueApiIds.includes(id)) {
          console.log(`  ⚠️  Expected ID "${id}" not returned by live API`);
          // Note: This is a warning, not an error, as the API might not return all IDs in every response
        }
      });
    }
    
    console.log('\n📊 Test Results:');
    if (hasErrors) {
      console.log('❌ Assessment ID consistency test FAILED');
      console.log('Please fix the inconsistencies above before committing.');
      process.exit(1);
    } else {
      console.log('✅ All assessment IDs are consistent!');
      console.log(`Total verified IDs: ${Object.keys(actualIds).length}`);
      if (apiReturnedIds.length > 0) {
        console.log(`Live API returned: ${[...new Set(apiReturnedIds)].length} unique IDs`);
      }
      process.exit(0);
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    process.exit(1);
  }
}

// Run the test
testAssessmentIdConsistency();