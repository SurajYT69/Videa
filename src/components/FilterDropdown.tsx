"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
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
 * Keyboard: Enter/Space/ArrowDown opens, arrows and Home/End move, typing
 * jumps to the first match ("19" lands on 1999 in the year list), Enter picks,
 * Escape closes and returns focus to the pill. A click outside closes it.
 *
 * Focus never leaves the pill, so the pill is the combobox and carries
 * `aria-activedescendant`; on the listbox it would point at nothing, because
 * screen readers only follow it on the focused element.
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
  const typed = useRef({ text: "", at: 0 });
  /* Which edge the list hangs from. Flipped when it would leave the viewport. */
  const [side, setSide] = useState(align);
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

  /*
   * A pill that wrapped to the right of a 390px row would hang its 208px list
   * off-screen, and an off-screen box widens the document (see the Rail
   * gotcha). Measure before paint and hang it from the other edge instead.
   */
  useLayoutEffect(() => {
    if (!open || !list.current) return;
    /* Runs once per open, from `align`, so it cannot flip back and forth. */
    const box = list.current.getBoundingClientRect();
    if (align === "start" && box.right > window.innerWidth - 8) setSide("end");
    else if (align === "end" && box.left < 8) setSide("start");
  }, [open, align]);

  /* Keep the highlighted option in view inside the scrolling list. */
  useEffect(() => {
    if (!open) return;
    list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openList = () => {
    const first = options.findIndex((o) => selected.includes(o.value));
    setActive(first >= 0 ? first : 0);
    setSide(align);
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
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActive(event.key === "Home" ? 0 : options.length - 1);
    } else if (event.key.length === 1 && event.key !== " " && !event.metaKey && !event.ctrlKey) {
      /* Type-ahead: keys within 600ms build one prefix. */
      const now = Date.now();
      const text = (now - typed.current.at < 600 ? typed.current.text : "") + event.key.toLowerCase();
      typed.current = { text, at: now };
      const match = options.findIndex((o) => o.label.toLowerCase().startsWith(text));
      if (match >= 0) setActive(match);
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
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        aria-label={`${label}: ${chosen.length ? chosen.map((o) => o.label).join(", ") : placeholder}`}
        title={chosen.length > 1 ? chosen.map((o) => o.label).join(", ") : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        className={`inline-flex h-10 max-w-[min(16rem,calc(100vw-2.5rem))] items-center gap-2 rounded-full px-4 text-sm whitespace-nowrap transition-colors duration-200 ${
          on ? "bg-fg text-ink" : "glass text-fg-2 hover:bg-fg/10 hover:text-fg"
        }`}
      >
        <span className="min-w-0 truncate">
          {chosen.length > 1 ? chosen[0]!.label : summary}
        </span>
        {/* The count never truncates: it is the part that says how many. */}
        {chosen.length > 1 && (
          <span className="shrink-0 font-mono text-xs tabular-nums">+{chosen.length - 1}</span>
        )}
        <CaretDown
          className={`size-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
          tabIndex={-1}
          className={`glass-panel animate-drop absolute top-[calc(100%+8px)] z-30 max-h-[min(20rem,60svh)] w-max max-w-[calc(100vw-2.5rem)] min-w-52 overflow-y-auto overscroll-contain rounded-card p-1.5 shadow-lift ${
            side === "end" ? "right-0 origin-top-right" : "left-0 origin-top-left"
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
                  index === active ? "bg-fg/10 text-fg" : "text-fg-2"
                }`}
              >
                <span className="min-w-0">{option.label}</span>
                {/* Reserved in every row, so ticking one never shifts the column. */}
                <Check
                  className={`size-4 shrink-0 text-accent ${isOn ? "" : "invisible"}`}
                  aria-hidden="true"
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
