const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client with region
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY, {
  region: 'europe-west1' // Try a different region
});

// Function to extract text content from HTML
function extractTextFromHtml(html) {
  const $ = cheerio.load(html);
  // Remove script and style elements
  $('script, style').remove();
  // Get text content
  return $('body').text().trim();
}

// Function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Function to create embeddings for text with retry logic
async function createEmbedding(text, retries = 3, delayMs = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: "embedding-001" });
      const result = await model.embedContent(text);
      // Add a much longer delay after successful request
    //  await delay(10000); // 10 second delay between requests
      return result.embedding.values;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt === retries) {
        console.error('Max retries reached. Skipping this chunk.');
        return null;
      }
      // Wait before retrying with exponential backoff
      const waitTime = delayMs * Math.pow(2, attempt - 1);
      console.log(`Waiting ${waitTime/1000} seconds before retry...`);
      await delay(waitTime);
    }
  }
  return null;
}

// Main function to process files
async function processFiles() {
  const downloadsDir = path.join(__dirname, 'downloads');
  const files = fs.readdirSync(downloadsDir).filter(file => file.endsWith('.html'));
  
  // Load existing embeddings if any
  let embeddings = [];
  try {
    if (fs.existsSync('embeddings.json')) {
      embeddings = JSON.parse(fs.readFileSync('embeddings.json', 'utf-8'));
      console.log(`Loaded ${embeddings.length} existing embeddings`);
    }
  } catch (error) {
    console.error('Error loading existing embeddings:', error.message);
  }

  // Get list of already processed files
  const processedFiles = new Set(embeddings.map(e => e.file));
  
  // Filter out already processed files
  const remainingFiles = files.filter(file => !processedFiles.has(file));
  console.log(`Found ${remainingFiles.length} files to process`);
  
  let processedCount = 0;

  // Process files in smaller batches
  const BATCH_SIZE = 1; // Process one file at a time
  for (let i = 0; i < remainingFiles.length; i += BATCH_SIZE) {
    const batch = remainingFiles.slice(i, i + BATCH_SIZE);
    console.log(`\nProcessing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(remainingFiles.length/BATCH_SIZE)}`);
    
    for (const file of batch) {
      try {
        console.log(`\nProcessing ${file}... (${processedCount + 1}/${remainingFiles.length})`);
        const filePath = path.join(downloadsDir, file);
        const html = fs.readFileSync(filePath, 'utf-8');
        const $ = cheerio.load(html);
        
        // Remove script and style elements
        $('script, style').remove();
        
        // Process each section (h1, h2, h3) and its content
        const sections = $('h1, h2, h3');
        console.log(`Found ${sections.length} sections in ${file}`);
        
        for (let j = 0; j < sections.length; j++) {
          const $element = $(sections[j]);
          const title = $element.text().trim();
          
          // Get the content until the next heading
          let content = '';
          let nextElement = $element.next();
          while (nextElement.length && !nextElement.is('h1, h2, h3')) {
            content += nextElement.text().trim() + ' ';
            nextElement = nextElement.next();
          }
          
          // Only process if we have content
          if (content.trim()) {
            const chunk = `${title}\n${content.trim()}`;
            console.log(`Processing section ${j + 1}/${sections.length}: ${title.substring(0, 50)}...`);
            
            const embedding = await createEmbedding(chunk);
            
            if (embedding) {
              embeddings.push({
                file,
                sectionIndex: j,
                title,
                text: chunk,
                embedding
              });
              // Save progress after each successful embedding
              fs.writeFileSync('embeddings.json', JSON.stringify(embeddings, null, 2));
            }
          }
        }
        
        processedCount++;
        console.log(`Progress saved: ${processedCount}/${remainingFiles.length} files processed`);
        
      } catch (error) {
        console.error(`Error processing file ${file}:`, error.message);
        // Continue with next file
        continue;
      }
    }
    
    // Add a much longer delay between batches
    if (i + BATCH_SIZE < remainingFiles.length) {
      console.log('\nWaiting 120 seconds before processing next batch...');
     // await delay(120000); // 2 minute delay between batches
    }
  }

  console.log('\nEmbeddings created and saved to embeddings.json');
}

// Run the script
processFiles().catch(console.error); 