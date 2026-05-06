/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { translate } from "@docusaurus/Translate";
import { OPENAPI_SCHEMA_EXPANSION } from "@theme/translationIds";
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

const ALL_VALUE = Number.POSITIVE_INFINITY;

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
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const popoverId = useId();

  const options = useMemo(() => {
    const numbers = Array.from({ length: config.max + 1 }, (_, i) => i);
    return [...numbers, ALL_VALUE];
  }, [config.max]);

  const activeIndex = useMemo(() => {
    const idx = options.indexOf(level);
    return idx >= 0 ? idx : 0;
  }, [options, level]);

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
    optionRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

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
        event.stopPropagation();
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

  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const current = optionRefs.current.findIndex(
      (el) => el === document.activeElement
    );
    if (current < 0) return;
    const next =
      event.key === "ArrowRight"
        ? (current + 1) % options.length
        : (current - 1 + options.length) % options.length;
    optionRefs.current[next]?.focus();
  };

  if (!config.enabled) return null;

  const buttonLabel = translate({
    id: OPENAPI_SCHEMA_EXPANSION.BUTTON_LABEL,
    message: "Schema expansion depth",
    description: "Aria/title tooltip for the schema expansion icon button",
  });
  const menuLabel = translate({
    id: OPENAPI_SCHEMA_EXPANSION.MENU_LABEL,
    message: "Schema expansion depth options",
    description: "Accessible label for the expansion options menu",
  });
  const allLabel = translate({
    id: OPENAPI_SCHEMA_EXPANSION.ALL,
    message: "All",
    description: "Label for the expand-all option",
  });

  return (
    <span className="openapi-schema-expansion">
      <button
        ref={buttonRef}
        type="button"
        className="openapi-schema-expansion__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
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
          id={popoverId}
          role="menu"
          aria-label={menuLabel}
          className="openapi-schema-expansion__popover"
          style={{ top: coords.top, right: coords.right }}
          onKeyDown={onMenuKeyDown}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          {options.map((value, index) => {
            const isAll = value === ALL_VALUE;
            const label = isAll ? allLabel : String(value);
            const optionAriaLabel = isAll
              ? allLabel
              : translate(
                  {
                    id: OPENAPI_SCHEMA_EXPANSION.DEPTH_OPTION,
                    message: "Expand to depth {depth}",
                    description: "Accessible label for a depth option",
                  },
                  { depth: value }
                );
            const isActive = level === value;
            return (
              <button
                key={isAll ? "all" : value}
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                aria-label={optionAriaLabel}
                tabIndex={index === activeIndex ? 0 : -1}
                className={clsx("openapi-schema-expansion__option", {
                  "openapi-schema-expansion__option--active": isActive,
                })}
                onClick={() => choose(value)}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </span>
  );
};

export default SchemaExpansionControl;
