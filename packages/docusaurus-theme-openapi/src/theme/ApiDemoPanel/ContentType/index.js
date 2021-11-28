/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { useSelector } from "react-redux";

import FormItem from "./../FormItem";
import FormSelect from "./../FormSelect";
import { useActions } from "./../redux/actions";

function ContentType() {
  const contentTypeOptions = useSelector((state) => state.contentTypeOptions);
  const contentType = useSelector((state) => state.contentType);
  const { setContentType } = useActions();

  if (contentTypeOptions.length <= 1) {
    return null;
  }

  return (
    <FormItem label="Content-Type">
      <FormSelect
        options={contentTypeOptions}
        value={contentType}
        onChange={(e) => setContentType(e.target.value)}
      />
    </FormItem>
  );
}

export default ContentType;
