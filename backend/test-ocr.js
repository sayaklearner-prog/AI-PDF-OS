const { OcrService } = require('./dist/ai/services/ocr.service');
const fs = require('fs');
async function test() {
  const ocr = new OcrService();
  ocr.logger.log = console.log;
  ocr.logger.error = console.error;
  
  // Find a PDF in the frontend
  // Wait, I can just create a small buffer manually or read a file.
}
test();
