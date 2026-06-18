const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001';

async function testPipeline() {
  console.log('=== Starting Contract Intelligence Pipeline Test ===');
  
  const uploadsDir = path.join(__dirname, 'uploads');
  const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.pdf'));
  if (files.length === 0) {
    console.error('No PDFs found!');
    process.exit(1);
  }
  const pdfPath = path.join(uploadsDir, files[0]);
  console.log(`Using PDF: ${pdfPath}`);

  // 1. Publish (Upload) the document to create the DB record properly via the backend service
  console.log('\n[1/5] Uploading document to /documents/publish...');
  const formData = new FormData();
  formData.append('files', fs.createReadStream(pdfPath));
  
  const publishRes = await fetch(`${API_URL}/documents/publish`, {
    method: 'POST',
    body: formData
  });
  if (!publishRes.ok) throw new Error(`Publish failed: ${await publishRes.text()}`);
  const publishData = await publishRes.json();
  const docId = publishData.docId;
  console.log(`✅ Uploaded successfully. docId: ${docId}`);

  // 2. Trigger Analysis
  console.log('\n[2/5] Triggering AI Analysis...');
  const base64Data = fs.readFileSync(pdfPath, { encoding: 'base64' });
  const analyzeRes = await fetch(`${API_URL}/ai/contracts/${docId}/analyze`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pdfBase64: base64Data })
  });
  if (!analyzeRes.ok) throw new Error(`Analyze failed: ${await analyzeRes.text()}`);
  console.log('✅ Analysis triggered successfully.');

  // 3. Poll Status
  console.log('\n[3/5] Polling status...');
  let status = 'PENDING';
  let retries = 0;
  while (status !== 'COMPLETED' && status !== 'FAILED' && retries < 30) {
    await new Promise(r => setTimeout(r, 2000));
    const statusRes = await fetch(`${API_URL}/ai/contracts/${docId}/status`);
    if (statusRes.ok) {
      const statusData = await statusRes.json();
      status = statusData.status;
      process.stdout.write(`\rCurrent Status: ${status} (${statusData.progressPercentage || 0}%)   `);
    }
    retries++;
  }
  console.log('');
  if (status !== 'COMPLETED') {
    throw new Error(`Pipeline did not complete. Final status: ${status}`);
  }
  console.log('✅ AI Pipeline execution completed successfully!');

  // 4. Fetch Summary
  console.log('\n[4/5] Fetching Executive Summary...');
  const summaryRes = await fetch(`${API_URL}/ai/contracts/${docId}/summary`);
  if (!summaryRes.ok) throw new Error(`Summary fetch failed: ${await summaryRes.text()}`);
  const summaryData = await summaryRes.json();
  console.log('✅ Summary retrieved:');
  console.log(`Contract Type: ${summaryData.contractType}`);
  console.log(`Parties: ${JSON.stringify(summaryData.parties)}`);

  // 5. Test Chat
  console.log('\n[5/5] Testing AI Copilot Chat...');
  const chatRes = await fetch(`${API_URL}/ai/contracts/${docId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'What are the termination conditions?' })
  });
  if (!chatRes.ok) throw new Error(`Chat failed: ${await chatRes.text()}`);
  const chatData = await chatRes.json();
  console.log('✅ Chat response retrieved:');
  console.log(`Answer: ${chatData.reply.substring(0, 100)}...`);
  console.log(`Citations: ${chatData.citations.length} clauses referenced.`);

  console.log('\n🎉 ALL TESTS PASSED! The AI Pipeline is functioning flawlessly.');
}

testPipeline().catch(err => console.error('\n❌ TEST FAILED:', err));
