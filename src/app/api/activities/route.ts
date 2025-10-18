import { NextRequest, NextResponse } from 'next/server';
import { readAll, writeAll } from '@/lib/fileDb';
import { Activity } from '@/types';
import { randomUUID } from 'node:crypto';

export async function GET() {
  // [KATEGORIA: Set]
  const items = await readAll();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const items = await readAll();

  // [MORFIZM]
  const newItem: Activity = {
    id: randomUUID(), // [GENERATOR] 
    title: String(data.title || '').trim(),
    notes: data.notes ? String(data.notes) : '',
    date: data.date ? String(data.date) : undefined,
    done: false,
  };

  if (!newItem.title)
    return NextResponse.json({ error: 'Title required' }, { status: 400 });

  items.push(newItem);

  await writeAll(items);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const items = await readAll();

  // [IZOMORFIZM]
  const idx = items.findIndex(i => i.id === data.id);
  if (idx === -1)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  items[idx] = { ...items[idx], ...data };

  await writeAll(items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const items = await readAll();

  // [FUNKTOR]
  const filtered = items.filter(i => i.id !== id);

  await writeAll(filtered);
  return NextResponse.json({ ok: true });
}
