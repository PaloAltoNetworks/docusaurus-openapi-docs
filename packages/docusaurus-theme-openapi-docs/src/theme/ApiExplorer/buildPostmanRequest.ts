/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { AuthState, Scheme } from "@theme/ApiExplorer/Authorization/slice";
import { Body, Content } from "@theme/ApiExplorer/Body/slice";
import {
  getContentTypeHeader,
  getMediaType,
} from "@theme/ApiExplorer/utils/mediaType";
import type {
  ParameterObject,
  ServerObject,
} from "docusaurus-plugin-openapi-docs/src/openapi/types";
import cloneDeep from "lodash/cloneDeep";
import * as sdk from "postman-collection";

type Param = {
  value?: string | string[];
} & ParameterObject;

function setQueryParams(postman: sdk.Request, queryParams: Param[]) {
  postman.url.query.clear();

  const qp = queryParams
    .map((param) => {
      if (!param.value) {
        return undefined;
      }

      // Handle array values
      if (Array.isArray(param.value)) {
        if (param.style === "spaceDelimited") {
          return new sdk.QueryParam({
            key: param.name,
            value: param.value.join(" "),
          });
        } else if (param.style === "pipeDelimited") {
          return new sdk.QueryParam({
            key: param.name,
            value: param.value.join("|"),
          });
        } else if (param.explode) {
          return param.value.map(
            (val) =>
              new sdk.QueryParam({
                key: param.name,
                value: val,
              })
          );
        } else {
          return new sdk.QueryParam({
            key: param.name,
            value: param.value.join(","),
          });
        }
      }

      // Handle object values
      if (param.style === "deepObject") {
        const jsonResult = tryDecodeJsonParam(param.value);
        if (jsonResult && typeof jsonResult === "object") {
          return Object.entries(jsonResult).map(
            ([key, val]) =>
              new sdk.QueryParam({
                key: `${param.name}[${key}]`,
                value: String(val),
              })
          );
        }
      } else if (param.explode) {
        const jsonResult = tryDecodeJsonParam(param.value);
        if (jsonResult && typeof jsonResult === "object") {
          return Object.entries(jsonResult).map(
            ([key, val]) =>
              new sdk.QueryParam({
                key: key,
                value: String(val),
              })
          );
        }
        // A scalar has nothing to explode; fall through to the scalar handling
      }

      // Parameter allows empty value: "/hello?extended"
      if (param.allowEmptyValue) {
        if (param.value === "true") {
          return new sdk.QueryParam({
            key: param.name,
            value: null,
          });
        }
        return undefined;
      }

      return new sdk.QueryParam({
        key: param.name,
        value: param.value,
      });
    })
    .flat() // Flatten the array in case of nested arrays from map
    .filter((item) => item !== undefined);

  if (qp.length > 0) {
    postman.addQueryParams(qp);
  }
}

function setPathParams(postman: sdk.Request, pathParams: Param[]) {
  // Map through the path parameters
  const source = pathParams.map((param) => {
    if (!param.value) {
      return undefined;
    }

    let serializedValue;

    // Handle different styles
    if (Array.isArray(param.value)) {
      if (param.style === "label") {
        serializedValue = `.${param.value.join(".")}`;
      } else if (param.style === "matrix") {
        serializedValue = `;${param.name}=${param.value.join(";")}`;
      } else {
        serializedValue = param.value.join(",");
      }
      return new sdk.Variable({
        key: param.name,
        value: serializedValue,
      });
    }

    const jsonResult = tryDecodeJsonParam(param.value);

    if (jsonResult && typeof jsonResult === "object") {
      if (param.style === "matrix") {
        serializedValue = Object.entries(jsonResult)
          .map(([key, val]) => `;${key}=${val}`)
          .join("");
      } else {
        serializedValue = Object.entries(jsonResult)
          .map(([key, val]) => `${key}=${val}`)
          .join(",");
      }
    } else {
      serializedValue = param.value;
    }

    return new sdk.Variable({
      key: param.name,
      value: serializedValue,
    });
  });

  postman.url.variables.assimilate(
    source.filter((v): v is sdk.Variable => v !== undefined),
    false
  );
}

