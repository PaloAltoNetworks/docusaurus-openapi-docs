/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

function FullWidthTable({
  children,
  style,
  ...rest
}: JSX.IntrinsicElements["table"]) {
  return (
    <table style={{ display: "table", width: "100%", ...style }} {...rest}>
      {children}
    </table>
  );
}

export default FullWidthTable;
