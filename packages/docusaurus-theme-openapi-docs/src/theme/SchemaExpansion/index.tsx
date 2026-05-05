/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { translate } from "@docusaurus/Translate";
import clsx from "clsx";

import { useSchemaExpansion } from "./context";

export {
  SchemaExpansionProvider,
  SchemaDepthProvider,
  useSchemaExpansion,
  useSchemaDepth,
  normalizeLevel,
  SCHEMA_EXPANSION_STORAGE_KEY,
} from "./context";

const ExpandIcon: React.FC = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="4 6 8 2 12 6" />
    <polyline points="4 10 8 14 12 10" />
  </svg>
);

const SchemaExpansionControl: React.FC = () => {
  const { config, level, setLevel } = useSchemaExpansion();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(
    null
  );
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current || typeof window === "undefined") return;
    const rect = buttonRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const handleScroll = () => setOpen(false);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const choose = useCallback(
    (next: number) => {
      setLevel(next);
      setOpen(false);
      buttonRef.current?.focus();
    },
    [setLevel]
  );

  if (!config.enabled) return null;

  const levels = Array.from({ length: config.max + 1 }, (_, i) => i);
  const buttonLabel = translate({
    id: "theme.openapi.schema.expansion.button",
    message: "Schema expansion depth",
    description: "Aria/title tooltip for the schema expansion icon button",
  });
  const allLabel = translate({
    id: "theme.openapi.schema.expansion.all",
    message: "All",
    description: "Label for the expand-all option",
  });

  return (
    <span className="openapi-schema-expansion">
      <button
        ref={buttonRef}
        type="button"
        className="openapi-schema-expansion__trigger"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={buttonLabel}
        title={buttonLabel}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <ExpandIcon />
      </button>
      {open && coords && (
        <div
          ref={popoverRef}
          role="menu"
          className="openapi-schema-expansion__popover"
          style={{ top: coords.top, right: coords.right }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          {levels.map((n) => (
            <button
              key={n}
              type="button"
              role="menuitemradio"
              aria-checked={level === n}
              className={clsx("openapi-schema-expansion__option", {
                "openapi-schema-expansion__option--active": level === n,
              })}
              onClick={() => choose(n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            role="menuitemradio"
            aria-checked={!Number.isFinite(level)}
            className={clsx("openapi-schema-expansion__option", {
              "openapi-schema-expansion__option--active":
                !Number.isFinite(level),
            })}
            onClick={() => choose(Infinity)}
          >
            {allLabel}
          </button>
        </div>
      )}
    </span>
  );
};

export default SchemaExpansionControl;
