/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { useDoc } from "@docusaurus/plugin-content-docs/client";
import { translate } from "@docusaurus/Translate";
import CodeSnippets from "@theme/ApiExplorer/CodeSnippets";
import Request from "@theme/ApiExplorer/Request";
import Response from "@theme/ApiExplorer/Response";
import ResponsePreview from "@theme/ApiExplorer/ResponsePreview";
import SecuritySchemes from "@theme/ApiExplorer/SecuritySchemes";
import TryItDrawer from "@theme/ApiExplorer/TryItDrawer";
import { openTryIt } from "@theme/ApiExplorer/TryItDrawer/events";
import useApiLayout from "@theme/ApiExplorer/useApiLayout";
import type { ApiItem } from "docusaurus-plugin-openapi-docs/src/types";
import * as sdk from "postman-collection";

function ApiExplorer({
  item,
  infoPath,
}: {
  item: NonNullable<ApiItem>;
  infoPath: string;
}) {
  const metadata = useDoc();
  const { mask_credentials } = metadata.frontMatter;
  const layout = useApiLayout();

  const postman = new sdk.Request(
    item.postman
      ? sdk.Request.isRequest(item.postman)
        ? (item.postman as any).toJSON()
        : (item.postman as any)
      : {}
  );

  const snippets = item.method !== "event" && (
    <CodeSnippets
      pathTemplate={item.path}
      postman={postman}
      codeSamples={(item as any)["x-codeSamples"] ?? []}
      maskCredentials={mask_credentials}
      requestBody={item.requestBody}
    />
  );

  if (layout === "modern") {
    return (
      <>
        {item.method !== "event" && (
          <button
            type="button"
            className="openapi-explorer__try-it-btn"
            onClick={openTryIt}
          >
            {translate({ id: "theme.openapi.tryIt.open", message: "Try it" })}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
        {snippets}
        <ResponsePreview responses={item.responses as any} />
        {item.method !== "event" && (
          <TryItDrawer item={item} infoPath={infoPath} />
        )}
      </>
    );
  }

  return (
    <>
      <SecuritySchemes infoPath={infoPath} />
      {snippets}
      <Request item={item} />
      <Response item={item} />
    </>
  );
}

export default ApiExplorer;
