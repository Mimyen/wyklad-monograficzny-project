'use client';
import { useEffect, useReducer, useRef } from 'react';
import { ApiError } from './ActivityForm';

const BASE_URL = "http://127.0.0.1:8000"
// Jeśli masz już ApiError/BASE_URL z poprzedniej wiadomości, zostaw je i tylko dodaj te funkcje.
export type Activity = {
  id: string;
  title: string;
  date: string | null;
  notes: string;
  done: boolean;
};

export async function listActivities(opts?: { signal?: AbortSignal }): Promise<Activity[]> {
  const res = await fetch(`${BASE_URL}/v1/activities`, { method: "GET", signal: opts?.signal });
  if (!res.ok) throw new ApiError("Nie udało się pobrać listy aktywności.", res.status);
  return res.json();
}


export async function patchActivity(
  id: string,
  patch: Partial<Pick<Activity, "title" | "date" | "notes" | "done">>
): Promise<Activity> {
  const res = await fetch(`${BASE_URL}/v1/activity/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    let msg = "Nie udało się zaktualizować aktywności.";
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    } catch {}
    throw new ApiError(msg, res.status);
  }
  return res.json();
}

export async function deleteActivity(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/activity/${id}`, { method: "DELETE" });
  if (!res.ok) {
    let msg = "Nie udało się usunąć aktywności.";
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    } catch {}
    throw new ApiError(msg, res.status);
  }
}

type State = {
  items: Activity[];
  loading: boolean;
  error: string | null;
};
type Action =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; items: Activity[] }
  | { type: 'LOAD_ERROR'; message: string }
  | { type: 'OPTIMISTIC_TOGGLE'; id: string; done: boolean }
  | { type: 'OPTIMISTIC_DELETE'; id: string }
  | { type: 'ROLLBACK_ITEMS'; items: Activity[] };

const initial: State = { items: [], loading: true, error: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return { items: action.items, loading: false, error: null };
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.message };
    case 'OPTIMISTIC_TOGGLE':
      return {
        ...state,
        items: state.items.map(i => (i.id === action.id ? { ...i, done: action.done } : i)),
      };
    case 'OPTIMISTIC_DELETE':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    case 'ROLLBACK_ITEMS':
      return { ...state, items: action.items };
    default:
      return state;
  }
}

export default function ActivityList() {
  const [state, dispatch] = useReducer(reducer, initial);
  const abortRef = useRef<AbortController | null>(null);

  async function load() {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    dispatch({ type: 'LOAD_START' });
    try {
      const data = await listActivities({ signal: ac.signal });
      dispatch({ type: 'LOAD_SUCCESS', items: data });
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((err as any)?.name === 'AbortError') return;
      const message =
        err instanceof ApiError ? err.message : 'Nie udało się pobrać danych. Spróbuj ponownie.';
      dispatch({ type: 'LOAD_ERROR', message });
    }
  }

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, []);

  // Optymistyczne toggle z rollbackiem
  async function toggleDone(id: string, done: boolean) {
    const prev = state.items;
    dispatch({ type: 'OPTIMISTIC_TOGGLE', id, done });
    try {
      await patchActivity(id, { done });
    } catch (err) {
      dispatch({ type: 'ROLLBACK_ITEMS', items: prev });
      alert(err instanceof ApiError ? err.message : 'Błąd aktualizacji.');
    }
  }

  // Optymistyczne usuwanie z rollbackiem
  async function remove(id: string) {
    const prev = state.items;
    dispatch({ type: 'OPTIMISTIC_DELETE', id });
    try {
      await deleteActivity(id);
    } catch (err) {
      dispatch({ type: 'ROLLBACK_ITEMS', items: prev });
      alert(err instanceof ApiError ? err.message : 'Błąd usuwania.');
    }
  }

  const { loading, items, error } = state;

  if (loading) return <p>Ładowanie…</p>;
  if (error) return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {error}
    </div>
  );
  if (!items.length) return <p>Brak aktywności – dodaj pierwszą powyżej.</p>;

  return (
    <ul className="space-y-2">
      {items.map(item => (
        <li key={item.id} className="border rounded-xl p-3 flex gap-3 items-start bg-white">
          <input
            type="checkbox"
            checked={item.done}
            onChange={e => toggleDone(item.id, e.target.checked)}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`font-medium ${item.done ? 'line-through text-gray-500' : ''}`}>
                {item.title}
              </span>
              {item.date && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200">
                  {item.date}
                </span>
              )}
            </div>
            {item.notes && (
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{item.notes}</p>
            )}
          </div>
          <button onClick={() => remove(item.id)} className="text-red-600 hover:underline">
            Usuń
          </button>
        </li>
      ))}
    </ul>
  );
} 