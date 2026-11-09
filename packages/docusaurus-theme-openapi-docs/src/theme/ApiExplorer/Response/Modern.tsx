/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useEffect, useId, useState } from "react";

import { useDoc } from "@docusaurus/plugin-content-docs/client";
import { usePrismTheme } from "@docusaurus/theme-common";
import Translate, { translate } from "@docusaurus/Translate";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import ApiCodeBlock from "@theme/ApiExplorer/ApiCodeBlock";
import { statusTone } from "@theme/ApiExplorer/utils/endpoint";
import { useTypedDispatch, useTypedSelector } from "@theme/ApiItem/hooks";
import SchemaTabs from "@theme/SchemaTabs";
import TabItem from "@theme/TabItem";
import clsx from "clsx";
import type { ApiItem } from "docusaurus-plugin-openapi-docs/src/types";
import type { ThemeConfig } from "docusaurus-theme-openapi-docs/src/types";

import { clearHistory, historyKey, HistoryEntry, useHistory } from "./history";
import {
  clearResponse,
  clearCode,
  clearHeaders,
  setCode,
  setHeaders,
  setMetrics,
  setResponse,
  setStatus,
} from "./slice";

// Pretty-print a JSON string by re-indenting structural tokens only.
// Numbers pass through verbatim, so values beyond Number.MAX_SAFE_INTEGER
// (e.g. 19-digit IDs) keep their exact digits. Issue #1208.
function prettyPrintJson(raw: string, indent = 2): string {
  const pad = " ".repeat(indent);
  let out = "";
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];

    if (inString) {
      out += ch;
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") continue;

    if (ch === '"') {
      out += ch;
      inString = true;
    } else if (ch === "{" || ch === "[") {
      let j = i + 1;
      while (j < raw.length && /\s/.test(raw[j])) j++;
      if (raw[j] === "}" || raw[j] === "]") {
        out += ch + raw[j];
        i = j;
      } else {
        depth++;
        out += ch + "\n" + pad.repeat(depth);
      }
    } else if (ch === "}" || ch === "]") {
      depth--;
      out += "\n" + pad.repeat(depth) + ch;
    } else if (ch === ",") {
      out += ",\n" + pad.repeat(depth);
    } else if (ch === ":") {
      out += ": ";
    } else {
      out += ch;
    }
  }

  return out;
}

// TODO: We probably shouldn't attempt to format XML...
function formatXml(xml: string) {
  const tab = "  ";
  let formatted = "";
  let indent = "";

  xml.split(/>\s*</).forEach((node) => {
    if (node.match(/^\/\w/)) {
      // decrease indent by one 'tab'
      indent = indent.substring(tab.length);
    }
    formatted += indent + "<" + node + ">\r\n";
    if (node.match(/^<?\w[^>]*[^/]$/)) {
      // increase indent
      indent += tab;
    }
  });
  return formatted.substring(1, formatted.length - 3);
}

