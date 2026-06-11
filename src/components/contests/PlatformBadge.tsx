import { platformMeta, type PlatformKey } from "@/lib/platform-config";
import { cn } from "@/lib/utils";

export function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  const meta = (platformMeta as any)[platform] || platformMeta.leetcode;
  return (
    <div
      className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white", className)}
      style={{ backgroundColor: meta.color }}
    >
      {meta.initials}
    </div>
  );
}

export function PlatformBadge({ platform }: { platform: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground">
      <PlatformIcon platform={platform} className="h-4 w-4 text-[8px]" />
      {platform}
    </div>
  );
}
