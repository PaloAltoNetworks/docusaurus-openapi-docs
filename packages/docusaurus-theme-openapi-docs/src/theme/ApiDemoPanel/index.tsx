/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import sdk from "@paloaltonetworks/postman-collection";
import Curl from "@theme/ApiDemoPanel/Curl";
import Request from "@theme/ApiDemoPanel/Request";
import Response from "@theme/ApiDemoPanel/Response";
import { ApiItem } from "docusaurus-plugin-openapi-docs/src/types";

function ApiDemoPanel({
  item,
  infoPath,
}: {
  item: NonNullable<ApiItem>;
  infoPath: string;
}) {
  const postman = new sdk.Request(item.postman);

  return (
    <>
      <Curl
        postman={postman}
        codeSamples={(item as any)["x-code-samples"] ?? []}
      />
      <Request item={item} />
      <Response />
    </>
  );
}

export default ApiDemoPanel;
