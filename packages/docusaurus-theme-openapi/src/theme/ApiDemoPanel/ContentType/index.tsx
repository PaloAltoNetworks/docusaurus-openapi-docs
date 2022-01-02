/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { useTypedDispatch, useTypedSelector } from "../hooks";
import FormItem from "./../FormItem";
import FormSelect from "./../FormSelect";
import { setContentType } from "./slice";

function ContentType() {
  const value = useTypedSelector((state) => state.contentType.value);
  const options = useTypedSelector((state) => state.contentType.options);
  const dispatch = useTypedDispatch();

  if (options.length <= 1) {
    return null;
  }

  return (
    <FormItem label="Content-Type">
      <FormSelect
        value={value}
        options={options}
        onChange={(e) => dispatch(setContentType(e.target.value))}
      />
    </FormItem>
  );
}

export default ContentType;
