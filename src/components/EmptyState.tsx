import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon, title, description, action,
}: { icon: ReactNode; title: string; description: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="relative">
        <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-2xl" />
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-white shadow-glow">
          {icon}
        </div>
      </div>
      <div className="mt-5 text-base font-semibold">{title}</div>
      <div className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</div>
      {action && (
        <Button onClick={action.onClick} className="mt-5 gradient-primary text-white shadow-glow hover:opacity-90">
          {action.label}
        </Button>
      )}
    </div>
  );
}
