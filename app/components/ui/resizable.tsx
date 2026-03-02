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
      className={cn("flex h-full w-full", direction === "vertical" && "flex-col", className)}
      {...props}
    />
  );
}

function ResizablePanel({
  className,
  defaultSize = 50,
  minSize,
  ...props
}: React.ComponentProps<typeof Panel>) {
  return (
    <Panel
      defaultSize={defaultSize}
      minSize={minSize ?? 30}
      className={cn(className)}
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
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 [&[data-resize-handle-active]]:bg-primary/20",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <div className="h-4 w-1 rounded-full bg-muted-foreground/50" />
        </div>
      )}
    </Separator>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
