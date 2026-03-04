"use client";

import { Group, Panel, Separator } from "react-resizable-panels";
import { cn } from "@/lib/utils";

function ResizablePanelGroup({
  className,
  direction = "horizontal",
  ...props
}: Omit<React.ComponentProps<typeof Group>, "orientation"> & {
  direction?: "horizontal" | "vertical";
}) {
  return (
    <Group
      orientation={direction}
      className={cn(
        "flex h-full w-full",
        direction === "vertical" && "flex-col",
        className,
      )}
      {...props}
    />
  );
}

function ResizablePanel({
  className,
  defaultSize = "50%",
  minSize,
  ...props
}: React.ComponentProps<typeof Panel>) {
  return (
    <Panel
      defaultSize={defaultSize}
      minSize={minSize ?? "30%"}
      className={cn("overflow-hidden", className)}
      {...props}
    />
  );
}

function ResizableHandle({
  className,
  withHandle,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean;
}) {
  return (
    <Separator
      className={cn(
        "relative flex w-px shrink-0 cursor-col-resize touch-none items-center justify-center bg-border/60 transition-colors after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2 hover:bg-primary/25 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[separator=hover]:bg-primary/25 data-[separator=active]:bg-primary/45",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-6 w-3.5 items-center justify-center rounded-sm bg-muted-foreground/20 transition-colors hover:bg-muted-foreground/30">
          <svg
            width="6"
            height="14"
            viewBox="0 0 6 14"
            fill="none"
            className="text-muted-foreground/60"
          >
            <circle cx="1.5" cy="3" r="1" fill="currentColor" />
            <circle cx="4.5" cy="3" r="1" fill="currentColor" />
            <circle cx="1.5" cy="7" r="1" fill="currentColor" />
            <circle cx="4.5" cy="7" r="1" fill="currentColor" />
            <circle cx="1.5" cy="11" r="1" fill="currentColor" />
            <circle cx="4.5" cy="11" r="1" fill="currentColor" />
          </svg>
        </div>
      )}
    </Separator>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
