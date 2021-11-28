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

function Accept() {
  const acceptOptions = useSelector((state) => state.acceptOptions);
  const accept = useSelector((state) => state.accept);
  const { setAccept } = useActions();

  if (acceptOptions.length <= 1) {
    return null;
  }

  return (
    <FormItem label="Accept">
      <FormSelect
        options={acceptOptions}
        value={accept}
        onChange={(e) => setAccept(e.target.value)}
      />
    </FormItem>
  );
}

export default Accept;
