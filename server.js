import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('✅ Puppeteer PDF Service Ready');
});

app.post('/generate-pdf', async (req, res) => {
  const { html } = req.body;

  if (!html || typeof html !== 'string') {
    return res.status(400).send('Missing or invalid "html" field in request body.');
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="generated.pdf"',
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
});

app.listen(port, () => {
  console.log(`✅ PDF service running on port ${port}`);
});
