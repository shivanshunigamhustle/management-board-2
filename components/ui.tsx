import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import Link from "next/link";

export function Card({
  title,
  icon: Icon,
  action,
  children,
  className = "",
  padded = true,
}: {
  title?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${
        padded ? "p-5 sm:p-6" : ""
      } ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            {Icon && <Icon className="h-4 w-4 text-slate-400" strokeWidth={2} />}
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/15",
  LIVE: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/15 animate-pulse",
  COMPLETED: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10",
  ARCHIVED: "bg-slate-100 text-slate-400 ring-1 ring-inset ring-slate-500/10",
  OPEN: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/15",
  DONE: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15",
  PRESENT: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15",
  ABSENT: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/15",
  INVITED: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10",
  MEETING: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/15",
  CIRCULAR: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/15",
  ADMIN: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/15",
  MEMBER: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10",
};

export function Badge({ children, status, dot = false }: { children: React.ReactNode; status?: string; dot?: boolean }) {
  const style = status ? STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10" : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${style}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function EmptyState({ children, icon: Icon = Inbox }: { children: React.ReactNode; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-5 w-5 text-slate-400" strokeWidth={1.75} />
      </div>
      <p className="text-sm text-slate-400 max-w-xs">{children}</p>
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

function buttonClasses(variant: ButtonVariant, size: ButtonSize, className: string) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
  const sizes = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  };
  return `${base} ${sizes} ${variants[variant]} ${className}`;
}

/** Renders as a Next.js <Link> when `href` is given, otherwise a <button>. Never nests a <button> inside an <a>. */
export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  className = "",
  children,
  href,
  target,
  rel,
  ...props
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  const iconEl = Icon && <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2} />;

  if (href) {
    return (
      <Link href={href} target={target} rel={rel} className={buttonClasses(variant, size, className)}>
        {iconEl}
        {children}
      </Link>
    );
  }

  return (
    <button className={buttonClasses(variant, size, className)} {...props}>
      {iconEl}
      {children}
    </button>
  );
}

export function StatTile({
  label,
  value,
  icon: Icon,
  accent = "slate",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "slate" | "indigo" | "amber" | "emerald" | "red";
}) {
  const accents: Record<string, string> = {
    slate: "bg-slate-100 text-slate-600",
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accents[accent]}`}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-semibold text-slate-900 leading-tight tabular-nums">{value}</p>
        <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
