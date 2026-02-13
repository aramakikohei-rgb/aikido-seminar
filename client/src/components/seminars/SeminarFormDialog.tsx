import { useEffect, useState } from "react";
import type { Seminar, SeminarFormData, SeminarLevel } from "@/types/seminar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY_FORM: SeminarFormData = {
  title: "",
  instructor: "",
  instructorRank: "",
  organization: "",
  style: "",
  startDate: "",
  endDate: "",
  venue: "",
  city: "",
  country: "",
  countryCode: "",
  latitude: 0,
  longitude: 0,
  description: "",
  level: "all",
  registrationUrl: "",
  contactEmail: "",
  fee: "",
};

function seminarToForm(s: Seminar): SeminarFormData {
  return {
    title: s.title,
    instructor: s.instructor,
    instructorRank: s.instructorRank ?? "",
    organization: s.organization ?? "",
    style: s.style ?? "",
    startDate: s.startDate,
    endDate: s.endDate,
    venue: s.venue ?? "",
    city: s.city,
    country: s.country,
    countryCode: s.countryCode,
    latitude: s.latitude,
    longitude: s.longitude,
    description: s.description ?? "",
    level: s.level ?? "all",
    registrationUrl: s.registrationUrl ?? "",
    contactEmail: s.contactEmail ?? "",
    fee: s.fee ?? "",
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seminar: Seminar | null;
  onSave: (data: SeminarFormData) => Promise<void>;
}

const inputClasses =
  "bg-[#12121a] border-[#2a2a35] text-[#d4c8b8] placeholder:text-[#555] hover:border-[#3a3a45] transition-colors focus:ring-[#c73e1d]/30 focus:border-[#c73e1d]/50";

export default function SeminarFormDialog({
  open,
  onOpenChange,
  seminar,
  onSave,
}: Props) {
  const [form, setForm] = useState<SeminarFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(seminar ? seminarToForm(seminar) : EMPTY_FORM);
    }
  }, [open, seminar]);

  const set = (field: keyof SeminarFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const isEdit = seminar !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#16161e] border-[#2a2a35] text-[#e8e0d4]">
        <DialogHeader>
          <DialogTitle
            className="text-[#f5f0e8] text-xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            {isEdit ? "Edit Seminar" : "Add Seminar"}
          </DialogTitle>
          <div className="h-[1px] bg-gradient-to-r from-[#c73e1d]/40 to-transparent mt-2" />
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-5 py-2">
          {/* Title */}
          <div className="grid gap-1.5">
            <Label htmlFor="title" className="text-[10px] uppercase tracking-[0.12em] text-[#8a8578] font-semibold">
              Title *
            </Label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputClasses}
            />
          </div>

          {/* Instructor row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="instructor" className="text-[10px] uppercase tracking-[0.12em] text-[#8a8578] font-semibold">
                Instructor *
              </Label>
              <Input
                id="instructor"
                required
                value={form.instructor}
                onChange={(e) => set("instructor", e.target.value)}
                className={inputClasses}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="instructorRank" className="text-[10px] uppercase tracking-[0.12em] text-[#8a8578] font-semibold">
                Rank
              </Label>
              <Input
                id="instructorRank"
                placeholder="e.g. 7th Dan"
                value={form.instructorRank}
                onChange={(e) => set("instructorRank", e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Organization / Style */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="organization" className="text-[10px] uppercase tracking-[0.12em] text-[#8a8578] font-semibold">
                Organization
              </Label>
              <Input
                id="organization"
                placeholder="e.g. USAF, Aikikai"
                value={form.organization}
                onChange={(e) => set("organization", e.target.value)}
                className={inputClasses}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="style" className="text-[10px] uppercase tracking-[0.12em] text-[#8a8578] font-semibold">
                Style
              </Label>
              <Input
                id="style"
                placeholder="e.g. Aikikai, Yoshinkan"
                value={form.style}
                onChange={(e) => set("style", e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="startDate" className="text-[10px] uppercase tracking-[0.12em] text-[#8a8578] font-semibold">
                Start Date *
              </Label>
              <Input
                id="startDate"
                type="date"
                required
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className={inputClasses}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="endDate" className="text-[10px] uppercase tracking-[0.12em] text-[#8a8578] font-semibold">
                End Date *
              </Label>
              <Input
                id="endDate"
                type="date"
                required
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Venue */}
          <div className="grid gap-1.5">
            <Label htmlFor="venue" className="text-[10px] uppercase tracking-[0.12em] text-[#8a8578] font-semibold">
              Venue
            </Label>
            <Input
              id="venue"
              value={form.venue}
              onChange={(e) => set("venue", e.target.value)}
              className={inputClasses}
            />
          </div>

          {/* Location row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="city" className="text-[10px] uppercase tracking-[0.12em] text-[#8a8578] font-semibold">
                City *
              </Label>
              <Input
                id="city"
                required
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className={inputClasses}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="country" className="text-[10px] uppercase tracking-[0.12em] text-[#8a8578] font-semibold">
                Country *
              </Label>
              <Input
                id="country"
                required
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                className={inputClasses}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="countryCode" className="text-[10px] uppercase tracking-[0.12em] text-[#8a8578] font-semibold">
                Code *
              </Label>
              <Input
                id="countryCode"
                required
                placeholder="e.g. JP"
                maxLength={2}
                value={form.countryCode}
                onChange={(e) =>
                  set("countryCode", e.target.value.toUpperCase())
                }
                className={inputClasses}
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-1.5">
            <Label htmlFor="description" className="text-[10px] uppercase tracking-[0.12em] text-[#8a8578] font-semibold">
              Description
            </Label>
            <textarea
              id="description"
              className={`flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-[#555] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c73e1d]/30 ${inputClasses}`}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          {/* Level / Fee */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label className="text-[10px] uppercase tracking-[0.12em] text-[#8a8578] font-semibold">
                Level
              </Label>
              <Select
                value={form.level ?? "all"}
                onValueChange={(v) => set("level", v as SeminarLevel)}
              >
                <SelectTrigger className={inputClasses}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a24] border-[#2a2a35] text-[#d4c8b8]">
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="fee" className="text-[10px] uppercase tracking-[0.12em] text-[#8a8578] font-semibold">
                Fee
              </Label>
              <Input
                id="fee"
                placeholder="e.g. $150, \u20AC80"
                value={form.fee}
                onChange={(e) => set("fee", e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="registrationUrl" className="text-[10px] uppercase tracking-[0.12em] text-[#8a8578] font-semibold">
                Registration URL
              </Label>
              <Input
                id="registrationUrl"
                type="url"
                value={form.registrationUrl}
                onChange={(e) => set("registrationUrl", e.target.value)}
                className={inputClasses}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="contactEmail" className="text-[10px] uppercase tracking-[0.12em] text-[#8a8578] font-semibold">
                Contact Email
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#2a2a35]">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#8a8578] hover:text-[#d4c8b8] hover:bg-[#1c1c24] border border-[#2a2a35] transition-all duration-200"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#c73e1d] hover:bg-[#d44a28] text-[#f5f0e8] transition-all duration-200 shadow-lg shadow-[#c73e1d]/15 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