function buildCookie(cookieParams: Param[]) {
  const cookies = cookieParams
    .map((param) => {
      if (param.value) {
        const jsonResult = tryDecodeJsonParam(param.value as string);
        if (jsonResult && typeof jsonResult === "object") {
          if (param.style === "form") {
            // Handle form style
            if (param.explode) {
              // Serialize each key-value pair as a separate cookie
              return Object.entries(jsonResult).map(
                ([key, val]) =>
                  new sdk.Cookie({
                    key: key,
                    value: String(val),
                    domain: "",
                    path: "",
                  })
              );
            } else {
              // Serialize the object as a single cookie with key-value pairs joined by commas
              return new sdk.Cookie({
                key: param.name,
                value: Object.entries(jsonResult)
                  .map(([key, val]) => `${key},${val}`)
                  .join(","),
                domain: "",
                path: "",
              });
            }
          }
        } else {
          // Handle scalar values
          return new sdk.Cookie({
            key: param.name,
            value: String(param.value),
            domain: "",
            path: "",
          });
        }
      }
      return undefined;
    })
    .flat() // Flatten the array in case of nested arrays from map
    .filter((item) => item !== undefined);

  const list = new sdk.CookieList(null, cookies);
  return list.toString();
}

function setHeaders(
  postman: sdk.Request,
  contentType: string,
  accept: string,
  cookie: string,
  headerParams: Param[],
  other: { key: string; value: string }[]
) {
  postman.headers.clear();

  if (contentType) {
    postman.addHeader({
      key: "Content-Type",
      value:
        postman.body?.mode === "formdata"
          ? getContentTypeHeader(contentType)
          : contentType,
    });
  }

  if (accept) {
    postman.addHeader({ key: "Accept", value: accept });
  }

  headerParams.forEach((param) => {
    if (param.value) {
      if (Array.isArray(param.value)) {
        if (param.style === "simple") {
          if (param.explode) {
            // Each item in the array is a separate header
            param.value.forEach((val) => {
              postman.addHeader({ key: param.name, value: val });
            });
          } else {
            // Array values are joined by commas
            postman.addHeader({
              key: param.name,
              value: param.value.join(","),
            });
          }
        }
        return;
      }

      const jsonResult = tryDecodeJsonParam(param.value);
      if (jsonResult && typeof jsonResult === "object") {
        if (param.style === "simple") {
          if (param.explode) {
            // Each key-value pair in the object is a separate header
            Object.entries(jsonResult).forEach(([key, val]) => {
              postman.addHeader({ key: param.name, value: `${key}=${val}` });
            });
          } else {
            // Object is serialized as a single header with key-value pairs joined by commas
            postman.addHeader({
              key: param.name,
              value: Object.entries(jsonResult)
                .map(([key, val]) => `${key},${val}`)
                .join(","),
            });
          }
        }
      } else {
        // Handle scalar values
        postman.addHeader({ key: param.name, value: param.value });
      }
    }
  });

  other.forEach((header) => {
    postman.addHeader(header);
  });

  if (cookie) {
    postman.addHeader({ key: "Cookie", value: cookie });
  }
}

function tryDecodeJsonParam(value: string): any {
  try {
    return JSON.parse(decodeURI(value));
  } catch (e) {
    return false;
  }
}

function setBodyMode(body: sdk.RequestBody, mode: string) {
  body.mode = mode;
  if (mode !== "raw") body.raw = undefined;
  if (mode !== "urlencoded") {
    body.urlencoded?.clear();
    body.urlencoded = undefined;
  }
  if (mode !== "formdata") {
    body.formdata?.clear();
    body.formdata = undefined;
  }
  if (mode !== "file") body.file = undefined;
}

export class RequestBodyError extends Error {}

