/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import BaseSchema from "@theme/BaseSchema";
import { MediaTypeObject } from "docusaurus-plugin-openapi-docs/lib/openapi/types";

interface Props {
  style?: React.CSSProperties;
  title: string;
  body: {
    content?: {
      [key: string]: MediaTypeObject;
    };
    description?: string;
    required?: string[] | boolean;
  };
}

const ResponseSchema: React.FC<Props> = (props) => {
  return <BaseSchema {...props} schemaType="response" />;
};

export default ResponseSchema;
