/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import clsx from "clsx";

export interface Props {
  children?: React.ReactNode;
  className?: string;
}

function FormItem({ children, className }: Props) {
  return (
    <div className={clsx("openapi-explorer__form-item", className)}>
      {children}
    </div>
  );
}

export default FormItem;