// TODO: this is all a bit hacky
function setBody(
  clonedPostman: sdk.Request,
  body: Body,
  contentType: string,
  encoding?: Record<string, { contentType?: string }>
) {
  const mediaType = getMediaType(contentType);
  const mode =
    mediaType === "multipart/form-data"
      ? "formdata"
      : mediaType === "application/x-www-form-urlencoded"
        ? "urlencoded"
        : undefined;

  if (clonedPostman.body === undefined) {
    return;
  }

  if (body.type === "raw" && body.content?.type === "file") {
    if (mode !== "formdata") {
      setBodyMode(clonedPostman.body, "file");
      clonedPostman.body.file = { src: body.content.value.src };
      return;
    }

    // Raw uploads carry no field name. Never assign one of several file fields.
    const fileFields =
      clonedPostman.body.formdata
        ?.all()
        .filter(
          (param) =>
            (param as sdk.FormParam & { type?: string }).type === "file" &&
            param.key &&
            !param.disabled
        ) ?? [];
    if (fileFields.length !== 1) {
      throw new RequestBodyError(
        "Choose a named file field in the multipart form before uploading a file."
      );
    }
    body = { type: "form", content: { [fileFields[0].key!]: body.content } };
  }

  const hasEncoding = encoding && Object.keys(encoding).length > 0;
  if (mode) {
    // Capture examples before clearing the inactive urlencoded list.
    const placeholders =
      mode === "formdata" &&
      body.type === "empty" &&
      hasEncoding &&
      clonedPostman.body.mode === "urlencoded"
        ? (clonedPostman.body.urlencoded?.all() ?? [])
        : [];
    if (mode === "formdata" && clonedPostman.body.mode !== mode) {
      clonedPostman.body.formdata?.clear();
    }
    setBodyMode(clonedPostman.body, mode);
    if (mode === "formdata") {
      clonedPostman.body.formdata ??= new sdk.PropertyList<sdk.FormParam>(
        sdk.FormParam as any,
        clonedPostman.body,
        []
      );
      placeholders.forEach((param) => {
        clonedPostman.body?.formdata?.add(
          new sdk.FormParam({ ...param.toJSON(), key: param.key ?? undefined })
        );
      });
    } else {
      clonedPostman.body.urlencoded ??= new sdk.PropertyList<sdk.QueryParam>(
        sdk.QueryParam as any,
        clonedPostman.body,
        []
      );
    }
  }

  if (body.type === "empty") {
    // When the original request has formdata and encoding is declared, keep the
    // placeholder params so the code snippet reflects the selected encoding even
    // before the user has uploaded a file.
    if (clonedPostman.body?.mode === "formdata" && hasEncoding) {
      const members: any[] =
        (clonedPostman.body.formdata as any)?.members ?? [];
      members.forEach((param: any) => {
        const partContentType = encoding[param.key]?.contentType
          ?.split(",")[0]
          .trim();
        if (partContentType) {
          param.contentType = partContentType;
        }
      });
      return;
    }
    clonedPostman.body = undefined;
    return;
  }

  switch (clonedPostman.body.mode) {
    case "raw": {
      setBodyMode(clonedPostman.body, "raw");
      // check file even though it should already be set from above
      if (
        body.type !== "raw" ||
        body.content?.type === "file" ||
        body.content?.type === "file[]"
      ) {
        clonedPostman.body = undefined;
        return;
      }
      clonedPostman.body.raw = body.content?.value ?? "";
      return;
    }
    case "formdata": {
      setBodyMode(clonedPostman.body, "formdata");
      clonedPostman.body.formdata?.clear();
      if (body.type !== "form") {
        // treat it like raw.
        setBodyMode(clonedPostman.body, "raw");
        clonedPostman.body.raw = `${body.content?.value}`;
        return;
      }
      const params: sdk.FormParam[] = [];
      Object.entries(body.content)
        .filter((entry): entry is [string, NonNullable<Content>] => !!entry[1])
        .forEach(([key, content]) => {
          const partContentType = encoding?.[key]?.contentType
            ?.split(",")[0]
            .trim();
          if (content.type === "file") {
            params.push(
              new sdk.FormParam({
                key: key,
                ...content,
                ...(partContentType && { contentType: partContentType }),
              })
            );
          } else if (content.type === "file[]") {
            content.value.forEach((file) =>
              params.push(
                new sdk.FormParam({
                  key,
                  value: file,
                  ...(partContentType && { contentType: partContentType }),
                })
              )
            );
          } else {
            params.push(
              new sdk.FormParam({
                key: key,
                value: content.value,
                ...(partContentType && { contentType: partContentType }),
              })
            );
          }
        });
      params.forEach((param) => {
        clonedPostman.body?.formdata?.add(param);
      });
      return;
    }
    case "urlencoded": {
      setBodyMode(clonedPostman.body, "urlencoded");
      clonedPostman.body.urlencoded?.clear();
      if (body.type !== "form") {
        // treat it like raw.
        setBodyMode(clonedPostman.body, "raw");
        clonedPostman.body.raw = `${body.content?.value}`;
        return;
      }
      const params = Object.entries(body.content)
        .filter((entry): entry is [string, NonNullable<Content>] => !!entry[1])
        .map(([key, content]) => {
          if (
            content.type !== "file" &&
            content.type !== "file[]" &&
            content.value
          ) {
            return new sdk.QueryParam({ key: key, value: content.value });
          }
          return undefined;
        })
        .filter((item): item is sdk.QueryParam => item !== undefined);
      clonedPostman.body.urlencoded?.assimilate(params, false);
      return;
    }
    default:
      return;
  }
}

