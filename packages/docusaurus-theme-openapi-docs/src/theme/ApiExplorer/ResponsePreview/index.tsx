/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useId, useMemo, useState } from "react";

import { translate } from "@docusaurus/Translate";
import { statusTone } from "@theme/ApiExplorer/utils/endpoint";
import CodeBlock from "@theme/CodeBlock";
import { json2xml } from "@theme/ResponseExamples";
import { serializeExampleFields } from "@theme/ResponseExamples/serializeExample";
import clsx from "clsx";
import { sampleResponseFromSchema } from "docusaurus-plugin-openapi-docs/lib/openapi/createResponseExample";
import format from "xml-formatter";

interface PreviewEntry {
  code: string;
  description?: string;
  mimeType?: string;
  example?: string;
}

function pickMimeType(content: Record<string, any>): string | undefined {
  const types = Object.keys(content);
  return (
    types.find((t) => t.includes("json")) ??
    types.find((t) => t.includes("xml")) ??
    types[0]
  );
}

function toXml(value: any): string {
  try {
    return format(json2xml(value, ""), {
      indentation: "  ",
      lineSeparator: "\n",
      collapseContent: true,
    });
  } catch {
    return json2xml({ root: value }, "");
  }
}

function serialize(value: any, mimeType: string): string {
  if (typeof value === "string") return value;
  if (mimeType.includes("xml") && typeof value === "object") {
    return toXml(value);
  }
  return JSON.stringify(value, null, 2);
}

function buildEntry(code: string, response: any): PreviewEntry {
  const content = response?.content ?? {};
  const mimeType = pickMimeType(content);
  const entry: PreviewEntry = {
    code,
    description: response?.description?.split("\n")[0],
    mimeType,
  };
  if (!mimeType) return entry;

  const media = content[mimeType] ?? {};
  let value = media.example;
  let serialized: string | undefined;
  if (value === undefined && media.examples) {
    const first = Object.values(media.examples)[0] as any;
    serialized = serializeExampleFields(first, mimeType, media.schema);
    value = first?.value;
  }
  if (value === undefined && media.schema) {
    try {
      value = sampleResponseFromSchema(media.schema);
    } catch {
      value = undefined;
    }
  }
  if (serialized !== undefined) {
    entry.example = serialized;
  } else if (value !== undefined) {
    entry.example = serialize(value, mimeType);
  }
  return entry;
}

export interface Props {
  responses?: Record<string, any>;
}

function ResponsePreview({ responses }: Props) {
  const entries = useMemo(
    () =>
      Object.entries(responses ?? {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([code, response]) => buildEntry(code, response)),
    [responses]
  );
  const [selected, setSelected] = useState(0);
  const baseId = useId();

  if (entries.length === 0) return null;

  const current = entries[Math.min(selected, entries.length - 1)];
  const language = current.mimeType?.includes("xml") ? "xml" : "json";

  return (
    <div className="openapi-response-preview">
      <div className="openapi-response-preview__header">
        <span className="openapi-response-preview__title">
          {translate({
            id: "theme.openapi.responsePreview.title",
            message: "Response",
          })}
        </span>
        <div
          className="openapi-response-preview__tabs"
          role="tablist"
          aria-label={translate({
            id: "theme.openapi.responsePreview.statusCodes",
            message: "Status codes",
          })}
        >
          {entries.map((entry, i) => (
            <button
              key={entry.code}
              type="button"
              role="tab"
              id={`${baseId}-tab-${i}`}
              aria-selected={i === selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={i === selected ? 0 : -1}
              className={clsx(
                "openapi-response-preview__tab",
                `openapi-response-preview__tab--${statusTone(entry.code)}`,
                { "openapi-response-preview__tab--active": i === selected }
              )}
              onClick={() => setSelected(i)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                e.preventDefault();
                const next =
                  (i + (e.key === "ArrowRight" ? 1 : -1) + entries.length) %
                  entries.length;
                setSelected(next);
                document.getElementById(`${baseId}-tab-${next}`)?.focus();
              }}
            >
              {entry.code}
            </button>
          ))}
        </div>
      </div>
      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${selected}`}
        className="openapi-response-preview__body"
      >
        {current.description && (
          <p className="openapi-response-preview__description">
            {current.description}
          </p>
        )}
        {current.example ? (
          <CodeBlock
            language={language}
            title={current.mimeType}
            className="openapi-response-preview__code"
          >
            {current.example}
          </CodeBlock>
        ) : (
          <p className="openapi-response-preview__empty">
            {translate({
              id: "theme.openapi.responsePreview.noBody",
              message: "No response body",
            })}
          </p>
        )}
      </div>
    </div>
  );
}

export default ResponsePreview;
