import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function BackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
        else router.navigate({ to: "/" });
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" />
      {label}
    </button>
  );
}

export function PageHeader({
  title,
  subtitle,
  back = true,
  actions,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 space-y-3">
      {back && <BackButton />}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
