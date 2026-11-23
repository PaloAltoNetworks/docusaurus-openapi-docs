/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useEffect, useRef, useState } from "react";

import Head from "@docusaurus/Head";
import { translate } from "@docusaurus/Translate";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useIsBrowser from "@docusaurus/useIsBrowser";

export function toMarkdownUrl(permalink: string): string {
  const withoutTrailingSlash = permalink.replace(/\/+$/, "");
  return withoutTrailingSlash === ""
    ? "/index.md"
    : `${withoutTrailingSlash}.md`;
}

type CopyStatus = "idle" | "copied" | "error";

const iconProps = {
  "aria-hidden": true,
  focusable: false,
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const CopyIcon = () => (
  <svg {...iconProps}>
    <rect x="8" y="3" width="8" height="4" rx="1" />
    <path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
  </svg>
);

const CheckIcon = () => (
  <svg {...iconProps}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const MarkdownIcon = () => (
  <svg {...iconProps}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6M8 13h8M8 17h5" />
  </svg>
);

const DownloadIcon = () => (
  <svg {...iconProps}>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </svg>
);

const ChevronIcon = () => (
  <svg {...iconProps} className="openapi-page-actions__chevron">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

function MenuItem({
  icon,
  title,
  description,
  href,
  download,
  onSelect,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  download?: boolean;
  onSelect?: () => void;
}) {
  const content = (
    <>
      <span className="openapi-page-actions__item-icon">{icon}</span>
      <span className="openapi-page-actions__item-text">
        <span className="openapi-page-actions__item-title">{title}</span>
        <span className="openapi-page-actions__item-description">
          {description}
        </span>
      </span>
    </>
  );
  if (href) {
    return (
      <a
        className="openapi-page-actions__item"
        role="menuitem"
        href={href}
        onClick={onSelect}
        {...(download ? { download: "" } : {})}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      className="openapi-page-actions__item"
      role="menuitem"
      onClick={onSelect}
    >
      {content}
    </button>
  );
}

export default function MarkdownExport({
  permalink,
  downloadUrl,
}: {
  permalink: string;
  downloadUrl?: string;
}): React.JSX.Element {
  const href = toMarkdownUrl(permalink);
  const specHref = useBaseUrl(downloadUrl ?? "");
  const isBrowser = useIsBrowser();
  const [status, setStatus] = useState<CopyStatus>("idle");
  const menuRef = useRef<HTMLDetailsElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  useEffect(() => {
    const close = (event: Event) => {
      const menu = menuRef.current;
      if (!menu?.open) return;
      if (event instanceof KeyboardEvent) {
        if (event.key !== "Escape") return;
        menu.open = false;
        menu.querySelector("summary")?.focus();
        return;
      }
      if (!menu.contains(event.target as Node)) {
        menu.open = false;
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, []);

  const canCopy =
    isBrowser && typeof navigator !== "undefined" && !!navigator.clipboard;

  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
  };

  const copy = async () => {
    closeMenu();
    try {
      const response = await fetch(href);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      await navigator.clipboard.writeText(await response.text());
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setStatus("idle"), 2000);
  };

  const copyTitle =
    status === "copied"
      ? translate({
          id: "theme.openapi.markdownExport.copied",
          message: "Copied",
        })
      : status === "error"
        ? translate({
            id: "theme.openapi.markdownExport.copyFailed",
            message: "Copy failed",
          })
        : translate({
            id: "theme.openapi.markdownExport.copy",
            message: "Copy page",
          });

  return (
    <>
      <Head>
        <link rel="alternate" type="text/markdown" href={href} />
      </Head>
      <div className="openapi-page-actions">
        {canCopy && (
          <button
            type="button"
            className="openapi-page-actions__primary"
            onClick={copy}
            aria-live="polite"
          >
            {status === "copied" ? <CheckIcon /> : <CopyIcon />}
            <span>{copyTitle}</span>
          </button>
        )}
        <details className="openapi-page-actions__menu" ref={menuRef}>
          <summary
            className="openapi-page-actions__toggle"
            aria-label={translate({
              id: "theme.openapi.markdownExport.menu",
              message: "More page actions",
            })}
          >
            {!canCopy && (
              <>
                <MarkdownIcon />
                <span>
                  {translate({
                    id: "theme.openapi.markdownExport.menuLabel",
                    message: "Markdown",
                  })}
                </span>
              </>
            )}
            <ChevronIcon />
          </summary>
          <div className="openapi-page-actions__dropdown" role="menu">
            {canCopy && (
              <MenuItem
                icon={<CopyIcon />}
                title={translate({
                  id: "theme.openapi.markdownExport.copy",
                  message: "Copy page",
                })}
                description={translate({
                  id: "theme.openapi.markdownExport.copyDescription",
                  message: "Copy page as Markdown for LLMs",
                })}
                onSelect={copy}
              />
            )}
            <MenuItem
              icon={<MarkdownIcon />}
              title={translate({
                id: "theme.openapi.markdownExport.view",
                message: "View as Markdown",
              })}
              description={translate({
                id: "theme.openapi.markdownExport.viewDescription",
                message: "View this page as plain text",
              })}
              href={href}
              onSelect={closeMenu}
            />
            {downloadUrl && (
              <MenuItem
                icon={<DownloadIcon />}
                title={translate({
                  id: "theme.openapi.markdownExport.download",
                  message: "Download API spec",
                })}
                description={translate({
                  id: "theme.openapi.markdownExport.downloadDescription",
                  message: "Download the OpenAPI specification",
                })}
                href={specHref}
                download
                onSelect={closeMenu}
              />
            )}
          </div>
        </details>
      </div>
    </>
  );
}
