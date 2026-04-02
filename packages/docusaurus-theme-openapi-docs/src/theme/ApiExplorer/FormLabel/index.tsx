/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { translate } from "@docusaurus/Translate";
import { OPENAPI_SCHEMA_ITEM } from "@theme/translationIds";

export interface Props {
  htmlFor?: string;
  label: string;
  type?: string;
  required?: boolean;
}

function FormLabel({ htmlFor, label, type, required }: Props) {
  return (
    <>
      {htmlFor ? (
        <label className="openapi-explorer__form-item-label" htmlFor={htmlFor}>
          {label}
        </label>
      ) : (
        <span className="openapi-explorer__form-item-label">{label}</span>
      )}
      {type && <span style={{ opacity: 0.6 }}> — {type}</span>}
      {required && (
        <span className="openapi-schema__required">
          {translate({
            id: OPENAPI_SCHEMA_ITEM.REQUIRED,
            message: "required",
          })}
        </span>
      )}
    </>
  );
}

export default FormLabel;
