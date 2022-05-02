/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createSchemaDetails } from "./createSchemaDetails";

interface Props {
  title: string;
  body: any;
}

export function createRequestBodyDetails({ title, body }: Props) {
  return createSchemaDetails({ title, body });
}
