/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createSchemaTable } from "./createSchemaTable";

interface Props {
  title: string;
  body: any;
}

export function createRequestBodyTable({ title, body }: Props) {
  return createSchemaTable({ title, body });
}
