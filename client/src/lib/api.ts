import type { Seminar, SeminarFormData } from "@/types/seminar";

const BASE_URL = "/api";

export async function fetchSeminars(): Promise<Seminar[]> {
  const res = await fetch(`${BASE_URL}/seminars`);
  if (!res.ok) throw new Error("Failed to fetch seminars");
  return res.json();
}

export async function fetchSeminar(id: string): Promise<Seminar> {
  const res = await fetch(`${BASE_URL}/seminars/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Failed to fetch seminar");
  return res.json();
}

export async function fetchCountries(): Promise<
  { country: string; countryCode: string }[]
> {
  const res = await fetch(`${BASE_URL}/seminars/countries`);
  if (!res.ok) throw new Error("Failed to fetch countries");
  return res.json();
}

export async function createSeminar(data: SeminarFormData): Promise<Seminar> {
  const res = await fetch(`${BASE_URL}/seminars`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create seminar");
  return res.json();
}

export async function updateSeminar(
  id: string,
  data: SeminarFormData
): Promise<Seminar> {
  const res = await fetch(`${BASE_URL}/seminars/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update seminar");
  return res.json();
}

export async function deleteSeminar(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/seminars/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete seminar");
}
