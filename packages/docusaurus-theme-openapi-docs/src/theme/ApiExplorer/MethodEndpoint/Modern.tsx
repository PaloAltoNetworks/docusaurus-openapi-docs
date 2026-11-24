/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import BrowserOnly from "@docusaurus/BrowserOnly";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { translate } from "@docusaurus/Translate";
import { openTryIt } from "@theme/ApiExplorer/TryItDrawer/events";
import useCanSendRequest from "@theme/ApiExplorer/useCanSendRequest";
import { colorForMethod, renderPath } from "@theme/ApiExplorer/utils/endpoint";
import { useTypedSelector } from "@theme/ApiItem/hooks";

function resolveServerUrl(serverValue: any): string {
  if (!serverValue?.url) return "";
  let url: string = serverValue.url.replace(/\/$/, "");
  if (serverValue.variables) {
    Object.keys(serverValue.variables).forEach((variable) => {
      url = url.replace(
        `{${variable}}`,
        serverValue.variables?.[variable].default ?? ""
      );
    });
  }
  return url;
}

function EndpointActions({ canTry }: { canTry: boolean }) {
  if (!canTry) return null;
  return (
    <div className="openapi__method-endpoint-actions">
      <button
        type="button"
        className="openapi__method-endpoint-btn openapi__method-endpoint-try"
        onClick={openTryIt}
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
  const canTry = useCanSendRequest(method);

  return (
    <EndpointBar
      method={method}
      path={path}
      serverUrl={
        serverUrl ? <BrowserOnly>{() => serverUrl}</BrowserOnly> : undefined
      }
      actions={
        !isCallback && method !== "event" ? (
          <BrowserOnly>{() => <EndpointActions canTry={canTry} />}</BrowserOnly>
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
