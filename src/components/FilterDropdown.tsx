"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CaretDown, Check } from "@phosphor-icons/react";

export type FilterOption = { value: string; label: string };

type Props = {
  /** Shown on the pill when nothing is chosen, e.g. "Any year". */
  placeholder: string;
  /** Accessible name of the list, e.g. "Release year". */
  label: string;
  options: readonly FilterOption[];
  /** One value, or several when `multiple`. Empty means "any". */
  selected: string[];
  multiple?: boolean;
  onChange: (values: string[]) => void;
  align?: "start" | "end";
};

/**
 * A glass pill that opens a list. Replaces the native <select>, which cannot
 * be styled to match the rest of the page and cannot do multi-select well.
 *
 * Keyboard: Enter/Space/ArrowDown opens, arrows move, Enter picks, Escape
 * closes and returns focus to the pill. A click outside closes it.
 */
export function FilterDropdown({
  placeholder,
  label,
  options,
  selected,
  multiple = false,
  onChange,
  align = "start",
}: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();

  const chosen = options.filter((o) => selected.includes(o.value));
  const summary =
    chosen.length === 0
      ? placeholder
      : chosen.length === 1
        ? chosen[0]!.label
        : `${chosen[0]!.label} +${chosen.length - 1}`;

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  /* Keep the highlighted option in view inside the scrolling list. */
  useEffect(() => {
    if (!open) return;
    list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openList = () => {
    const first = options.findIndex((o) => selected.includes(o.value));
    setActive(first >= 0 ? first : 0);
    setOpen(true);
  };

  const pick = (value: string) => {
    if (multiple) {
      onChange(
        selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value],
      );
    } else {
      onChange(selected.includes(value) ? [] : [value]);
      setOpen(false);
      button.current?.focus();
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (["Enter", " ", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      button.current?.focus();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[active];
      if (option) pick(option.value);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  const on = chosen.length > 0;

  return (
    <div ref={root} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`${label}: ${summary}`}
        onClick={() => (open ? setOpen(false) : openList())}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors duration-200 ${
          on ? "bg-fg text-ink" : "glass text-fg-2 hover:bg-white/15 hover:text-fg"
        }`}
      >
        {summary}
        <CaretDown
          className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          ref={list}
          id={id}
          role="listbox"
          aria-label={label}
          aria-multiselectable={multiple || undefined}
          aria-activedescendant={`${id}-${active}`}
          tabIndex={-1}
          className={`glass-panel animate-drop absolute top-[calc(100%+8px)] z-30 max-h-80 min-w-52 overflow-y-auto rounded-card p-1.5 shadow-lift ${
            align === "end" ? "right-0" : "left-0"
          }`}
        >
          {options.map((option, index) => {
            const isOn = selected.includes(option.value);
            return (
              <li
                key={option.value}
                id={`${id}-${index}`}
                role="option"
                aria-selected={isOn}
                onPointerEnter={() => setActive(index)}
                onClick={() => pick(option.value)}
                className={`flex cursor-pointer items-center justify-between gap-6 rounded-mini px-3 py-2 text-sm ${
                  index === active ? "bg-white/10 text-fg" : "text-fg-2"
                }`}
              >
                {option.label}
                {isOn && <Check className="size-4 text-accent" aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
