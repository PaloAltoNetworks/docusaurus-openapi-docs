/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { useState, useEffect } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "./store";

// Safe wrapper for useDispatch that returns a no-op when Redux context is unavailable
// This fixes React 19 compatibility where the Redux context may not be available
// during SSR or initial hydration with react-redux v7.x
export const useTypedDispatch = (): AppDispatch => {
  try {
    return useDispatch<AppDispatch>();
  } catch (e) {
    // Return a no-op dispatch function when Redux context is not available
    return (() => {}) as unknown as AppDispatch;
  }
};

// Safe wrapper for useSelector that returns undefined when Redux context is unavailable
// This fixes React 19 compatibility where useSelector fails during SSR
// because the Redux context is not properly propagated with react-redux v7.x
export const useTypedSelector: TypedUseSelectorHook<RootState> = ((
  selector: (state: RootState) => unknown
) => {
  const [state, setState] = useState<unknown>(undefined);
  const [isReady, setIsReady] = useState(false);

  // Try to get the Redux context
  let reduxState: unknown = undefined;
  try {
    reduxState = useSelector(selector);
  } catch (e) {
    // Redux context not available - will return undefined
  }

  useEffect(() => {
    if (reduxState !== undefined) {
      setState(reduxState);
      setIsReady(true);
    }
  }, [reduxState]);

  return isReady ? state : reduxState;
}) as TypedUseSelectorHook<RootState>;
