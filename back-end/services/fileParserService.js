import path from "node:path";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";

class ResumeParseError extends Error {
  constructor(message) {
    super(message);
    this.name = "ResumeParseError";
    this.statusCode = 400;
  }
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\u0000/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function assertParsedText(text, emptyMessage) {
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    throw new ResumeParseError(emptyMessage);
  }

  return normalizedText;
}

async function parsePdf(buffer) {
  try {
    const parsedPdf = await pdfParse(buffer);
    return assertParsedText(
      parsedPdf.text,
      "This PDF has no readable text layer. Upload a DOCX or a text-based PDF."
    );
  } catch (error) {
    if (error instanceof ResumeParseError) {
      throw error;
    }

    throw new ResumeParseError("Could not read text from the PDF resume.");
  }
}

async function parseDocx(buffer) {
  try {
    const parsedDocx = await mammoth.extractRawText({ buffer });
    return assertParsedText(
      parsedDocx.value,
      "The uploaded DOCX does not contain readable text."
    );
  } catch (error) {
    if (error instanceof ResumeParseError) {
      throw error;
    }

    throw new ResumeParseError("Could not read text from the DOCX resume.");
  }
}

export async function extractResumeText(file) {
  if (!file?.buffer) {
    throw new ResumeParseError("Please upload a PDF or DOCX resume.");
  }

  const extension = path.extname(file.originalname || "").toLowerCase();

  if (extension === ".pdf" || file.mimetype === "application/pdf") {
    return parsePdf(file.buffer);
  }

  if (
    extension === ".docx" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return parseDocx(file.buffer);
  }

  throw new ResumeParseError("Only PDF and DOCX resumes can be analyzed.");
}
