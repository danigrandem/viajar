const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs-extra');
const path = require('path');
const sanitize = require('sanitize-filename');

const parser = new xml2js.Parser();
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

// List of sitemaps to process
const SITEMAPS = [
    'https://www.viajarporfilipinas.com/sitemap_index.xml',
    'https://www.viajarporfilipinas.com/post-sitemap.xml',
    'https://www.viajarporfilipinas.com/page-sitemap.xml',
    'https://www.viajarporfilipinas.com/category-sitemap.xml'
];

// Create downloads directory if it doesn't exist
fs.ensureDirSync(DOWNLOAD_DIR);

async function downloadAndSaveContent(url) {
    try {
        const filename = sanitize(url.replace(/https?:\/\//, '').replace(/\//g, '_')) + '.html';
        const filepath = path.join(DOWNLOAD_DIR, filename);

        // Skip if file already exists
        if (await fs.pathExists(filepath)) {
            console.log(`Skipping ${url} - already downloaded`);
            return;
        }

        console.log(`Downloading ${url}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        await fs.writeFile(filepath, response.data);
        console.log(`Saved ${url} to ${filename}`);

        // Add delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
        console.error(`Error downloading ${url}:`, error.message);
    }
}

async function processSitemap(sitemapUrl) {
    try {
        console.log(`Processing sitemap: ${sitemapUrl}`);
        const response = await axios.get(sitemapUrl);
        const result = await parser.parseStringPromise(response.data);

        // Handle both sitemap index and regular sitemaps
        const urls = [];
        
        if (result.sitemapindex) {
            // This is a sitemap index
            const sitemaps = result.sitemapindex.sitemap || [];
            for (const sitemap of sitemaps) {
                const loc = sitemap.loc?.[0];
                if (loc) urls.push(loc);
            }
        } else if (result.urlset) {
            // This is a regular sitemap
            const urlElements = result.urlset.url || [];
            for (const urlElement of urlElements) {
                const loc = urlElement.loc?.[0];
                if (loc) urls.push(loc);
            }
        }

        // Process all URLs
        for (const url of urls) {
            await downloadAndSaveContent(url);
        }

    } catch (error) {
        console.error(`Error processing sitemap ${sitemapUrl}:`, error.message);
    }
}

async function main() {
    try {
        for (const sitemap of SITEMAPS) {
            await processSitemap(sitemap);
        }
        console.log('All sitemaps processed successfully!');
    } catch (error) {
        console.error('Main process error:', error.message);
    }
}

main(); 