const STATUS_TEXT: Record<number, string> = {
  200: "OK",
  201: "Created",
  202: "Accepted",
  204: "No Content",
  301: "Moved Permanently",
  302: "Found",
  304: "Not Modified",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  409: "Conflict",
  422: "Unprocessable Content",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

function formatDuration(ms?: number) {
  if (ms === undefined) return undefined;
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`;
}

function formatSize(bytes?: number) {
  if (bytes === undefined) return undefined;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatAge(timestamp: number, now: number) {
  const seconds = Math.round((timestamp - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (Math.abs(seconds) < 60) return rtf.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  return rtf.format(Math.round(minutes / 60), "hour");
}

function Response({ item }: { item: ApiItem }) {
  const metadata = useDoc();
  const { siteConfig } = useDocusaurusContext();
  const themeConfig = siteConfig.themeConfig as ThemeConfig;
  const hideSendButton = metadata.frontMatter.hide_send_button;
  const proxy = metadata.frontMatter.proxy ?? themeConfig.api?.proxy;
  const prismTheme = usePrismTheme();
  const code = useTypedSelector((state: any) => state.response.code);
  const headers = useTypedSelector((state: any) => state.response.headers);
  const response = useTypedSelector((state: any) => state.response.value);
  const status = useTypedSelector((state: any) => state.response.status);
  const duration = useTypedSelector((state: any) => state.response.duration);
  const size = useTypedSelector((state: any) => state.response.size);
  const dispatch = useTypedDispatch();
  const numericCode = code ? parseInt(code) : undefined;
  const tone = numericCode !== undefined ? statusTone(numericCode) : undefined;
  const isLoading = status === "loading";
  const isError = status === "error";
  const endpointKey = historyKey(metadata.metadata?.id, item.method, item.path);
  const history = useHistory(endpointKey);
  const historyLabelId = useId();
  const latestId = history[0]?.id;
  const [selectedId, setSelectedId] = useState<number | undefined>(latestId);

  useEffect(() => {
    setSelectedId(latestId);
  }, [latestId]);

  const restore = (entry: HistoryEntry) => {
    dispatch(setResponse(entry.value ?? ""));
    if (entry.code) {
      dispatch(setCode(entry.code));
    } else {
      dispatch(clearCode());
    }
    if (entry.headers) {
      dispatch(setHeaders(entry.headers));
    } else {
      dispatch(clearHeaders());
    }
    dispatch(setMetrics({ duration: entry.duration, size: entry.size }));
    dispatch(setStatus(entry.status));
    setSelectedId(entry.id);
  };

  if ((!item.servers && !proxy) || hideSendButton) {
    return null;
  }

  let prettyResponse: string = response;

  if (prettyResponse) {
    try {
      JSON.parse(response);
      prettyResponse = prettyPrintJson(response);
    } catch {
      if (response.startsWith("<")) {
        prettyResponse = formatXml(response);
      }
    }
  }

  const placeholder = (
    <p className="openapi-explorer__response-placeholder-message">
      <Translate
        id={"theme.openapi.response.placeholder"}
        values={{
          code: (
            <code>
              <Translate id={"theme.openapi.request.sendButton"}>
                Send API Request
              </Translate>
            </code>
          ),
        }}
      >
        {"Click the {code} button above and see the response here!"}
      </Translate>
    </p>
  );

  const hasResult = !isLoading && !isError && code;
  const language = response?.startsWith("<") ? `xml` : `json`;

  return (
    <div
      className={clsx("openapi-explorer__response-container", {
        "openapi-explorer__response-container--error": isError,
      })}
    >
      <div className="openapi-explorer__response-title-container">
        <span className="openapi-explorer__response-title">
          {translate({
            id: "theme.openapi.response.title",
            message: "Response",
          })}
        </span>
        <button
          type="button"
          className="openapi-explorer__response-clear-btn"
          disabled={isLoading}
          onClick={() => {
            dispatch(clearResponse());
            dispatch(clearCode());
            dispatch(clearHeaders());
            setSelectedId(undefined);
          }}
        >
          {translate({ id: "theme.openapi.response.clear", message: "Clear" })}
        </button>
      </div>
      <div aria-live="polite" aria-busy={isLoading}>
        {hasResult && (
          <div
            className={clsx(
              "openapi-explorer__response-status-bar",
              `openapi-explorer__response-status-bar--${tone}`
            )}
          >
            <span
              className={clsx(
                "openapi-explorer__response-status-badge",
                `openapi-explorer__response-status-badge--${tone}`
              )}
            >
              {code}
              {numericCode !== undefined && STATUS_TEXT[numericCode]
                ? ` ${STATUS_TEXT[numericCode]}`
                : ""}
            </span>
            <span className="openapi-explorer__response-metrics">
              {formatDuration(duration) && (
                <span
                  title={translate({
                    id: "theme.openapi.response.duration",
                    message: "Response time",
                  })}
                >
                  {formatDuration(duration)}
                </span>
              )}
              {formatSize(size) && (
                <span
                  title={translate({
                    id: "theme.openapi.response.size",
                    message: "Response size",
                  })}
                >
                  {formatSize(size)}
                </span>
              )}
            </span>
          </div>
        )}
        <div
          className="openapi-explorer__response-body"
          style={{
            backgroundColor: hasResult
              ? prismTheme.plain.backgroundColor
              : "transparent",
          }}
        >
          {hasResult ? (
            <SchemaTabs lazy>
              {/* @ts-ignore */}
              <TabItem
                label={translate({
                  id: "theme.openapi.response.bodyTab",
                  message: "Body",
                })}
                value="body"
                default
              >
                {/* @ts-ignore */}
                <ApiCodeBlock
                  className="openapi-explorer__code-block openapi-response__status-code"
                  language={language}
                >
                  {prettyResponse || placeholder}
                </ApiCodeBlock>
              </TabItem>
              {/* @ts-ignore */}
              <TabItem
                label={translate({
                  id: "theme.openapi.response.headersTab",
                  message: "Headers",
                })}
                value="headers"
              >
                {/* @ts-ignore */}
                <ApiCodeBlock
                  className="openapi-explorer__code-block openapi-response__status-headers"
                  language="json"
                >
                  {JSON.stringify(headers, undefined, 2)}
                </ApiCodeBlock>
              </TabItem>
            </SchemaTabs>
          ) : isLoading ? (
            <div className="openapi-explorer__loading-container">
              <div className="openapi-response__lds-ring" aria-hidden="true">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <span className="openapi-explorer__sr-only">
                {translate({
                  id: "theme.openapi.request.fetchingMessage",
                  message: "Fetching...",
                })}
              </span>
            </div>
          ) : isError ? (
            <div className="openapi-explorer__response-error" role="alert">
              <strong className="openapi-explorer__response-error-title">
                {translate({
                  id: "theme.openapi.response.errorTitle",
                  message: "Request failed",
                })}
                {formatDuration(duration) && (
                  <span className="openapi-explorer__response-metrics">
                    {formatDuration(duration)}
                  </span>
                )}
              </strong>
              <p>{response}</p>
            </div>
          ) : (
            placeholder
          )}
        </div>
      </div>
      {history.length > 0 && (
        <div className="openapi-explorer__history">
          <div className="openapi-explorer__history-header">
            <span id={historyLabelId}>
              {translate({
                id: "theme.openapi.response.historyTitle",
                message: "Recent requests",
              })}
            </span>
            <button
              type="button"
              className="openapi-explorer__response-clear-btn"
              disabled={isLoading}
              onClick={() => clearHistory(endpointKey)}
            >
              {translate({
                id: "theme.openapi.response.clearHistory",
                message: "Clear history",
              })}
            </button>
          </div>
          <ul
            className="openapi-explorer__history-list"
            aria-labelledby={historyLabelId}
          >
            {history.map((entry) => {
              const entryCode = entry.code ? parseInt(entry.code) : undefined;
              const entryTone =
                entryCode !== undefined ? statusTone(entryCode) : "danger";
              const now = Date.now();
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={clsx("openapi-explorer__history-item", {
                      "openapi-explorer__history-item--active":
                        entry.id === selectedId,
                    })}
                    aria-pressed={entry.id === selectedId}
                    disabled={isLoading}
                    onClick={() => restore(entry)}
                  >
                    <span
                      className={clsx(
                        "openapi-explorer__response-status-badge",
                        `openapi-explorer__response-status-badge--${entryTone}`
                      )}
                    >
                      {entry.code ??
                        translate({
                          id: "theme.openapi.response.historyError",
                          message: "Error",
                        })}
                    </span>
                    <span className="openapi-explorer__response-metrics">
                      {formatDuration(entry.duration) && (
                        <span>{formatDuration(entry.duration)}</span>
                      )}
                      {formatSize(entry.size) && (
                        <span>{formatSize(entry.size)}</span>
                      )}
                    </span>
                    <time
                      className="openapi-explorer__history-time"
                      dateTime={new Date(entry.timestamp).toISOString()}
                      title={new Date(entry.timestamp).toLocaleString()}
                    >
                      {formatAge(entry.timestamp, now)}
                    </time>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Response;
