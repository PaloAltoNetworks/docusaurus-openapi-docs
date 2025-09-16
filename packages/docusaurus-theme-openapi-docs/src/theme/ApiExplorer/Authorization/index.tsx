/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { translate } from "@docusaurus/Translate";
import FormItem from "@theme/ApiExplorer/FormItem";
import FormSelect from "@theme/ApiExplorer/FormSelect";
import FormTextInput from "@theme/ApiExplorer/FormTextInput";
import { useTypedDispatch, useTypedSelector } from "@theme/ApiItem/hooks";
import { OPENAPI_AUTH } from "@theme/translationIds";

import { setAuthData, setSelectedAuth } from "./slice";

function Authorization() {
  const data = useTypedSelector((state: any) => state.auth.data);
  const options = useTypedSelector((state: any) => state.auth.options);
  const selected = useTypedSelector((state: any) => state.auth.selected);

  const dispatch = useTypedDispatch();

  if (selected === undefined) {
    return null;
  }

  const selectedAuth = options[selected];

  const optionKeys = Object.keys(options);

  return (
    <div>
      {optionKeys.length > 1 && (
        <FormItem
          label={translate({
            id: OPENAPI_AUTH.SECURITY_SCHEME,
            message: "Security Scheme",
          })}
        >
          <FormSelect
            options={optionKeys}
            value={selected}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              dispatch(setSelectedAuth(e.target.value));
            }}
          />
        </FormItem>
      )}
      {selectedAuth.map((a: any) => {
        if (a.type === "http" && a.scheme === "bearer") {
          return (
            <FormItem
              label={translate({
                id: OPENAPI_AUTH.BEARER_TOKEN,
                message: "Bearer Token",
              })}
              key={a.key + "-bearer"}
            >
              <FormTextInput
                placeholder={translate({
                  id: OPENAPI_AUTH.BEARER_TOKEN,
                  message: "Bearer Token",
                })}
                password
                value={data[a.key].token ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  dispatch(
                    setAuthData({
                      scheme: a.key,
                      key: "token",
                      value: value ? value : undefined,
                    })
                  );
                }}
              />
            </FormItem>
          );
        }

        if (a.type === "oauth2") {
          return (
            <FormItem
              label={translate({
                id: OPENAPI_AUTH.BEARER_TOKEN,
                message: "Bearer Token",
              })}
              key={a.key + "-oauth2"}
            >
              <FormTextInput
                placeholder={translate({
                  id: OPENAPI_AUTH.BEARER_TOKEN,
                  message: "Bearer Token",
                })}
                password
                value={data[a.key].token ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  dispatch(
                    setAuthData({
                      scheme: a.key,
                      key: "token",
                      value: value ? value : undefined,
                    })
                  );
                }}
              />
            </FormItem>
          );
        }

        if (a.type === "http" && a.scheme === "basic") {
          return (
            <React.Fragment key={a.key + "-basic"}>
              <FormItem
                label={translate({
                  id: OPENAPI_AUTH.USERNAME,
                  message: "Username",
                })}
              >
                <FormTextInput
                  placeholder={translate({
                    id: OPENAPI_AUTH.USERNAME,
                    message: "Username",
                  })}
                  value={data[a.key].username ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value;
                    dispatch(
                      setAuthData({
                        scheme: a.key,
                        key: "username",
                        value: value ? value : undefined,
                      })
                    );
                  }}
                />
              </FormItem>
              <FormItem
                label={translate({
                  id: OPENAPI_AUTH.PASSWORD,
                  message: "Password",
                })}
              >
                <FormTextInput
                  placeholder={translate({
                    id: OPENAPI_AUTH.PASSWORD,
                    message: "Password",
                  })}
                  password
                  value={data[a.key].password ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value;
                    dispatch(
                      setAuthData({
                        scheme: a.key,
                        key: "password",
                        value: value ? value : undefined,
                      })
                    );
                  }}
                />
              </FormItem>
            </React.Fragment>
          );
        }

        if (a.type === "apiKey") {
          return (
            <FormItem label={`${a.key}`} key={a.key + "-apikey"}>
              <FormTextInput
                placeholder={`${a.key}`}
                password
                value={data[a.key].apiKey ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  dispatch(
                    setAuthData({
                      scheme: a.key,
                      key: "apiKey",
                      value: value ? value : undefined,
                    })
                  );
                }}
              />
            </FormItem>
          );
        }

        return null;
      })}
    </div>
  );
}

export default Authorization;
