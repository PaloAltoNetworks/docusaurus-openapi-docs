/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";
import clsx from "clsx";

export interface Props {
  label?: string;
  type?: string;
  required?: boolean | undefined;
  children?: React.ReactNode;
  className?: string;
}

function FormItem({ label, type, required, children, className }: Props) {
  return (
    <div className={clsx("openapi-demo__form-item", className)}>
      {label && (
        <label className="openapi-demo__form-item-label">{label}</label>
      )}
      {type && <span style={{ opacity: 0.6 }}> — {type}</span>}
      {required && (
        <span>
          {" "}
          <small>
            <strong className="required"> required</strong>
          </small>
        </span>
      )}
      <div>{children}</div>
    </div>
  );
}

export default FormItem;
