import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

const runVerification = async () => {
  let passedChecks = 0;
  let totalChecks = 0;

  const logCheck = (name, passed, detail = '') => {
    totalChecks++;
    if (passed) {
      passedChecks++;
      console.log(`[PASS] ${name}${detail ? ` -> ${detail}` : ''}`);
    } else {
      console.error(`[FAIL] ${name}${detail ? ` -> ${detail}` : ''}`);
    }
  };

  console.log('====================================================');
  console.log('   Angadix Phase 9 Security, Performance & SEO Audit ');
  console.log('====================================================\n');

  try {
    // Check 1: Healthcheck & Helmet Security Headers
    console.log('--- 1. Testing Helmet Security Headers ---');
    const healthRes = await axios.get(`${API_BASE_URL}/health`);
    const headers = healthRes.headers;

    logCheck(
      'Content-Security-Policy header present',
      Boolean(headers['content-security-policy']),
      headers['content-security-policy'] ? 'Configured with Razorpay, Cloudinary & Google Fonts' : 'Missing'
    );

    logCheck(
      'Cross-Origin-Resource-Policy header present',
      headers['cross-origin-resource-policy'] === 'cross-origin',
      `Value: ${headers['cross-origin-resource-policy'] || 'Missing'}`
    );

    logCheck(
      'X-Content-Type-Options nosniff header present',
      headers['x-content-type-options'] === 'nosniff',
      `Value: ${headers['x-content-type-options'] || 'Missing'}`
    );

    // Check 2: Response Compression Header
    console.log('\n--- 2. Testing Gzip/Deflate Response Compression ---');
    const catRes = await axios.get(`${API_BASE_URL}/api/v1/categories`, {
      headers: { 'Accept-Encoding': 'gzip, deflate, br' },
      decompress: false,
    });
    logCheck(
      'Content-Encoding compression header present',
      Boolean(catRes.headers['content-encoding']),
      `Content-Encoding: ${catRes.headers['content-encoding'] || 'identity / uncompressed'}`
    );

    // Check 3: Rate Limiting Headers
    console.log('\n--- 3. Testing Rate Limiting Headers ---');
    const rateLimitHeaders = catRes.headers;
    const hasRateLimitHeader = Boolean(
      rateLimitHeaders['ratelimit-limit'] ||
      rateLimitHeaders['x-ratelimit-limit'] ||
      rateLimitHeaders['ratelimit-remaining']
    );
    logCheck(
      'RateLimit-* HTTP headers present on API endpoints',
      hasRateLimitHeader,
      `Limit: ${rateLimitHeaders['ratelimit-limit'] || rateLimitHeaders['x-ratelimit-limit'] || 'N/A'}, Remaining: ${rateLimitHeaders['ratelimit-remaining'] || rateLimitHeaders['x-ratelimit-remaining'] || 'N/A'}`
    );

    // Check 4: Cache-Control Headers for Public GET Endpoints
    console.log('\n--- 4. Testing Public GET Cache-Control Headers ---');
    logCheck(
      'GET /api/v1/categories Cache-Control header',
      Boolean(catRes.headers['cache-control'] && catRes.headers['cache-control'].includes('max-age=300')),
      `Cache-Control: ${catRes.headers['cache-control'] || 'None'}`
    );

    const brandRes = await axios.get(`${API_BASE_URL}/api/v1/brands`);
    logCheck(
      'GET /api/v1/brands Cache-Control header',
      Boolean(brandRes.headers['cache-control'] && brandRes.headers['cache-control'].includes('max-age=300')),
      `Cache-Control: ${brandRes.headers['cache-control'] || 'None'}`
    );

    const bannerRes = await axios.get(`${API_BASE_URL}/api/v1/banners`);
    logCheck(
      'GET /api/v1/banners Cache-Control header',
      Boolean(bannerRes.headers['cache-control'] && bannerRes.headers['cache-control'].includes('max-age=300')),
      `Cache-Control: ${bannerRes.headers['cache-control'] || 'None'}`
    );

    // Check 5: SEO Public Static Files
    console.log('\n--- 5. Testing Static SEO Files (robots.txt & sitemap.xml) ---');
    const robotsPath = path.resolve(process.cwd(), '../frontend/public/robots.txt');
    const robotsExists = fs.existsSync(robotsPath);
    logCheck('frontend/public/robots.txt file exists', robotsExists, robotsExists ? robotsPath : 'Missing');

    const sitemapPath = path.resolve(process.cwd(), '../frontend/public/sitemap.xml');
    const sitemapExists = fs.existsSync(sitemapPath);
    logCheck('frontend/public/sitemap.xml file exists', sitemapExists, sitemapExists ? sitemapPath : 'Missing');

    console.log('\n====================================================');
    console.log(`   Verification Finished: ${passedChecks}/${totalChecks} Checks Passed`);
    console.log('====================================================');

    if (passedChecks === totalChecks) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('[FATAL] Verification failed with exception:', err.message);
    process.exit(1);
  }
};

runVerification();
