const pdfParse = require('pdf-parse');
const Tesseract = require('node-tesseract-ocr');

const ocr = async (file) => {
    const dataBuffer = Buffer.from(file.data);
    const pdf = await pdfParse(dataBuffer);
    const text = pdf.text.replace(/[^\w\s]/gi, ''); // Remove non-text characters
    const result = await Tesseract.recognize(text, 'eng+heb');
    return result.data.text;
};

module.exports = ocr;