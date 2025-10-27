'use client';
import ActivityForm from './components/ActivityForm';
import ActivityList from './components/ActivityList';

export default function Page() {
  return (
    <div className="space-y-6 mx-2">
      <h1 className="text-2xl font-bold">Planer aktywności</h1>
      <p className="text-gray-700">Dodawaj zadania, odhaczaj wykonane i trzymaj notatki.</p>

      {/* [FP: FUNKCJA WYŻSZA] */}
      <ActivityForm onCreated={() => window.location.reload()} />

      <ActivityList />
    </div>
  );
}
