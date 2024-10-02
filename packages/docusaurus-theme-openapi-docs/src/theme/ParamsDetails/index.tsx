/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useEffect, useState } from "react";

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import Details from "@theme/Details";
import ParamsItem from "@theme/ParamsItem";

interface Props {
  parameters: any[];
}

const ParamsDetailsComponent: React.FC<Props> = ({ parameters }) => {
  const types = ["path", "query", "header", "cookie"];

  return (
    <>
      {types.map((type) => {
        const params = parameters?.filter((param: any) => param?.in === type);

        if (!params || params.length === 0) {
          return null;
        }

        const summaryElement = (
          <summary>
            <h3 className="openapi-markdown__details-summary-header-params">
              {`${type.charAt(0).toUpperCase() + type.slice(1)} Parameters`}
            </h3>
          </summary>
        );

        return (
          <Details
            key={type}
            className="openapi-markdown__details"
            style={{ marginBottom: "1rem" }}
            data-collapsed={false}
            open={true}
            summary={summaryElement}
          >
            <ul>
              {params.map((param: any, index: number) => (
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
          </Details>
        );
      })}
    </>
  );
};

const ParamsDetails: React.FC<Props> = (props) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      setIsClient(true);
    }
  }, []);

  // Render the component only if it's client-side
  return isClient ? (
    <ParamsDetailsComponent {...props} />
  ) : (
    <div>Loading...</div>
  );
};

export default ParamsDetails;
