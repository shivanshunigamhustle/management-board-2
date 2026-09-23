"use client";

import { useState } from "react";
import { X, ShieldAlert, ExternalLink } from "lucide-react";

export function DocumentViewerModal({
  fileName,
  fileUrl,
  restricted,
  viewerName,
}: {
  fileName: string;
  fileUrl: string;
  restricted: boolean;
  viewerName: string;
}) {
  const [open, setOpen] = useState(false);
  const stamp = `${viewerName} · CONFIDENTIAL · ${new Date().toLocaleString()}`;

  return (
    <>
      <button onClick={() => setOpen(true)} className="block w-full truncate text-sm font-medium text-slate-900 hover:text-indigo-700 transition-colors text-left">
        {fileName}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade">
          <div className="relative flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                {restricted && <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500" strokeWidth={2} />}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{fileName}</p>
                  {restricted && (
                    <p className="text-[11px] text-amber-600">
                      Copy &amp; download disabled — viewer identity watermarked
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close document preview"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div
              className="relative flex-1 overflow-hidden bg-slate-100"
              onContextMenu={restricted ? (e) => e.preventDefault() : undefined}
              style={restricted ? { userSelect: "none" } : undefined}
            >
              <iframe src={fileUrl} title={fileName} className="h-full w-full border-0" />

              {restricted && (
                <div
                  className="pointer-events-none absolute inset-0 flex flex-wrap content-around justify-around overflow-hidden opacity-[0.15]"
                  aria-hidden
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <span
                      key={i}
                      className="whitespace-nowrap text-xs font-semibold text-slate-900"
                      style={{ transform: "rotate(-30deg)" }}
                    >
                      {stamp}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
              <p className="text-[11px] text-slate-400">
                {restricted
                  ? "Download / print / copy restricted for this document"
                  : "This document is not access-restricted"}
              </p>
              {!restricted && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Open in new tab <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
