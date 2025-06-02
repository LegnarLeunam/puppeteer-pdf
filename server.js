import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Ruta principal
app.get('/', (_req, res) => {
  res.send('Puppeteer PDF Service Ready');
});

// Ruta para generar PDF
app.post('/generate-pdf', async (req, res) => {
  const { html } = req.body;

  if (!html || typeof html !== 'string') {
    return res.status(400).send('Invalid request: "html" field is required.');
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process'
      ]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="documento.pdf"',
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error('❌ Error generating PDF:', err);
    res.status(500).send('Error generating PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`✅ PDF service running on port ${PORT}`);
});
