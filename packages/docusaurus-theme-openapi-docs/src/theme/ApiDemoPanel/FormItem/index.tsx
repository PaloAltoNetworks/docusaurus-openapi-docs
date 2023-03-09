/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

export interface Props {
  label?: string;
  type?: string;
  required?: boolean | undefined;
  children?: React.ReactNode;
}

function FormItem({ label, type, required, children }: Props) {
  return (
    <div className="openapi-demo__form-item">
      <code>{label}</code>
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
