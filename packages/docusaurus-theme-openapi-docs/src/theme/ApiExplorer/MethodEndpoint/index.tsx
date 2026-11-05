/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useEffect, useRef, useState } from "react";

import BrowserOnly from "@docusaurus/BrowserOnly";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { translate } from "@docusaurus/Translate";
import { openTryIt } from "@theme/ApiExplorer/TryItDrawer/events";
import useApiLayout from "@theme/ApiExplorer/useApiLayout";
import { useTypedSelector } from "@theme/ApiItem/hooks";
import copy from "copy-text-to-clipboard";

function colorForMethod(method: string) {
  switch (method.toLowerCase()) {
    case "get":
      return "primary";
    case "post":
      return "success";
    case "delete":
      return "danger";
    case "put":
      return "info";
    case "patch":
      return "warning";
    case "head":
      return "secondary";
    case "event":
      return "secondary";
    default:
      return undefined;
  }
}

function renderPath(path: string) {
  return path.split(/({[a-z0-9-_]+})/gi).map((segment, i) => {
    const match = segment.match(/^{([a-z0-9-_]+)}$/i);
    if (!match) return segment;
    return (
      <span key={i} className="openapi__method-endpoint-param">
        :{match[1]}
      </span>
    );
  });
}

function resolveServerUrl(serverValue: any): string {
  if (!serverValue?.url) return "";
  let url: string = serverValue.url;
  if (serverValue.variables) {
    url = url.replace(/\/$/, "");
    Object.keys(serverValue.variables).forEach((variable) => {
      url = url.replace(
        `{${variable}}`,
        serverValue.variables?.[variable].default ?? ""
      );
    });
  }
  return url;
}

function scrollToExplorer() {
  const target =
    document.querySelector<HTMLElement>(".openapi-explorer__request-form") ??
    document.querySelector<HTMLElement>(".openapi-right-panel__container");
  if (!target) return;
  const reduceMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  target.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
  target
    .querySelector<HTMLElement>("input, select, textarea, button")
    ?.focus({ preventScroll: true });
}

function EndpointActions({ url }: { url: string }) {
  const modern = useApiLayout() === "modern";
  const [copied, setCopied] = useState(false);
  const timeout = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timeout.current), []);

  const copyLabel = copied
    ? translate({ id: "theme.openapi.endpoint.copied", message: "Copied" })
    : translate({ id: "theme.openapi.endpoint.copyUrl", message: "Copy URL" });

  return (
    <div className="openapi__method-endpoint-actions">
      <button
        type="button"
        className="openapi__method-endpoint-btn"
        aria-label={copyLabel}
        title={copyLabel}
        onClick={() => {
          copy(url);
          setCopied(true);
          window.clearTimeout(timeout.current);
          timeout.current = window.setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
            />
          </svg>
        )}
      </button>
      <button
        type="button"
        className={
          modern
            ? "openapi__method-endpoint-btn openapi__method-endpoint-try openapi__method-endpoint-try--always"
            : "openapi__method-endpoint-btn openapi__method-endpoint-try"
        }
        onClick={modern ? openTryIt : scrollToExplorer}
      >
        {translate({ id: "theme.openapi.endpoint.tryIt", message: "Try it" })}
      </button>
    </div>
  );
}

export interface Props {
  method: string;
  path: string;
  context?: "endpoint" | "callback";
}

function EndpointBar({
  method,
  path,
  serverUrl,
  actions,
}: Props & { serverUrl?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <>
      <div className="openapi__method-endpoint-row">
        <pre className="openapi__method-endpoint">
          <span className={"badge badge--" + colorForMethod(method)}>
            {method === "event" ? "Webhook" : method.toUpperCase()}
          </span>{" "}
          {method !== "event" && (
            <h2 className="openapi__method-endpoint-path">
              {serverUrl}
              {renderPath(path)}
            </h2>
          )}
        </pre>
        {actions}
      </div>
      <div className="openapi__divider" />
    </>
  );
}

function ClientMethodEndpoint({ method, path, context }: Props) {
  const serverValue = useTypedSelector((state: any) => state.server.value);
  const isCallback = context === "callback";
  const serverUrl = isCallback ? "" : resolveServerUrl(serverValue);

  return (
    <EndpointBar
      method={method}
      path={path}
      serverUrl={
        serverUrl ? <BrowserOnly>{() => serverUrl}</BrowserOnly> : undefined
      }
      actions={
        !isCallback && method !== "event" ? (
          <BrowserOnly>
            {() => <EndpointActions url={`${serverUrl}${path}`} />}
          </BrowserOnly>
        ) : undefined
      }
    />
  );
}

function MethodEndpoint(props: Props) {
  // During SSR, render without Redux store access to avoid "Cannot read properties
  // of null (reading 'store')" errors caused by useSelector running outside a Provider.
  if (!ExecutionEnvironment.canUseDOM) {
    return <EndpointBar {...props} />;
  }
  return <ClientMethodEndpoint {...props} />;
}

export default MethodEndpoint;
