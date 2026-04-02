/* ============================================================================
 * PalettePicker — runtime color palette switcher for the navbar.
 *
 * Desktop: pill button in the top bar that opens a dropdown.
 * Mobile:  section rendered inside the hamburger drawer (mobile={true}).
 *
 * Dynamically injects /themes/<id>.css into <head> and persists
 * the choice in localStorage under 'openapi-demo-palette'.
 * ========================================================================== */

import React, { useEffect, useRef, useState } from "react";

import styles from "./styles.module.css";

const THEMES = [
  { id: "evergreen", label: "Evergreen", color: "#2e8555" },
  { id: "panw", label: "PANW", color: "#004c9d" },
  { id: "violet", label: "Violet", color: "#7c3aed" },
  { id: "midnight", label: "Midnight", color: "#0284c7" },
  { id: "indigo", label: "Indigo", color: "#6366f1" },
  { id: "nord", label: "Nord", color: "#5e81ac" },
  { id: "cyber", label: "Cyber", color: "#059669" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

const STORAGE_KEY = "openapi-demo-palette";
const DEFAULT_PALETTE: ThemeId = "evergreen";

function applyPalette(id: ThemeId): void {
  let link = document.getElementById(
    "openapi-palette-link"
  ) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = "openapi-palette-link";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  link.href = `/themes/${id}.css`;
  localStorage.setItem(STORAGE_KEY, id);
}

function MobileSection({
  active,
  onSelect,
  current,
}: {
  active: ThemeId;
  onSelect: (id: ThemeId) => void;
  current: (typeof THEMES)[number];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.mobileRoot}>
      <button
        className={styles.mobileToggle}
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span className={styles.mobileToggleLeft}>
          <span
            className={styles.mobileSwatch}
            style={{ background: current.color }}
          />
          <span>Color Palette</span>
        </span>
        <svg
          className={`${styles.mobileChevron} ${expanded ? styles.mobileChevronOpen : ""}`}
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {expanded && (
        <div className={styles.mobileGrid}>
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              className={`${styles.mobileTile} ${theme.id === active ? styles.mobileTileActive : ""}`}
              onClick={() => onSelect(theme.id)}
              aria-pressed={theme.id === active}
            >
              <span
                className={styles.mobileSwatch}
                style={{ background: theme.color }}
              />
              <span>{theme.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PalettePicker({
  mobile,
}: {
  mobile?: boolean;
}): JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ThemeId>(DEFAULT_PALETTE);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved =
      (localStorage.getItem(STORAGE_KEY) as ThemeId) ?? DEFAULT_PALETTE;
    setActive(saved);
    if (!document.getElementById("openapi-palette-link")) {
      applyPalette(saved);
    }
  }, []);

  // Close dropdown on outside pointer-down (desktop only)
  useEffect(() => {
    if (mobile) return;
    function onPointerDown(e: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [mobile]);

  useEffect(() => {
    if (mobile) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobile]);

  function select(id: ThemeId) {
    setActive(id);
    applyPalette(id);
    setOpen(false);
  }

  const current = THEMES.find((t) => t.id === active) ?? THEMES[0];

  /* ---- Mobile drawer ---------------------------------------------------- */
  if (mobile) {
    return (
      <MobileSection active={active} onSelect={select} current={current} />
    );
  }

  /* ---- Desktop dropdown ------------------------------------------------- */
  return (
    <div ref={containerRef} className={styles.root}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Color palette: ${current.label}`}
      >
        <span
          className={styles.swatch}
          style={{ background: current.color }}
          aria-hidden="true"
        />
        <span className={styles.triggerLabel}>{current.label}</span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className={styles.dropdown}
          role="listbox"
          aria-label="Select color palette"
        >
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              role="option"
              aria-selected={theme.id === active}
              className={`${styles.option} ${theme.id === active ? styles.optionActive : ""}`}
              onClick={() => select(theme.id)}
            >
              <span
                className={styles.swatch}
                style={{ background: theme.color }}
                aria-hidden="true"
              />
              {theme.label}
              {theme.id === active && (
                <svg
                  className={styles.check}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
