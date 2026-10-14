import {
  ShieldCheck,
  Flame,
  Trash2,
  Pill,
  Syringe,
  Building2,
  Factory,
  FileText,
} from "lucide-react";

// Maps a compliance category id to a representative icon — purely cosmetic.
const CATEGORY_ICONS = {
  mhe: ShieldCheck,
  fire: Flame,
  bmw: Trash2,
  drug: Pill,
  ndps: Syringe,
  se: Building2,
  cto: Factory,
  lease: FileText,
};

export const getCategoryIcon = (categoryId) => CATEGORY_ICONS[categoryId] || FileText;

export const GROUP_COLORS = {
  "Statutory registration": { bg: "#EAF1FB", fg: "#1F4E8C" },
  "Safety & environment": { bg: "#FDEFE0", fg: "#9A5B10" },
  Pharmacy: { bg: "#F1E9FB", fg: "#5A3E8F" },
  "Premises & insurance": { bg: "#E6F3EC", fg: "#1D6B4A" },
};
