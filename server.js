const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

// Habilita CORS para todas las solicitudes
app.use(cors());
app.use(bodyParser.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Puppeteer PDF Service Ready');
});

// Ruta para generar el PDF
app.post('/generate-pdf', async (req, res) => {
  const { html } = req.body;

  // Validación de entrada
  if (!html || typeof html !== 'string') {
    return res.status(400).send('No HTML content received or format is invalid.');
  }

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    // Enviar el PDF con encabezados correctos
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=generated.pdf',
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
