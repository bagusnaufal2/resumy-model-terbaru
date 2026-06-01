import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const dataDirectory = new URL('../data/', import.meta.url);
const recordsFile = new URL('../data/analysis-records.json', import.meta.url);
const legacyHistoryFile = new URL(
  '../data/analysis-history.json',
  import.meta.url,
);
const MAX_RECORD_ITEMS = 100;

function createPreview(value, maxLength = 280) {
  const normalizedValue = String(value || '').replace(/\s+/g, ' ').trim();

  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, maxLength)}...`;
}

async function readJsonArray(file) {
  try {
    const content = await readFile(file, 'utf8');
    const parsedContent = JSON.parse(content);

    return Array.isArray(parsedContent) ? parsedContent : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

async function readRecordsFile() {
  const records = await readJsonArray(recordsFile);

  if (records) {
    return records;
  }

  return (await readJsonArray(legacyHistoryFile)) || [];
}

async function writeRecordsFile(records) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(recordsFile, JSON.stringify(records, null, 2));
}

export async function saveAnalysisRecord({ analysis, file, jobDescription }) {
  const records = await readRecordsFile();
  const record = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    jobDescriptionPreview: createPreview(jobDescription),
    file: {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    },
    result: {
      score: analysis.score,
      skillsHave: analysis.skillsHave,
      skillsMissing: analysis.skillsMissing,
      improvements: analysis.improvements,
    },
  };

  await writeRecordsFile([record, ...records].slice(0, MAX_RECORD_ITEMS));

  return record;
}

export async function getAnalysisRecords() {
  return readRecordsFile();
}

export async function getAnalysisRecordById(id) {
  const records = await readRecordsFile();
  return records.find((record) => record.id === id) || null;
}
