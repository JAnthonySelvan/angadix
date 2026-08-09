import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';

const generateSitemap = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.mongoUri);

    const baseUrl = env.clientUrl || 'https://angadix.com';

    const staticRoutes = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/shop', priority: '0.9', changefreq: 'daily' },
      { url: '/login', priority: '0.5', changefreq: 'monthly' },
      { url: '/register', priority: '0.5', changefreq: 'monthly' },
    ];

    const [products, categories] = await Promise.all([
      Product.find({ isActive: true }).select('slug updatedAt').lean(),
      Category.find({ isActive: true }).select('slug updatedAt').lean(),
    ]);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    staticRoutes.forEach((route) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${route.url}</loc>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    categories.forEach((cat) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/shop?category=${cat.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(cat.updatedAt || Date.now()).toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    products.forEach((prod) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/products/${prod.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(prod.updatedAt || Date.now()).toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += '</urlset>\n';

    const targetPath = path.resolve(process.cwd(), '../frontend/public/sitemap.xml');
    fs.writeFileSync(targetPath, xml, 'utf8');

    console.log(`Successfully generated sitemap with ${staticRoutes.length + categories.length + products.length} URLs at ${targetPath}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    process.exit(1);
  }
};

generateSitemap();
