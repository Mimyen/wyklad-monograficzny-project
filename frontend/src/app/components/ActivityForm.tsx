'use client';
import { useReducer } from 'react';

// Hermetyzacja API + normalizacja błędów
export type NewActivity = {
  title: string;
  date: string | null;   // null gdy brak daty
  notes: string;
  done?: boolean;
};

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const BASE_URL = "http://127.0.0.1:8000";

export async function createActivity(input: NewActivity): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, done: false }),
  });

  if (!res.ok) {
    let msg = "Błąd zapisu";
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    } catch { /* ignoruj parse error */ }
    throw new ApiError(msg, res.status);
  }
}


type Props = { onCreated: () => void };

type FormState = {
  title: string;
  date: string;      // pole <input type="date"> (YYYY-MM-DD) lub ""
  notes: string;
  loading: boolean;
  error: string | null;
  success: boolean;
};

type Action =
  | { type: "SET_FIELD"; field: keyof Pick<FormState, "title" | "date" | "notes">; value: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_ERROR"; message: string }
  | { type: "RESET_AFTER_SUCCESS" };

const initialState: FormState = {
  title: "",
  date: "",
  notes: "",
  loading: false,
  error: null,
  success: false,
};

function reducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value, error: null, success: false };
    case "SUBMIT_START":
      return { ...state, loading: true, error: null, success: false };
    case "SUBMIT_SUCCESS":
      return { ...initialState, success: true }; // czyści pola i pokaże sukces
    case "SUBMIT_ERROR":
      return { ...state, loading: false, error: action.message, success: false };
    case "RESET_AFTER_SUCCESS":
      return { ...state, success: false };
    default:
      return state;
  }
}

export default function ActivityForm({ onCreated }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { title, date, notes, loading, error, success } = state;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    // prosta walidacja lokalna (możesz podmienić na zod w przyszłości)
    if (!title.trim()) {
      dispatch({ type: "SUBMIT_ERROR", message: "Tytuł jest wymagany." });
      return;
    }

    dispatch({ type: "SUBMIT_START" });
    try {
      await createActivity({
        title: title.trim(),
        date: date ? date : null,
        notes: notes.trim(),
        done: false,
      });
      dispatch({ type: "SUBMIT_SUCCESS" });
      onCreated();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message || `Błąd zapisu (status ${err.status ?? "?"})`
          : "Nieoczekiwany błąd. Spróbuj ponownie.";
      dispatch({ type: "SUBMIT_ERROR", message });
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-2 md:grid-cols-4 items-end p-3 border rounded-xl bg-white">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium">Tytuł</label>
        <input
          className="mt-1 w-full border rounded-lg px-3 py-2"
          value={title}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "title", value: e.target.value })}
          placeholder="Np. Trening"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Data</label>
        <input
          type="date"
          className="mt-1 w-full border rounded-lg px-3 py-2"
          value={date}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "date", value: e.target.value })}
        />
      </div>

      <div className="md:col-span-4">
        <label className="block text-sm font-medium">Notatki</label>
        <textarea
          className="mt-1 w-full border rounded-lg px-3 py-2"
          value={notes}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "notes", value: e.target.value })}
          placeholder="Opcjonalnie"
        />
      </div>

      {error && (
        <div className="md:col-span-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div
          className="md:col-span-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
          onAnimationEnd={() => dispatch({ type: "RESET_AFTER_SUCCESS" })}
        >
          Zapisano aktywność.
        </div>
      )}

      <button
        disabled={loading}
        className="md:col-span-4 bg-black text-white py-2 rounded-lg disabled:opacity-60"
      >
        {loading ? "Zapisywanie…" : "Dodaj aktywność"}
      </button>
    </form>
  );
}