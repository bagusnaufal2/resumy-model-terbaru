import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const dataDirectory = new URL('../data/', import.meta.url);
const historyFile = new URL('../data/analysis-history.json', import.meta.url);
const MAX_HISTORY_ITEMS = 100;

function createPreview(value, maxLength = 280) {
  const normalizedValue = String(value || '').replace(/\s+/g, ' ').trim();

  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, maxLength)}...`;
}

async function readHistoryFile() {
  try {
    const content = await readFile(historyFile, 'utf8');
    const parsedContent = JSON.parse(content);

    return Array.isArray(parsedContent) ? parsedContent : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function writeHistoryFile(history) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(historyFile, JSON.stringify(history, null, 2));
}

export async function saveAnalysisRecord({ analysis, file, jobDescription }) {
  const history = await readHistoryFile();
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

  await writeHistoryFile([record, ...history].slice(0, MAX_HISTORY_ITEMS));

  return record;
}

export async function getAnalysisHistory() {
  return readHistoryFile();
}

export async function getAnalysisRecordById(id) {
  const history = await readHistoryFile();
  return history.find((record) => record.id === id) || null;
}