// TODO: finish these types
interface Options {
  server?: ServerObject;
  queryParams: Param[];
  pathParams: Param[];
  cookieParams: Param[];
  headerParams: Param[];
  contentType: string;
  accept: string;
  body: Body;
  auth: AuthState;
  encoding?: Record<string, { contentType?: string }>;
}

function buildPostmanRequest(
  postman: sdk.Request,
  {
    queryParams,
    pathParams,
    cookieParams,
    contentType,
    accept,
    headerParams,
    body,
    server,
    auth,
    encoding,
  }: Options
) {
  const clonedPostman = cloneDeep(postman);

  clonedPostman.url.protocol = undefined;
  clonedPostman.url.host = [window.location.origin];

  if (server) {
    let url = server.url.replace(/\/$/, "");
    const variables = server.variables;
    if (variables) {
      Object.keys(variables).forEach((variable) => {
        url = url.replace(`{${variable}}`, variables[variable].default);
      });
    }
    clonedPostman.url.host = [url];
  }

  const enhancedQueryParams = [...queryParams];
  const enhancedCookieParams = [...cookieParams];

  let otherHeaders = [];

  let selectedAuth: Scheme[] = [];
  if (auth.selected !== undefined) {
    selectedAuth = auth.options[auth.selected];
  }

  for (const a of selectedAuth) {
    // Bearer Auth
    if (a.type === "http" && a.scheme === "bearer") {
      const { token } = auth.data[a.key];
      if (token === undefined) {
        otherHeaders.push({
          key: "Authorization",
          value: "Bearer <TOKEN>",
        });
        continue;
      }
      otherHeaders.push({
        key: "Authorization",
        value: `Bearer ${token}`,
      });
      continue;
    }

    if (a.type === "oauth2") {
      let token;
      if (auth.data[a.key]) {
        token = auth.data[a.key].token;
      }
      if (token === undefined) {
        otherHeaders.push({
          key: "Authorization",
          value: "Bearer <TOKEN>",
        });
        continue;
      }
      otherHeaders.push({
        key: "Authorization",
        value: `Bearer ${token}`,
      });
      continue;
    }

    // Basic Auth
    if (a.type === "http" && a.scheme === "basic") {
      const { username, password } = auth.data[a.key];
      if (username === undefined || password === undefined) {
        continue;
      }
      otherHeaders.push({
        key: "Authorization",
        value: `Basic ${window.btoa(`${username}:${password}`)}`,
      });
      continue;
    }

    // API Key in header
    if (a.type === "apiKey" && a.in === "header") {
      const { apiKey } = auth.data[a.key];
      otherHeaders.push({
        key: a.name,
        value: apiKey || `<${a.name ?? a.type}>`,
      });
      continue;
    }

    // API Key in query
    if (a.type === "apiKey" && a.in === "query") {
      const { apiKey } = auth.data[a.key];
      enhancedQueryParams.push({
        name: a.name,
        in: "query",
        value: apiKey || `<${a.name ?? a.type}>`,
      });
      continue;
    }

    // API Key in cookie
    if (a.type === "apiKey" && a.in === "cookie") {
      const { apiKey } = auth.data[a.key];
      enhancedCookieParams.push({
        name: a.name,
        in: "cookie",
        value: apiKey || `<${a.name ?? a.type}>`,
      });
      continue;
    }
  }

  // Use the enhanced params that might include API keys
  setQueryParams(clonedPostman, enhancedQueryParams);
  setPathParams(clonedPostman, pathParams);

  // Use enhanced cookie params that might include API keys
  const cookie = buildCookie(enhancedCookieParams);

  setBody(clonedPostman, body, contentType, encoding);

  setHeaders(
    clonedPostman,
    contentType,
    accept,
    cookie,
    headerParams,
    otherHeaders
  );

  return clonedPostman;
}

export function tryBuildPostmanRequest(postman: sdk.Request, options: Options) {
  try {
    return { request: buildPostmanRequest(postman, options), error: undefined };
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return { request: undefined, error: error.message };
    }
    throw error;
  }
}

export default buildPostmanRequest;
