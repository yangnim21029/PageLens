const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_URL = 'https://girlstyle.com/tw/article/513255';
const FOCUS_KEYWORD = 'Disney Zootopia';
const SYNONYMS = ['動物方城市', 'Disney', 'animation'];

console.log('🧪 Starting Manual SEO Analysis Test');
console.log(`📡 Base URL: ${BASE_URL}`);
console.log(`🔍 Test URL: ${TEST_URL}`);
console.log(`🎯 Focus Keyword: ${FOCUS_KEYWORD}`);
console.log(`📝 Synonyms: ${SYNONYMS.join(', ')}`);
console.log('=' .repeat(60));

// Helper function to make API calls
async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  
  const result = await makeRequest('GET', '/health');
  
  if (result.success) {
    console.log('✅ Health check passed');
    console.log(`   Status: ${result.data.status}`);
    console.log(`   Uptime: ${result.data.uptime}s`);
  } else {
    console.log('❌ Health check failed');
    console.log(`   Error: ${result.error}`);
  }
  
  return result.success;
}

async function testSEOAnalysisHealth() {
  console.log('\n🔍 Testing SEO Analysis Health...');
  
  const result = await makeRequest('GET', '/api/seo-analysis/health');
  
  if (result.success) {
    console.log('✅ SEO Analysis health check passed');
    console.log(`   Status: ${result.data.status}`);
    console.log(`   Service: ${result.data.service}`);
  } else {
    console.log('❌ SEO Analysis health check failed');
    console.log(`   Error: ${result.error}`);
  }
  
  return result.success;
}

async function testGetStats() {
  console.log('\n📊 Testing Stats Endpoint...');
  
  const result = await makeRequest('GET', '/api/seo-analysis/stats');
  
  if (result.success) {
    console.log('✅ Stats retrieved successfully');
    console.log(`   Pipeline Steps: ${result.data.data.pipelineSteps.join(', ')}`);
    console.log(`   SEO Checks: ${result.data.data.supportedChecks.seo.length}`);
    console.log(`   Readability Checks: ${result.data.data.supportedChecks.readability.length}`);
  } else {
    console.log('❌ Failed to get stats');
    console.log(`   Error: ${result.error}`);
  }
  
  return result.success;
}

async function testValidateUrl() {
  console.log('\n🔗 Testing URL Validation...');
  
  const result = await makeRequest('POST', '/api/seo-analysis/validate-url', {
    url: TEST_URL
  });
  
  if (result.success) {
    console.log('✅ URL validation completed');
    console.log(`   Valid: ${result.data.data.valid}`);
    console.log(`   Accessible: ${result.data.data.accessible}`);
    console.log(`   Is HTML: ${result.data.data.isHTML}`);
    console.log(`   Status Code: ${result.data.data.statusCode}`);
  } else {
    console.log('❌ URL validation failed');
    console.log(`   Error: ${result.error}`);
  }
  
  return result.success;
}

async function testSEOAnalysis() {
  console.log('\n🎯 Testing SEO Analysis...');
  console.log('⏳ This may take a moment...');
  
  const startTime = Date.now();
  
  const result = await makeRequest('POST', '/api/seo-analysis/analyze', {
    url: TEST_URL,
    focusKeyword: FOCUS_KEYWORD,
    synonyms: SYNONYMS
  });
  
  const endTime = Date.now();
  const requestTime = endTime - startTime;
  
  if (result.success) {
    console.log('✅ SEO Analysis completed successfully');
    console.log(`   Request Time: ${requestTime}ms`);
    console.log(`   Processing Time: ${result.data.processingTime}ms`);
    console.log(`   SEO Score: ${result.data.report.overallScores.seoScore}`);
    console.log(`   Readability Score: ${result.data.report.overallScores.readabilityScore}`);
    console.log(`   Overall Score: ${result.data.report.overallScores.overallScore}`);
    console.log(`   Total Issues: ${result.data.report.summary.totalIssues}`);
    console.log(`   Critical Issues: ${result.data.report.summary.criticalIssues}`);
    console.log(`   Passed Checks: ${result.data.report.summary.passedChecks}/${result.data.report.summary.totalChecks}`);
    
    if (result.data.report.issues.length > 0) {
      console.log('\n📋 Issues Found:');
      result.data.report.issues.slice(0, 3).forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.title} (${issue.rating})`);
      });
      
      if (result.data.report.issues.length > 3) {
        console.log(`   ... and ${result.data.report.issues.length - 3} more issues`);
      }
    }
  } else {
    console.log('❌ SEO Analysis failed');
    console.log(`   Request Time: ${requestTime}ms`);
    console.log(`   Error: ${result.error}`);
    console.log(`   Status: ${result.status}`);
  }
  
  return result.success;
}

async function testInvalidRequests() {
  console.log('\n🚫 Testing Invalid Requests...');
  
  // Test invalid URL
  const invalidUrlResult = await makeRequest('POST', '/api/seo-analysis/analyze', {
    url: 'invalid-url',
    focusKeyword: FOCUS_KEYWORD
  });
  
  if (!invalidUrlResult.success && invalidUrlResult.status === 400) {
    console.log('✅ Invalid URL properly rejected');
  } else {
    console.log('❌ Invalid URL should have been rejected');
  }
  
  // Test missing focus keyword
  const missingKeywordResult = await makeRequest('POST', '/api/seo-analysis/analyze', {
    url: TEST_URL
  });
  
  if (!missingKeywordResult.success && missingKeywordResult.status === 400) {
    console.log('✅ Missing focus keyword properly rejected');
  } else {
    console.log('❌ Missing focus keyword should have been rejected');
  }
  
  return true;
}

// Main test runner
async function runTests() {
  console.log('\n🚀 Running comprehensive SEO Analysis API tests...\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'SEO Analysis Health', fn: testSEOAnalysisHealth },
    { name: 'Get Stats', fn: testGetStats },
    { name: 'Validate URL', fn: testValidateUrl },
    { name: 'SEO Analysis', fn: testSEOAnalysis },
    { name: 'Invalid Requests', fn: testInvalidRequests }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.log(`❌ ${test.name} threw an error: ${error.message}`);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
  });
  
  console.log(`\n🎯 ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! The SEO Analysis API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the server logs and configuration.');
  }
}

// Check if server is running
async function checkServer() {
  console.log(`🔍 Checking if server is running at ${BASE_URL}...`);
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('💡 Please start the server with: npm run dev');
    return false;
  }
}

// Run the tests
async function main() {
  if (await checkServer()) {
    await runTests();
  }
}

main().catch(console.error);