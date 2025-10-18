import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Activity } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'activities.json');

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, '[]', 'utf-8');
  }
}

export async function readAll(): Promise<Activity[]> {
  await ensureFile();
  const raw = await fs.readFile(FILE, 'utf-8');
  try { return JSON.parse(raw) as Activity[]; } catch { return []; }
}

export async function writeAll(items: Activity[]) {
  await ensureFile();
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), 'utf-8');
}
