import { useEffect, useState } from "react";
import type { Seminar, SeminarFormData, SeminarLevel } from "@/types/seminar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Seminar" : "Add Seminar"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          {/* Title */}
          <div className="grid gap-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          {/* Instructor row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="instructor">Instructor *</Label>
              <Input
                id="instructor"
                required
                value={form.instructor}
                onChange={(e) => set("instructor", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="instructorRank">Rank</Label>
              <Input
                id="instructorRank"
                placeholder="e.g. 7th Dan"
                value={form.instructorRank}
                onChange={(e) => set("instructorRank", e.target.value)}
              />
            </div>
          </div>

          {/* Organization / Style */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                placeholder="e.g. USAF, Aikikai"
                value={form.organization}
                onChange={(e) => set("organization", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="style">Style</Label>
              <Input
                id="style"
                placeholder="e.g. Aikikai, Yoshinkan"
                value={form.style}
                onChange={(e) => set("style", e.target.value)}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                required
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
              />
            </div>
          </div>

          {/* Venue */}
          <div className="grid gap-1.5">
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              value={form.venue}
              onChange={(e) => set("venue", e.target.value)}
            />
          </div>

          {/* Location row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                required
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                required
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="countryCode">Code *</Label>
              <Input
                id="countryCode"
                required
                placeholder="e.g. JP"
                maxLength={2}
                value={form.countryCode}
                onChange={(e) =>
                  set("countryCode", e.target.value.toUpperCase())
                }
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          {/* Level / Fee */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Level</Label>
              <Select
                value={form.level ?? "all"}
                onValueChange={(v) => set("level", v as SeminarLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="fee">Fee</Label>
              <Input
                id="fee"
                placeholder="e.g. $150, €80"
                value={form.fee}
                onChange={(e) => set("fee", e.target.value)}
              />
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="registrationUrl">Registration URL</Label>
              <Input
                id="registrationUrl"
                type="url"
                value={form.registrationUrl}
                onChange={(e) => set("registrationUrl", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
