export type SeminarLevel = "all" | "beginner" | "intermediate" | "advanced";

export interface Seminar {
  id: string;
  title: string;
  instructor: string;
  instructorRank?: string;
  organization?: string;
  style?: string;

  startDate: string;
  endDate: string;

  venue?: string;
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;

  description?: string;
  level?: SeminarLevel;
  registrationUrl?: string;
  contactEmail?: string;
  fee?: string;

  source: string;
  sourceUrl?: string;
  lastScraped: string;
  manualOverride: boolean;
}

export type SeminarFormData = Omit<
  Seminar,
  "id" | "source" | "sourceUrl" | "lastScraped" | "manualOverride"
>;
