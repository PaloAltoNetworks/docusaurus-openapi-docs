/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
// @ts-ignore react-dom is a peer dependency without bundled types
import { createPortal } from "react-dom";

import { translate } from "@docusaurus/Translate";
import Request from "@theme/ApiExplorer/Request/Modern";
import Response from "@theme/ApiExplorer/Response/Modern";
import SecuritySchemes from "@theme/ApiExplorer/SecuritySchemes";
import { colorForMethod, renderPath } from "@theme/ApiExplorer/utils/endpoint";
import type { ApiItem } from "docusaurus-plugin-openapi-docs/src/types";

import { TRY_IT_EVENT } from "./events";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface Props {
  item: NonNullable<ApiItem>;
  infoPath: string;
}

function TryItDrawer({ item, infoPath }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onOpen = () => {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    window.addEventListener(TRY_IT_EVENT, onOpen);
    return () => window.removeEventListener(TRY_IT_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const isVisible = (el: HTMLElement) => el.offsetParent !== null;
    // The panel becomes focusable once its visibility transition settles, so
    // retry for a few frames instead of relying on a single attempt.
    let frame = 0;
    let attempts = 0;
    const focusFirstField = () => {
      const fields = Array.from(
        panel?.querySelectorAll<HTMLElement>("input, select, textarea") ?? []
      );
      const target =
        fields.find(isVisible) ??
        panel?.querySelector<HTMLElement>(".openapi-try-it__close");
      target?.focus({ preventScroll: true });
      if (!panel?.contains(document.activeElement) && attempts++ < 20) {
        frame = requestAnimationFrame(focusFirstField);
      }
    };
    frame = requestAnimationFrame(focusFirstField);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter(isVisible);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open, close]);

  return createPortal(
    <div
      className={
        open ? "openapi-try-it openapi-try-it--open" : "openapi-try-it"
      }
      aria-hidden={!open}
    >
      <div className="openapi-try-it__backdrop" onClick={close} />
      <div
        ref={panelRef}
        className="openapi-try-it__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="openapi-try-it__header">
          <span
            className={`badge badge--${colorForMethod(item.method) ?? "secondary"}`}
          >
            {item.method.toUpperCase()}
          </span>
          <h2 id={titleId} className="openapi-try-it__title">
            {renderPath(item.path)}
          </h2>
          <button
            type="button"
            className="openapi-try-it__close"
            onClick={close}
            aria-label={translate({
              id: "theme.openapi.tryIt.close",
              message: "Close",
            })}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
        </div>
        <div className="openapi-try-it__body">
          <SecuritySchemes infoPath={infoPath} />
          <Request item={item} />
          <Response item={item} />
        </div>
      </div>
    </div>,
    document.body
  );
}

export default TryItDrawer;
