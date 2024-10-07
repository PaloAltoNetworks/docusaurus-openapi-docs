/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { Suspense, useEffect, useState } from "react";

import Details from "@theme/Details";
import ParamsItem from "@theme/ParamsItem";

interface Props {
  parameters: any[];
}

const ParamsDetailsComponent: React.FC<Props> = ({ parameters }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);
    }
  }, []);

  if (!isClient) {
    return (
      <div className="openapi-explorer__loading-container">
        <div className="openapi-response__lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

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
                      param?.schema?.["x-enumDescriptions"] ??
                        param?.schema?.items?.["x-enumDescriptions"] ??
                        {}
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
  const LazyComponent = React.lazy(() =>
    Promise.resolve({ default: ParamsDetailsComponent })
  );
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default ParamsDetails;
