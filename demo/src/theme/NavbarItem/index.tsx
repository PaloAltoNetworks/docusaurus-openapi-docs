/* ============================================================================
 * NavbarItem swizzle — intercepts custom-PalettePicker before
 * ComponentTypes lookup so no registry change is needed.
 * ========================================================================== */

import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import OriginalNavbarItem from "@theme-original/NavbarItem";

import PalettePicker from "@site/src/components/PalettePicker";

type OriginalProps = React.ComponentProps<typeof OriginalNavbarItem>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function NavbarItem(props: OriginalProps): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((props as any).type === "custom-PalettePicker") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <PalettePicker mobile={(props as any).mobile} />;
  }
  return <OriginalNavbarItem {...props} />;
}
