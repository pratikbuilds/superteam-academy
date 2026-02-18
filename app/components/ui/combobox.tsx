"use client";

import * as React from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { InputGroupButton } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

type ComboboxContextValue<T> = {
  items: readonly T[];
  itemToStringValue: (item: T) => string;
  open: boolean;
  setOpen: (open: boolean) => void;
  value: T | null;
  setValue: (value: T | null) => void;
};

const ComboboxContext = React.createContext<
  ComboboxContextValue<unknown> | null
>(null);

function useComboboxContext<T>() {
  const ctx = React.useContext(ComboboxContext);
  if (!ctx) throw new Error("Combobox components must be used within Combobox");
  return ctx as ComboboxContextValue<T>;
}

function Combobox<T>({
  items,
  itemToStringValue = (x) => String(x),
  children,
}: {
  items: readonly T[];
  itemToStringValue?: (item: T) => string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<T | null>(null);
  const ctx = React.useMemo<ComboboxContextValue<T>>(
    () => ({
      items,
      itemToStringValue,
      open,
      setOpen,
      value,
      setValue,
    }),
    [items, itemToStringValue, open, value]
  );
  return (
    <ComboboxContext.Provider value={ctx as ComboboxContextValue<unknown>}>
      <Popover open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border-0 shadow-none">
          {children}
        </Command>
      </Popover>
    </ComboboxContext.Provider>
  );
}

function ComboboxInput({
  className,
  id,
  placeholder,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange"> & {
  showTrigger?: boolean;
  showClear?: boolean;
}) {
  const { value, itemToStringValue, setOpen } =
    useComboboxContext<unknown>();
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!value) setSearch("");
    else setSearch(itemToStringValue(value));
  }, [value, itemToStringValue]);

  return (
    <PopoverAnchor asChild>
      <div
        className={cn("w-auto min-w-40", className)}
        onFocus={() => setOpen(true)}
      >
        <CommandInput
          value={search}
          onValueChange={(v: string) => setSearch(v)}
          placeholder={placeholder}
          disabled={disabled}
          id={id}
          {...props}
        />
      </div>
    </PopoverAnchor>
  );
}

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  return (
    <PopoverContent
      align={align}
      side={side}
      sideOffset={sideOffset}
      className={cn("w-(--radix-popover-trigger-width) p-0", className)}
      {...props}
    />
  );
}

function ComboboxList<T>({
  children,
  className,
}: {
  children: (item: T) => React.ReactNode;
  className?: string;
}) {
  const { items, itemToStringValue, setValue, setOpen } =
    useComboboxContext<T>();

  return (
    <CommandList className={cn("max-h-72 p-1", className)}>
      <CommandGroup>
        {items.map((item) => (
          <CommandItem
            key={itemToStringValue(item)}
            value={itemToStringValue(item)}
            onSelect={() => {
              setValue(item);
              setOpen(false);
            }}
          >
            {children(item)}
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  );
}

function ComboboxEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandEmpty>) {
  return (
    <CommandEmpty
      className={cn("py-6 text-center text-sm", className)}
      {...props}
    />
  );
}

function ComboboxItem({
  className,
  children,
  value: _value,
  ...props
}: Omit<React.ComponentProps<typeof CommandItem>, "onSelect" | "value"> & {
  value?: unknown;
}) {
  return (
    <span
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 select-none",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

function ComboboxGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandGroup>) {
  return <CommandGroup className={className} {...props} />;
}

function ComboboxLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  );
}

function ComboboxCollection({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function ComboboxSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("bg-border -mx-1 my-1 h-px", className)} {...props} />
  );
}

function ComboboxTrigger({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <InputGroupButton
      size="icon-xs"
      variant="ghost"
      className={cn(className)}
      {...props}
    >
      <CaretDownIcon className="text-muted-foreground size-4 pointer-events-none" />
    </InputGroupButton>
  );
}

function ComboboxValue({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { value, itemToStringValue } = useComboboxContext<unknown>();
  return (
    <span className={className} {...props}>
      {children ?? (value != null ? itemToStringValue(value) : null)}
    </span>
  );
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

function ComboboxChips({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-h-8 flex-wrap items-center gap-1 rounded-lg border px-2.5 py-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: React.ComponentProps<"div"> & { showRemove?: boolean }) {
  return (
    <div
      className={cn(
        "bg-muted text-foreground flex h-5 items-center gap-1 rounded-sm px-1.5 text-xs font-medium",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ComboboxChipsInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "min-w-16 flex-1 outline-none bg-transparent",
        className
      )}
      {...props}
    />
  );
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};
