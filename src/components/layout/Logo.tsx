import { cn } from "@/lib/utils";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-glow">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
          <path
            d="M8 3v4M16 3v4M4 9h16M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
          <path d="m9 14 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {showText && (
        <span className="font-display text-[15px] font-semibold tracking-tight text-foreground">
          ContestSync
        </span>
      )}
    </div>
  );
}
