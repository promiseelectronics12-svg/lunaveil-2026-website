/**
 * LunaVeil ImageKit Upload & Database Seeding Utility
 * 
 * This script automates uploading local product images to ImageKit and updating
 * the product records in both the SQLite and Neon PostgreSQL databases with their CDN URLs.
 * 
 * Usage:
 *   npx tsx upload_and_seed_imagekit.ts [options]
 * 
 * Options:
 *   --src <path>      Path to local images folder (default: d:/lunaveil products or client/public/products)
 *   --db <mode>       Which database to update: 'both', 'sqlite', or 'postgres' (default: both)
 *   --compress        If true, calls a python subprocess to compress large files first (default: true)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurations
const PRIVATE_KEY = 'private_CTizqjO8MohI9p4e2OVzbJWCLH8=';
const PUBLIC_KEY = 'public_EI9H/533tWHb+C4V8tzY63Nk6wA=';
const IMAGEKIT_FOLDER = '/products';

// Product name to filename mappings (supports mapping multiple images per product)
const productToImageMapping: Record<string, string[]> = {
    'Radiant Glow Serum': ['SKIN1004-Centella-Hyalu-Cica-Water-Fit-Sun-Serum2.jpg'],
    'Hydra Moisture Cream': ['gongskin.jpg'],
    'Velvet Matte Lipstick': ['product 2.jpg'],
    'Rose Petal Face Wash': ['The-Face-Shop-Rice-Water-Bright-Facial-Foaming-Cleanser-1.jpg'],
    'Luminous Foundation': ['product 4.jpg'],
    'Velvet Matte Lipstick - Rose': ['product 3.jpg'],
    'Midnight Recovery Oil': ['RICE CERAMIDE.jpg'],
    'Golden Shimmer Highlighter': ['product 5.jpg'],
    'Rose Water Facial Mist': ['SKIN1004-Centella-Hyalu-Cica-Water-Fit-Sun-Serum4.jpg'],
    'Silk Foundation - Medium': ['product 4.jpg'],
    'Charcoal Detox Mask': ['COLLAGEN CICA MASK FRONT SIDE.jpg', 'COLLAGEN CICA MASK BACK SIDE.jpg'],
    'Luxury Eye Palette - Sunset': ['product 5.jpg'],
    'Vitamin E Night Cream': ['eshumi vitamin repair.jpg', 'eshumi vitamin repair backside.jpg'],
    'Brow Sculpt Pencil': ['product 2.jpg'],
    'Coconut Hair Serum': ['lunaveil product.jpg']
};

// Manually parse .env for Neon DB connection
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const rawBuffer = fs.readFileSync(envPath);
        let envContent = '';
        if (rawBuffer[0] === 0xff && rawBuffer[1] === 0xfe) {
            envContent = rawBuffer.toString('utf16le');
        } else if (rawBuffer.toString('utf8').includes('\u0000')) {
            envContent = rawBuffer.toString('utf16le');
        } else {
            envContent = rawBuffer.toString('utf8');
        }
        
        const lines = envContent.split(/\r?\n/);
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const index = trimmed.indexOf('=');
                if (index !== -1) {
                    const key = trimmed.slice(0, index).trim();
                    const value = trimmed.slice(index + 1).trim();
                    process.env[key] = value;
                }
            }
        }
    }
}

// Compress image via Python Pillow if it's too large (> 500KB)
function compressImageIfNeeded(filePath: string, outDir: string): string {
    const filename = path.basename(filePath);
    const stats = fs.statSync(filePath);
    const sizeInMB = stats.size / (1024 * 1024);
    
    // Create temporary build dir for optimized files if not exists
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const outputPath = path.join(outDir, filename);

    if (sizeInMB > 0.5) {
        console.log(`📦 File ${filename} is large (${sizeInMB.toFixed(2)} MB). Compressing...`);
        
        // Execute Python inline script using PIL to resize and compress
        const pyScript = `
import sys, os
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
try:
    img = Image.open(r"${filePath}")
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        img = img.convert('RGB')
    
    # Resize if extremely large
    max_size = 1200
    w, h = img.size
    if w > max_size or h > max_size:
        if w > h:
            img = img.resize((max_size, int(h * max_size / w)), Image.Resampling.LANCZOS)
        else:
            img = img.resize((int(w * max_size / h), max_size), Image.Resampling.LANCZOS)
            
    img.save(r"${outputPath}", "JPEG", quality=82, optimize=True)
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
`;
        try {
            fs.writeFileSync('temp_compress.py', pyScript);
            const output = execSync('python temp_compress.py').toString().trim();
            if (output.includes('SUCCESS')) {
                const newStats = fs.statSync(outputPath);
                console.log(`⚡ Compressed ${filename} from ${sizeInMB.toFixed(2)}MB to ${(newStats.size / 1024).toFixed(1)}KB`);
                return outputPath;
            } else {
                console.error(`❌ Compression script reported error: ${output}`);
            }
        } catch (err: any) {
            console.error(`❌ Compression failed for ${filename}:`, err.message);
        } finally {
            if (fs.existsSync('temp_compress.py')) {
                fs.unlinkSync('temp_compress.py');
            }
        }
    }

    // Fallback/Copy if no compression needed or failed
    if (filePath !== outputPath) {
        fs.copyFileSync(filePath, outputPath);
    }
    return outputPath;
}

// Upload file buffer to ImageKit
async function uploadToImageKit(filePath: string): Promise<string> {
    const filename = path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    
    console.log(`🚀 Uploading ${filename} to ImageKit...`);
    
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer]), filename);
    formData.append('fileName', filename);
    formData.append('folder', IMAGEKIT_FOLDER);
    formData.append('useUniqueFileName', 'false');

    const authHeader = 'Basic ' + Buffer.from(PRIVATE_KEY + ':').toString('base64');

    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        headers: {
            'Authorization': authHeader
        },
        body: formData
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Upload Failed: ${response.statusText} - ${errText}`);
    }

    const data = await response.json() as any;
    console.log(`✅ Uploaded! CDN URL: ${data.url}`);
    return data.url;
}

async function run() {
    loadEnv();
    
    // Parse arguments
    const args = process.argv.slice(2);
    let srcDir = 'd:/lunaveil products';
    if (!fs.existsSync(srcDir)) {
        srcDir = path.join(__dirname, 'client', 'public', 'products');
    }
    
    const srcIndex = args.indexOf('--src');
    if (srcIndex !== -1 && args[srcIndex + 1]) {
        srcDir = args[srcIndex + 1];
    }

    console.log(`📁 Source folder for images: ${srcDir}`);
    if (!fs.existsSync(srcDir)) {
        console.error(`❌ Source folder does not exist: ${srcDir}`);
        process.exit(1);
    }

    const tempOutDir = path.join(__dirname, 'dist', 'temp_optimized_images');
    const uploadedMapping: Record<string, string> = {};

    // 1. Process and upload all unique files
    const uniqueFiles = new Set<string>();
    Object.values(productToImageMapping).forEach(files => files.forEach(f => uniqueFiles.add(f)));

    console.log(`\n🔍 Found ${uniqueFiles.size} unique images to process.`);

    for (const filename of uniqueFiles) {
        const localPath = path.join(srcDir, filename);
        if (!fs.existsSync(localPath)) {
            console.warn(`⚠️ Warning: Image file not found: ${localPath}`);
            continue;
        }

        try {
            // Compress image if needed
            const optimizedPath = compressImageIfNeeded(localPath, tempOutDir);
            
            // Upload to ImageKit
            const cdnUrl = await uploadToImageKit(optimizedPath);
            uploadedMapping[filename] = cdnUrl;
        } catch (e: any) {
            console.error(`❌ Failed to upload ${filename}:`, e.message);
        }
    }

    // Clean up temporary optimized folder
    if (fs.existsSync(tempOutDir)) {
        fs.rmSync(tempOutDir, { recursive: true, force: true });
    }

    // 2. Database Update
    console.log('\n💾 Updating Databases...');

    // A. SQLite Update
    try {
        console.log('[SQLite] Connecting...');
        const { db: sqliteDb } = await import('./server/db.sqlite.js');
        const { products: sqliteProducts } = await import('./shared/schema.sqlite.js');
        const { eq } = await import('drizzle-orm');

        const allSqliteProducts = await sqliteDb.select().from(sqliteProducts);
        
        let updateCount = 0;
        for (const prod of allSqliteProducts) {
            const mappedImages = productToImageMapping[prod.nameEn] || productToImageMapping[prod.nameEn.split(' - ')[0]];
            if (mappedImages) {
                const urls = mappedImages.map(img => uploadedMapping[img]).filter(Boolean);
                if (urls.length > 0) {
                    await sqliteDb.update(sqliteProducts)
                        .set({ images: urls })
                        .where(eq(sqliteProducts.id, prod.id));
                    console.log(`   [SQLite] Updated ${prod.nameEn} with ${urls.length} images`);
                    updateCount++;
                }
            }
        }
        console.log(`✅ [SQLite] Updated ${updateCount} products.`);
    } catch (e: any) {
        console.error('❌ [SQLite] Update failed:', e.message);
    }

    // B. Neon PostgreSQL Update
    if (process.env.DATABASE_URL) {
        try {
            console.log('[PostgreSQL] Connecting to Neon...');
            const { Pool, neonConfig } = await import('@neondatabase/serverless');
            const { drizzle } = await import('drizzle-orm/neon-serverless');
            const ws = (await import('ws')).default;
            const pgSchema = await import('./shared/schema.js');
            const { eq } = await import('drizzle-orm');

            neonConfig.webSocketConstructor = ws;
            const pool = new Pool({ connectionString: process.env.DATABASE_URL });
            const pgDb = drizzle(pool, { schema: pgSchema });

            const allPgProducts = await pgDb.select().from(pgSchema.products);
            
            let updateCount = 0;
            for (const prod of allPgProducts) {
                const mappedImages = productToImageMapping[prod.nameEn] || productToImageMapping[prod.nameEn.split(' - ')[0]];
                if (mappedImages) {
                    const urls = mappedImages.map(img => uploadedMapping[img]).filter(Boolean);
                    if (urls.length > 0) {
                        await pgDb.update(pgSchema.products)
                            .set({ images: urls })
                            .where(eq(pgSchema.products.id, prod.id));
                        console.log(`   [PostgreSQL] Updated ${prod.nameEn} with ${urls.length} images`);
                        updateCount++;
                    }
                }
            }
            await pool.end();
            console.log(`✅ [PostgreSQL] Updated ${updateCount} products.`);
        } catch (e: any) {
            console.error('❌ [PostgreSQL] Update failed:', e.message);
        }
    } else {
        console.log('ℹ️  Skipped PostgreSQL update (DATABASE_URL not set in .env)');
    }

    console.log('\n🎉 Finished ImageKit Upload and Database Seeding!');
    process.exit(0);
}

run().catch(err => {
    console.error('❌ Unexpected script error:', err);
    process.exit(1);
});
