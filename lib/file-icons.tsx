import { FileText, FileSpreadsheet, Presentation, File, type LucideIcon } from "lucide-react";

export const FILE_TYPE_META: Record<string, { icon: LucideIcon; className: string }> = {
  PDF: { icon: FileText, className: "bg-red-50 text-red-600" },
  DOC: { icon: FileText, className: "bg-blue-50 text-blue-600" },
  DOCX: { icon: FileText, className: "bg-blue-50 text-blue-600" },
  CSV: { icon: FileSpreadsheet, className: "bg-emerald-50 text-emerald-600" },
  XLS: { icon: FileSpreadsheet, className: "bg-emerald-50 text-emerald-600" },
  XLSX: { icon: FileSpreadsheet, className: "bg-emerald-50 text-emerald-600" },
  PPT: { icon: Presentation, className: "bg-amber-50 text-amber-600" },
  PPTX: { icon: Presentation, className: "bg-amber-50 text-amber-600" },
};

export function fileTypeMeta(fileType: string) {
  return FILE_TYPE_META[fileType] ?? { icon: File, className: "bg-slate-100 text-slate-500" };
}
