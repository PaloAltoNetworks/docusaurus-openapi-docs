/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import Details from "@theme/Details";
import ParamsItem from "@theme/ParamsItem"; // Adjust the import path as needed

const ParamsDetails = ({ parameters, type }: any) => {
  const params = parameters?.filter((param: any) => param?.in === type);

  if (!params || params.length === 0) {
    return null;
  }

  const summaryElement = (
    <summary>
      <h3 className="openapi-markdown__details-summary-header-params">{`${type.charAt(0).toUpperCase() + type.slice(1)} Parameters`}</h3>
    </summary>
  );

  return (
    <Details
      className="openapi-markdown__details"
      style={{ marginBottom: "1rem" }}
      data-collapsed={false}
      open={true}
      summary={summaryElement}
    >
      <div>
        <ul>
          {params.map((param: any, index: any) => (
            <ParamsItem
              key={index}
              className="paramsItem"
              param={{
                ...param,
                enumDescriptions: Object.entries(
                  param?.schema?.items?.["x-enumDescriptions"] ?? {}
                ),
              }}
            />
          ))}
        </ul>
      </div>
    </Details>
  );
};

export default ParamsDetails;
