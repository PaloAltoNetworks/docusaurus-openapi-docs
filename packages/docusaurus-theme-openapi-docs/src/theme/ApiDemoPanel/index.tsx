/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import sdk from "@paloaltonetworks/postman-collection";
import { ApiItem } from "docusaurus-plugin-openapi-docs/src/types";

import Curl from "./Curl";
import MethodEndpoint from "./MethodEndpoint";
import Request from "./Request";
import Response from "./Response";
import SecuritySchemes from "./SecuritySchemes";
import styles from "./styles.module.css";

function ApiDemoPanel({
  item,
  infoPath,
}: {
  item: NonNullable<ApiItem>;
  infoPath: string;
}) {
  const postman = new sdk.Request(item.postman);
  const { path, method } = item;

  return (
    <div className={styles.apiDemoPanelContainer}>
      <MethodEndpoint method={method} path={path} />
      <SecuritySchemes infoPath={infoPath} />
      <Request item={item} />
      <Response />
      <Curl
        postman={postman}
        codeSamples={(item as any)["x-code-samples"] ?? []}
      />
    </div>
  );
}

export default ApiDemoPanel;
