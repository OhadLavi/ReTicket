const pdfParse = require('pdf-parse');
const Tesseract = require('node-tesseract-ocr');

const ocr = async (file) => {
    console.log('1');
    const dataBuffer = Buffer.from(file.data);
    console.log('2');
    const pdf = await pdfParse(dataBuffer);
    console.log('3');
    const text = pdf.text.replace(/[^\w\s]/gi, ''); // Remove non-text characters
    console.log(text);
    const result = await Tesseract.recognize(text, 'eng+heb');
    console.log('5');
    return result.data.text;
};


module.exports = ocr;


/*


async function savePdfAsImage2(filePath, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const parser = new PDFParser();
  const pages = await parser.parse(filePath);
  for (const page of pages) {
    const imageData = await page.toImage();
    const fileName = `${page.number}.png`;
    fs.writeFileSync(`${outputDir}/${fileName}`, imageData);
  }
}

// const converter = new pdfImgConvert();
// const images = await converter.convert('path/to/pdf.pdf', 'png');
// for (const image of images) {
//   fs.writeFileSync(`path/to/image-${image.page}.png`, image.buffer);
// }

async function savePdfAsImage(filePath, outputDir) {
  console.log('savePdfAsImage');
  const pdf2picOptions = {
    density: 150,
    savename: 'image',
    savedir: outputDir,
    format: 'png',
    size: '600x600'
  };
  const pdf2picInstance = fromPath(filePath, pdf2picOptions);
  const pageToConvertAsImage = 1;
  pdf2picInstance(pageToConvertAsImage).then((resolve) => {
    console.log('image saved');
  });

  return "1";
}

async function findQrCodeInImage(imagePath) {
  const image = await jimp.read(imagePath);
  const qr = new qrCode();
  qr.callback = function(err, value) {
    if (err) {
      console.error(err);
      return null;
    }
    return value.result;
  };
  qr.decode(image.bitmap);
}

async function findBarcodeInImage(imagePath) {
  const image = await jimp.read(imagePath);
  const canvas = jimp.create(image.bitmap.width, image.bitmap.height);
  jsBarcode(canvas.bitmap, '');
  const pixels = canvas.bitmap.data;
  const numChannels = 4;
  for (let i = 0; i < pixels.length; i += numChannels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (r < 200 && g < 200 && b < 200) {
      return true;
    }
  }
  return false;
}

async function compareBarcodeAndQr(barcode, qr) {
  if (barcode === qr) {
    return true;
  } else {
    return false;
  }
}

async function parseTicketContent(content) {
  const regexPrice = /price:\s*(\d+\.\d+)/i;
  const regexDate = /date:\s*(\d{4}-\d{2}-\d{2})/i;
  const regexName = /name:\s*(.*)/i;
  const priceMatch = content.match(regexPrice);
  const dateMatch = content.match(regexDate);
  const nameMatch = content.match(regexName);
  const result = {
    price: priceMatch ? priceMatch[1] : null,
    date: dateMatch ? dateMatch[1] : null,
    name: nameMatch ? nameMatch[1] : null
  };
  return result;
}

async function hasQrCode(pdfDoc) {
  const firstPage = pdfDoc.getPages()[0];
  const { width, height } = firstPage.getSize();
  firstPage.
  const imageData = await firstPage.renderImageData();
  const code = jsqr(imageData.data, width, height);
  return code !== null && code.data !== '';
}

async function loadPdfFile(filePath) {
  const pdfBytes = await fs.promises.readFile(filePath);
  return await PDFDocument.load(pdfBytes);
}

async function getPdfContent(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

async function savePdf(name, content) {
  const pdf = new File({
    name: name,
    data: content
  });
  await pdf.save();
  return pdf;
}


  //const content = await getPdfContent(pdfPath);
  const pdf2 = await loadPdfFile(pdfPath);
  const hasQr = await hasQrCode(pdf2);
  //const pdf = await savePdf(fs.readFileSync(pdfPath), 'application/pdf', pdfName);
  //const images = await savePdfAsImage2(pdfPath, outputDir);
  // const qrCodeData = await findQrCodeInImage(images[0]);
  // const barcodeFound = await findBarcodeInImage(images[0]);
  // const ticketData = await parseTicketContent(content);
  // const comparisonResult = await compareBarcodeAndQr(qrCodeData, ticketData.barcode);

  // if (barcodeFound && comparisonResult) {
  //   const result = {
  //     name: ticketData.name,
  //     price: ticketData.price,
  //     date: ticketData.date,
  //     qrCodeData: qrCodeData
  //   };
  //   return result;
  // } else {
  //   throw new Error('Barcode not found or QR code does not match.');
  // }
*/