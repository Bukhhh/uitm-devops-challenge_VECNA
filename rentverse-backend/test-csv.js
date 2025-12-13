const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Test CSV parsing for images
const csvPath = path.join(__dirname, '../rentverse-datasets/rentals_raw.csv');

if (!fs.existsSync(csvPath)) {
  console.error('CSV file not found');
  process.exit(1);
}

const fileContent = fs.readFileSync(csvPath, 'utf-8');
const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  relax_column_count: true,
});

console.log('First 3 records images:');
records.slice(0, 3).forEach((row, index) => {
  console.log(`\nRecord ${index + 1}:`);
  console.log('Raw images field:', JSON.stringify(row.images));
  console.log('Images length:', row.images ? row.images.length : 0);
  if (row.images) {
    const splitImages = row.images.split(',');
    console.log('After split:', splitImages.length, 'urls');
    console.log('First URL:', splitImages[0]);
  }
});