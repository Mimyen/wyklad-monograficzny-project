'use client';
import { useEffect, useState } from 'react';
import type { Activity } from '@/types';

export default function ActivityList() {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // [FP: FUNKCJA Z EFEKTEM UBOCZNYM]
  async function load() {
    setLoading(true);
    const res = await fetch('/api/activities');
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  // [FP: DOMKNIĘCIE]
  useEffect(() => { load(); }, []);

  // [FP: FUNKCJA NIECZYSTA]
  async function toggleDone(id: string, done: boolean) {
    await fetch('/api/activities', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, done }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/activities?id=${id}`, { method: 'DELETE' });
    load();
  }

  if (loading) return <p>Ładowanie…</p>;
  if (!items.length) return <p>Brak aktywności – dodaj pierwszą powyżej.</p>;

  return (
    <ul className="space-y-2">
      {/* [FP: FUNKCJA WYŻSZA .map] */}
      {items.map(item => (
        <li key={item.id} className="border rounded-xl p-3 flex gap-3 items-start bg-white">
          {/* [FP: LAMBDA] */}
          <input
            type="checkbox"
            checked={item.done}
            onChange={e => toggleDone(item.id, e.target.checked)}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`font-medium ${item.done ? 'line-through text-gray-500' : ''}`}>{item.title}</span>
              {item.date && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200">{item.date}</span>}
            </div>
            {item.notes && <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{item.notes}</p>}
          </div>
          <button onClick={() => remove(item.id)} className="text-red-600 hover:underline">Usuń</button>
        </li>
      ))}
    </ul>
  );
}
