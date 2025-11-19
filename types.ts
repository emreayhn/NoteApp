export interface Attachment {
  id: string;
  type: 'image' | 'document';
  name: string;
  data: string; // Base64 string
}

export interface Note {
  id: string;
  author: string;
  content: string;
  date: string;
  fieldId: string;
  stageId: string;
  weekId: string;
  summary?: string; // For Gemini AI
  attachments?: Attachment[];
}

export interface Field {
  id: string;
  title: string;
  description: string;
  iconName: 'Brain' | 'BarChart' | 'Database' | 'Code' | 'LineChart' | 'Users';
  color: 'sky' | 'orange' | 'lime' | 'indigo' | 'fuchsia' | 'rose';
}

export interface Stage {
  id: string;
  title: string;
}

export interface Week {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export type UserMode = 'viewer' | 'creator' | null;

// Navigation State Machine
export interface NavigationState {
  view: 'landing' | 'fields' | 'stages' | 'weeks' | 'notes' | 'note-detail' | 'search';
  selectedFieldId: string | null;
  selectedStageId: string | null;
  selectedWeekId: string | null;
  selectedNoteId: string | null;
}

export interface FilterState {
  query: string;
  fieldId: string | null;
  stageId: string | null;
  weekId: string | null;
}