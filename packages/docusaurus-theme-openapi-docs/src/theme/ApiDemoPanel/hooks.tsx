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
import { Param, setParam, State } from "./ParamOptions/slice";
import type { RootState, AppDispatch } from "./store";

export const useTypedDispatch = () => useDispatch<AppDispatch>();
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

interface SlashIDAttributes {
  "SlashID-OrgID": string | undefined;
  APIKey: string | undefined;
  [key: string]: string | string[] | undefined;
}

type ParamType = keyof State;

function getStoredParam({
  paramName,
  params,
  attributes,
}: {
  paramName: string;
  params: State;
  attributes: SlashIDAttributes;
}) {
  const storedParamValue = attributes[paramName];
  if (!storedParamValue) {
    return null;
  }

  const allParams = Object.keys(params).reduce(
    (aggregation: Param[], paramType) => {
      const paramsOfType: Param[] = params[paramType as ParamType];
      return [...aggregation, ...paramsOfType];
    },
    []
  );

  const param = allParams.find((p) => p.name === paramName);

  if (!param || param.value) {
    return null;
  }

  if (storedParamValue === param.value) {
    return null;
  }

  return param;
}

export type PersistentParamName = string;

/**
 * This hooks will try to fetch user attributes if a user is logged in.
 * Then it will set the initial values of parameters specified in the config as customFields.persistentParamNames.
 */
export const useSlashIDAttributes = ({
  persistentParamNames,
}: {
  persistentParamNames: PersistentParamName[];
}) => {
  const isBrowser = useIsBrowser();
  const params = useTypedSelector((state) => state.params);
  const data = useTypedSelector((state) => state.auth.data);
  const [attributes, setAttributes] = React.useState<SlashIDAttributes>({
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
        orgIdAttribute && orgIdParam && !orgIdParam.value;
      if (shouldUseAttributeOrgId) {
        dispatch(
          setParam({ ...orgIdParam, value: attributes["SlashID-OrgID"] })
        );
      }

      const shouldUseAttributeApiKey = apiKeyAttribute && !authApiKey;
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

  React.useEffect(() => {
    if (isBrowser) {
      persistentParamNames.forEach((paramName) => {
        const storedParam = getStoredParam({ params, attributes, paramName });
        if (!storedParam) {
          return;
        }

        dispatch(setParam({ ...storedParam, value: attributes[paramName] }));
      });
    }
  }, [attributes, dispatch, isBrowser, params, persistentParamNames]);

  return attributes;
};
