'use client';
import { useState } from 'react';

export default function ActivityForm({ onCreated }: { onCreated: () => void }) {
  // [FP: STAN LOKALNY]
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // [FP: FUNKCJA Z EFEKTEM UBOCZNYM]
  // [FP: DOMKNIĘCIE]
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, notes }),
      });
      if (!res.ok) throw new Error('Błąd zapisu');
      // [FP: CFUNKCJA NIECZYSTA]
      setTitle(''); setDate(''); setNotes('');
      onCreated(); // [FP: WYWOŁANIE CALLBACKU] – przekazana funkcja (wyższy rząd semantycznie)
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="grid gap-2 md:grid-cols-4 items-end p-3 border rounded-xl bg-white">
      {/* [FP: LAMBDA] */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium">Tytuł</label>
        <input className="mt-1 w-full border rounded-lg px-3 py-2"
               value={title} onChange={e=>setTitle(e.target.value)} placeholder="Np. Trening" required/>
      </div>
      <div>
        <label className="block text-sm font-medium">Data</label>
        <input type="date" className="mt-1 w-full border rounded-lg px-3 py-2"
               value={date} onChange={e=>setDate(e.target.value)} />
      </div>
      <div className="md:col-span-4">
        <label className="block text-sm font-medium">Notatki</label>
        <textarea className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Opcjonalnie"/>
      </div>
      <button disabled={loading}
              className="md:col-span-4 bg-black text-white py-2 rounded-lg disabled:opacity-60">
        {loading ? 'Zapisywanie…' : 'Dodaj aktywność'}
      </button>
    </form>
  );
}
