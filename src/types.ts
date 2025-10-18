export interface Activity {
  id: string;       // uuid
  title: string;
  notes?: string;
  date?: string;    // ISO yyyy-mm-dd
  done: boolean;
}
