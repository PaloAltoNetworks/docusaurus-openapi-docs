/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import useIsBrowser from "@docusaurus/useIsBrowser";
import { User } from "@slashid/slashid";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { setAuthData } from "./Authorization/slice";
import { setParam } from "./ParamOptions/slice";
import type { RootState, AppDispatch } from "./store";

export const useTypedDispatch = () => useDispatch<AppDispatch>();
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

export const useSlashIDAttributes = () => {
  const isBrowser = useIsBrowser();
  const params = useTypedSelector((state) => state.params);
  const data = useTypedSelector((state) => state.auth.data);
  const [attributes, setAttributes] = React.useState({
    "SlashID-OrgID": undefined,
    APIKey: undefined,
  });
  const dispatch = useTypedDispatch();

  React.useEffect(() => {
    if (isBrowser) {
      const collectAttrs = async () => {
        const prevToken = window.localStorage.getItem("MY_USER_TOKEN");
        if (prevToken) {
          // There's a token, just re-create the user. TODO: make sure the token is not expired
          const user = new User(prevToken);
          try {
            let data = await user.get();
            setAttributes(data);
          } catch (e) {
            console.error(e);
          }
        }
      };

      collectAttrs();
    }
  }, [isBrowser, setAttributes]);

  React.useEffect(() => {
    if (isBrowser) {
      const orgIdAttribute = attributes["SlashID-OrgID"];
      const apiKeyAttribute = attributes["APIKey"];
      const orgIdParam = params.header.find(
        (param) => param.name === "SlashID-OrgID"
      );
      const authApiKey = data["ApiKeyAuth"]?.apiKey;

      const shouldUseAttributeOrgId =
        orgIdAttribute && orgIdParam && orgIdAttribute !== orgIdParam.value;
      if (shouldUseAttributeOrgId) {
        dispatch(
          setParam({ ...orgIdParam, value: attributes["SlashID-OrgID"] })
        );
      }

      const shouldUseAttributeApiKey =
        apiKeyAttribute && apiKeyAttribute !== authApiKey;
      if (shouldUseAttributeApiKey) {
        dispatch(
          setAuthData({
            scheme: "ApiKeyAuth",
            key: "apiKey",
            value: apiKeyAttribute,
          })
        );
      }
    }
  }, [attributes, data, dispatch, isBrowser, params.header, setAttributes]);

  return attributes;
};
