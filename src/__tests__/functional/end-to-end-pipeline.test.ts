/**
 * Functional Tests for End-to-End Pipeline Functionality
 */

import { AuditPipelineOrchestrator } from '@/app';
import { AuditPipelineInput } from '@/app';

describe('End-to-End Pipeline Functionality', () => {
  let orchestrator: AuditPipelineOrchestrator;

  beforeEach(() => {
    orchestrator = new AuditPipelineOrchestrator();
  });

  describe('Real-world SEO scenarios', () => {
    it('should handle well-optimized page correctly', async () => {
      const wellOptimizedInput: AuditPipelineInput = {
        htmlContent: `
          <html>
            <head>
              <title>Best Coffee Beans - Premium Coffee Guide 2024</title>
              <meta name="description" content="Discover the best coffee beans from around the world. Our comprehensive guide covers premium coffee varieties, brewing methods, and expert recommendations for coffee enthusiasts.">
            </head>
            <body>
              <h1>Best Coffee Beans for Premium Coffee Experience</h1>
              <p>Finding the best coffee beans can transform your daily coffee routine. This comprehensive guide explores premium coffee varieties and helps you discover the perfect beans for your taste preferences.</p>
              <h2>Top Coffee Bean Varieties</h2>
              <p>When searching for the best coffee beans, consider these premium varieties that offer exceptional flavor profiles and quality.</p>
              <img src="arabica-beans.jpg" alt="Best coffee beans - Arabica variety">
              <h3>Arabica Coffee Beans</h3>
              <p>Arabica beans represent some of the best coffee beans available, offering smooth flavors and less bitterness than other varieties.</p>
              <img src="roasting-process.jpg" alt="Coffee roasting process for best coffee beans">
              <h3>Roasting Methods</h3>
              <p>The roasting process significantly impacts the flavor of the best coffee beans. Light roasts preserve origin flavors, while dark roasts create bold, intense profiles.</p>
              <h2>Choosing Your Perfect Coffee</h2>
              <p>Selecting the best coffee beans depends on your brewing method, taste preferences, and quality expectations. Consider these factors when making your choice.</p>
              <a href="https://coffeereview.com">Coffee Review</a>
              <a href="/brewing-guide">Brewing Guide</a>
            </body>
          </html>
        `,
        pageDetails: {
          url: 'https://example.com/best-coffee-beans',
          title: 'Best Coffee Beans - Premium Coffee Guide 2024'
        },
        focusKeyword: 'best coffee beans',
        synonyms: ['premium coffee', 'quality coffee', 'coffee varieties']
      };

      const result = await orchestrator.executeAuditPipeline(wellOptimizedInput);

      expect(result.success).toBe(true);
      expect(result.report?.overallScores.seoScore).toBeGreaterThan(70);
      expect(result.report?.overallScores.readabilityScore).toBeGreaterThan(70);

      // Check specific optimizations
      const h1Assessment = result.report?.detailedIssues.find(i => i.id.includes('h1'));
      expect(h1Assessment?.rating).toBe('good');

      const titleAssessment = result.report?.detailedIssues.find(i => i.id.includes('title'));
      expect(titleAssessment?.rating).toBe('good');

      const metaAssessment = result.report?.detailedIssues.find(i => i.id.includes('meta'));
      expect(metaAssessment?.rating).toBe('ok');
    });

    it('should identify poorly optimized page issues', async () => {
      const poorlyOptimizedInput: AuditPipelineInput = {
        htmlContent: `
          <html>
            <head>
              <title>Page</title>
              <meta name="description" content="Short desc">
            </head>
            <body>
              <h1>Title</h1>
              <p>Short content without keyword keyword keyword keyword keyword keyword keyword keyword.</p>
              <img src="image.jpg">
              <img src="image2.jpg">
            </body>
          </html>
        `,
        pageDetails: {
          url: 'https://example.com/poor-page',
          title: 'Page'
        },
        focusKeyword: 'keyword',
        synonyms: []
      };

      const result = await orchestrator.executeAuditPipeline(poorlyOptimizedInput);

      expect(result.success).toBe(true);
      expect(result.report?.overallScores.seoScore).toBeLessThan(50);

      // Should identify multiple issues
      const issues = result.report!.detailedIssues;
      const badIssues = issues.filter(i => i.rating === 'bad');
      expect(badIssues.length).toBeGreaterThan(0);

      // Check specific issues
      const titleIssue = issues?.find(i => i.id.includes('title') && i.rating === 'bad');
      expect(titleIssue).toBeDefined();

      const keywordDensityIssue = issues?.find(i => i.id.includes('keyword-density'));
      expect(keywordDensityIssue?.rating).toBe('bad');

      const contentLengthIssue = issues?.find(i => i.id.includes('content-length'));
      expect(contentLengthIssue?.rating).toBe('bad');
    });

    it('should handle Chinese e-commerce product page', async () => {
      const chineseEcommerceInput: AuditPipelineInput = {
        htmlContent: `
          <html>
            <head>
              <title>iPhone 15 Pro 手機殼推薦 - 最新款保護殼</title>
              <meta name="description" content="iPhone 15 Pro 手機殼推薦，提供最佳保護和時尚設計。選擇適合您 iPhone 15 Pro 的優質手機殼，確保手機安全並展現個人風格。">
            </head>
            <body>
              <h1>iPhone 15 Pro 手機殼推薦指南</h1>
              <p>尋找完美的 iPhone 15 Pro 手機殼推薦嗎？我們為您整理了最新的 iPhone 15 Pro 保護殼選擇，讓您的手機獲得最佳保護。</p>
              <h2>熱門 iPhone 15 Pro 手機殼款式</h2>
              <p>以下是我們推薦的 iPhone 15 Pro 手機殼，每款都具有獨特的保護功能和設計特色。</p>
              <img src="clear-case.jpg" alt="iPhone 15 Pro 手機殼推薦 - 透明保護殼">
              <h3>透明保護殼</h3>
              <p>透明 iPhone 15 Pro 手機殼是最受歡迎的選擇之一，既能保護手機又能展現原始設計。</p>
              <img src="leather-case.jpg" alt="iPhone 15 Pro 皮革手機殼">
              <h3>皮革保護殼</h3>
              <p>皮革材質的 iPhone 15 Pro 手機殼提供premium手感和優雅外觀，適合商務使用。</p>
              <h2>選擇手機殼的重要考量</h2>
              <p>選購 iPhone 15 Pro 手機殼時，需要考慮保護性能、材質質量和設計風格等因素。</p>
              <h3>保護性能</h3>
              <p>優質的 iPhone 15 Pro 手機殼應該提供全面的保護，包括防摔、防刮和防塵功能。</p>
              <h3>材質選擇</h3>
              <p>不同材質的手機殼有不同的特點，包括TPU、PC、皮革和矽膠等選擇。</p>
            </body>
          </html>
        `,
        pageDetails: {
          url: 'https://example.com/iphone-15-pro-case',
          title: 'iPhone 15 Pro 手機殼推薦 - 最新款保護殼'
        },
        focusKeyword: 'iPhone 15 Pro 手機殼推薦',
        synonyms: ['iPhone 15 Pro 保護殼', 'iPhone 15 Pro 手機套', 'iPhone 15 Pro 殼']
      };

      const result = await orchestrator.executeAuditPipeline(chineseEcommerceInput);

      expect(result.success).toBe(true);
      expect(result.report?.overallScores.seoScore).toBeGreaterThan(60);

      // Check Chinese keyword handling
      const h1Assessment = result.report?.detailedIssues.find(i => i.id.includes('h1'));
      expect(h1Assessment?.rating).toBe('good');

      const titleAssessment = result.report?.detailedIssues.find(i => i.id.includes('title'));
      expect(titleAssessment?.rating).toBe('good');
    });

    it('should handle blog post with good readability', async () => {
      const blogPostInput: AuditPipelineInput = {
        htmlContent: `
          <html>
            <head>
              <title>How to Start a Blog in 2024: Complete Beginner's Guide</title>
              <meta name="description" content="Learn how to start a blog in 2024 with our step-by-step guide. From choosing a platform to writing your first post, we cover everything you need to start a successful blog.">
            </head>
            <body>
              <h1>How to Start a Blog: Your Complete Guide</h1>
              <p>Starting a blog can be an exciting journey. Whether you want to share your thoughts, build a business, or connect with others, this guide will help you start a blog successfully.</p>
              <h2>Step 1: Choose Your Blog Topic</h2>
              <p>First, decide what your blog will be about. Pick a topic you're passionate about. This makes it easier to write consistently.</p>
              <p>Consider your interests and expertise. What do you know well? What do you enjoy discussing?</p>
              <h2>Step 2: Select a Blogging Platform</h2>
              <p>Next, choose where to start a blog. Popular platforms include WordPress, Blogger, and Medium.</p>
              <p>WordPress is the most popular choice. It offers flexibility and customization options.</p>
              <h2>Step 3: Pick a Domain Name</h2>
              <p>Your domain name is your blog's address online. Choose something memorable and relevant to your topic.</p>
              <p>Keep it short and easy to spell. Avoid hyphens and numbers if possible.</p>
              <h2>Step 4: Set Up Web Hosting</h2>
              <p>You'll need web hosting to make your blog accessible online. Many companies offer reliable hosting services.</p>
              <h2>Step 5: Design Your Blog</h2>
              <p>Make your blog visually appealing. Choose a clean, professional theme that matches your content.</p>
              <h2>Step 6: Create Your First Post</h2>
              <p>Now comes the fun part - writing your first blog post! Start with an introduction about yourself and your blog's purpose.</p>
              <p>Remember to write in a conversational tone. Use short paragraphs and bullet points for easy reading.</p>
              <h2>Step 7: Promote Your Blog</h2>
              <p>Share your blog on social media. Connect with other bloggers in your niche.</p>
              <p>Consistency is key. Regular posting helps build an audience.</p>
              <img src="blog-setup.jpg" alt="How to start a blog - setup process">
            </body>
          </html>
        `,
        pageDetails: {
          url: 'https://example.com/how-to-start-a-blog',
          title: 'How to Start a Blog in 2024: Complete Beginner\'s Guide'
        },
        focusKeyword: 'start a blog',
        synonyms: ['create a blog', 'begin blogging', 'blog creation']
      };

      const result = await orchestrator.executeAuditPipeline(blogPostInput);

      expect(result.success).toBe(true);
      expect(result.report?.overallScores.readabilityScore).toBeGreaterThan(75);

      // Check readability factors
      const sentenceAssessment = result.report?.detailedIssues.find(i => i.id.includes('sentence'));
      expect(sentenceAssessment?.rating).toBe('good');

      const subheadingAssessment = result.report?.detailedIssues.find(i => i.id.includes('subheading'));
      expect(subheadingAssessment?.rating).toBe('good');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle very long content', async () => {
      const longContentInput: AuditPipelineInput = {
        htmlContent: `
          <html>
            <head>
              <title>Very Long Article About Technology</title>
              <meta name="description" content="This is a very long article about technology trends and developments.">
            </head>
            <body>
              <h1>Technology Trends</h1>
              ${Array.from({ length: 200 }, (_, i) => `
                <p>This is paragraph ${i + 1} about technology. ${'Technology is important. '.repeat(20)}</p>
              `).join('')}
            </body>
          </html>
        `,
        pageDetails: {
          url: 'https://example.com/long-article',
          title: 'Very Long Article About Technology'
        },
        focusKeyword: 'technology',
        synonyms: ['tech', 'innovation']
      };

      const result = await orchestrator.executeAuditPipeline(longContentInput);

      expect(result.success).toBe(true);
      expect(result.processingTime).toBeLessThan(3000); // Should complete within 3 seconds

      // Content length should be good
      const contentLengthAssessment = result.report?.detailedIssues.find(i => i.id.includes('content-length'));
      expect(contentLengthAssessment?.rating).toBe('good');
    });

    it('should handle content with special characters', async () => {
      const specialCharsInput: AuditPipelineInput = {
        htmlContent: `
          <html>
            <head>
              <title>Special Characters & Symbols: Complete Guide</title>
              <meta name="description" content="Learn about special characters & symbols used in programming, writing, and design.">
            </head>
            <body>
              <h1>Special Characters & Symbols Guide</h1>
              <p>Special characters like &, %, #, @, and $ are common in programming and writing. Understanding these symbols is important.</p>
              <h2>Common Special Characters</h2>
              <p>Here are some frequently used special characters: ! @ # $ % ^ & * ( ) - _ + = { } [ ] | \\ : ; " ' < > , . ? /</p>
              <p>These symbols have different meanings in various contexts. For example, & is used for "and" in HTML.</p>
            </body>
          </html>
        `,
        pageDetails: {
          url: 'https://example.com/special-characters',
          title: 'Special Characters & Symbols: Complete Guide'
        },
        focusKeyword: 'special characters',
        synonyms: ['symbols', 'characters']
      };

      const result = await orchestrator.executeAuditPipeline(specialCharsInput);

      expect(result.success).toBe(true);
      expect(result.report?.detailedIssues.length).toBeGreaterThan(0);
    });

    it('should handle mixed language content', async () => {
      const mixedLanguageInput: AuditPipelineInput = {
        htmlContent: `
          <html>
            <head>
              <title>Machine Learning 機器學習 - Complete Guide</title>
              <meta name="description" content="Learn about machine learning (機器學習) with this comprehensive guide covering AI and ML concepts.">
            </head>
            <body>
              <h1>Machine Learning 機器學習指南</h1>
              <p>Machine learning (機器學習) is a subset of artificial intelligence. It enables computers to learn without being explicitly programmed.</p>
              <h2>Types of Machine Learning</h2>
              <p>There are three main types of machine learning: supervised learning (監督學習), unsupervised learning (無監督學習), and reinforcement learning (強化學習).</p>
              <h3>Supervised Learning 監督學習</h3>
              <p>In supervised learning, the algorithm learns from labeled training data. Common examples include classification and regression tasks.</p>
              <h3>Unsupervised Learning 無監督學習</h3>
              <p>Unsupervised learning finds patterns in data without labels. Clustering and dimensionality reduction are common applications.</p>
            </body>
          </html>
        `,
        pageDetails: {
          url: 'https://example.com/machine-learning-guide',
          title: 'Machine Learning 機器學習 - Complete Guide'
        },
        focusKeyword: 'machine learning',
        synonyms: ['機器學習', 'ML', 'artificial intelligence']
      };

      const result = await orchestrator.executeAuditPipeline(mixedLanguageInput);

      expect(result.success).toBe(true);
      expect(result.report?.detailedIssues.length).toBeGreaterThan(0);

      // Should handle mixed language keywords
      const h1Assessment = result.report?.detailedIssues.find(i => i.id.includes('h1'));
      expect(h1Assessment?.rating).toBe('good');
    });
  });

  describe('Performance and reliability', () => {
    it('should maintain consistent performance across multiple runs', async () => {
      const testInput: AuditPipelineInput = {
        htmlContent: `
          <html>
            <head>
              <title>Performance Test Page</title>
              <meta name="description" content="This is a test page for performance testing.">
            </head>
            <body>
              <h1>Performance Test</h1>
              <p>This page is used for performance testing of the audit pipeline.</p>
            </body>
          </html>
        `,
        pageDetails: {
          url: 'https://example.com/performance-test',
          title: 'Performance Test Page'
        },
        focusKeyword: 'performance',
        synonyms: ['speed', 'efficiency']
      };

      const results = [];
      for (let i = 0; i < 5; i++) {
        const result = await orchestrator.executeAuditPipeline(testInput);
        results.push(result);
      }

      // All runs should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.processingTime).toBeLessThan(1000);
      });

      // Results should be consistent
      const firstResult = results[0];
      results.slice(1).forEach(result => {
        expect(result.report?.overallScores.seoScore).toBe(firstResult.report?.overallScores.seoScore);
        expect(result.report?.overallScores.readabilityScore).toBe(firstResult.report?.overallScores.readabilityScore);
      });
    });
  });
});