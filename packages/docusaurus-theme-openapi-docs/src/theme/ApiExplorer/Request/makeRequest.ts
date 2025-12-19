/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { Body } from "@theme/ApiExplorer/Body/slice";
import * as sdk from "postman-collection";

// Custom error types for better error handling
export type RequestErrorType =
  | "timeout"
  | "network"
  | "cors"
  | "abort"
  | "unknown";

export class RequestError extends Error {
  type: RequestErrorType;
  originalError?: Error;

  constructor(type: RequestErrorType, message: string, originalError?: Error) {
    super(message);
    this.name = "RequestError";
    this.type = type;
    this.originalError = originalError;
  }
}

const DEFAULT_REQUEST_TIMEOUT = 30000; // 30 seconds

function fetchWithtimeout(
  url: string,
  options: RequestInit,
  timeout = DEFAULT_REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  })
    .then((response) => {
      clearTimeout(timeoutId);
      return response;
    })
    .catch((error) => {
      clearTimeout(timeoutId);

      // Check if it was an abort due to timeout
      if (error.name === "AbortError") {
        throw new RequestError(
          "timeout",
          "The request timed out waiting for the server to respond. Please try again. If the issue persists, try using a different client (e.g., curl) with a longer timeout.",
          error
        );
      }

      // Check for network errors (offline, DNS failure, etc.)
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        // This could be CORS, network failure, or the server being unreachable
        throw new RequestError(
          "network",
          "Unable to reach the server. Please check your network connection and verify the server URL is correct. If the server is running, this may be a CORS issue.",
          error
        );
      }

      // Handle other TypeErrors that might indicate CORS issues
      if (error instanceof TypeError) {
        throw new RequestError(
          "cors",
          "The request was blocked, possibly due to CORS restrictions. Ensure the server allows requests from this origin, or try using a proxy.",
          error
        );
      }

      // Generic error fallback
      throw new RequestError(
        "unknown",
        error.message ||
          "An unexpected error occurred while making the request.",
        error
      );
    });
}

async function loadImage(content: Blob): Promise<string | ArrayBuffer | null> {
  return new Promise((accept, reject) => {
    const reader = new FileReader();

    reader.onabort = () => {
      console.log("file reading was aborted");
      reject();
    };

    reader.onerror = () => {
      console.log("file reading has failed");
      reject();
    };

    reader.onload = () => {
      // Do whatever you want with the file contents
      const binaryStr = reader.result;
      accept(binaryStr);
    };
    reader.readAsArrayBuffer(content);
  });
}

async function makeRequest(
  request: sdk.Request,
  proxy: string | undefined,
  _body: Body,
  timeout: number = DEFAULT_REQUEST_TIMEOUT
) {
  const headers = request.toJSON().header;

  let myHeaders = new Headers();
  if (headers) {
    headers.forEach((header: any) => {
      if (header.key && header.value) {
        myHeaders.append(header.key, header.value);
      }
    });
  }

  // The following code handles multiple files in the same formdata param.
  // It removes the form data params where the src property is an array of filepath strings
  // Splits that array into different form data params with src set as a single filepath string
  // TODO:
  // if (request.body && request.body.mode === 'formdata') {
  //   let formdata = request.body.formdata,
  //     formdataArray = [];
  //   formdata.members.forEach((param) => {
  //     let key = param.key,
  //       type = param.type,
  //       disabled = param.disabled,
  //       contentType = param.contentType;
  //     // check if type is file or text
  //     if (type === 'file') {
  //       // if src is not of type string we check for array(multiple files)
  //       if (typeof param.src !== 'string') {
  //         // if src is an array(not empty), iterate over it and add files as separate form fields
  //         if (Array.isArray(param.src) && param.src.length) {
  //           param.src.forEach((filePath) => {
  //             addFormParam(
  //               formdataArray,
  //               key,
  //               param.type,
  //               filePath,
  //               disabled,
  //               contentType
  //             );
  //           });
  //         }
  //         // if src is not an array or string, or is an empty array, add a placeholder for file path(no files case)
  //         else {
  //           addFormParam(
  //             formdataArray,
  //             key,
  //             param.type,
  //             '/path/to/file',
  //             disabled,
  //             contentType
  //           );
  //         }
  //       }
  //       // if src is string, directly add the param with src as filepath
  //       else {
  //         addFormParam(
  //           formdataArray,
  //           key,
  //           param.type,
  //           param.src,
  //           disabled,
  //           contentType
  //         );
  //       }
  //     }
  //     // if type is text, directly add it to formdata array
  //     else {
  //       addFormParam(
  //         formdataArray,
  //         key,
  //         param.type,
  //         param.value,
  //         disabled,
  //         contentType
  //       );
  //     }
  //   });
  //   request.body.update({
  //     mode: 'formdata',
  //     formdata: formdataArray,
  //   });
  // }

  const body = request.body?.toJSON();

  let myBody: RequestInit["body"] = undefined;
  if (body !== undefined && Object.keys(body).length > 0) {
    switch (body.mode) {
      case "urlencoded": {
        myBody = new URLSearchParams();
        if (Array.isArray(body.urlencoded)) {
          for (const data of body.urlencoded) {
            if (data.key && data.value) {
              myBody.append(data.key, data.value);
            }
          }
        }
        break;
      }
      case "raw": {
        myBody = (body.raw ?? "").toString();
        break;
      }
      case "formdata": {
        // The Content-Type header will be set automatically based on the type of body.
        myHeaders.delete("Content-Type");

        myBody = new FormData();
        const members = (request.body as any)?.formdata?.members;
        if (Array.isArray(members)) {
          for (const data of members) {
            if (data.key && data.value.content) {
              myBody.append(data.key, data.value.content);
            }
            // handle generic key-value payload
            if (data.key && typeof data.value === "string") {
              myBody.append(data.key, data.value);
            }
          }
        }
        break;
      }
      case "file": {
        if (_body.type === "raw" && _body.content?.type === "file") {
          myBody = await loadImage(_body.content.value.content);
        }
        break;
      }
      default:
        break;
    }
  }

  const requestOptions: RequestInit = {
    method: request.method,
    headers: myHeaders,
    body: myBody,
  };

  let finalUrl = request.url.toString();
  if (proxy) {
    // Ensure the proxy ends with a slash.
    let normalizedProxy = proxy.replace(/\/$/, "") + "/";
    finalUrl = normalizedProxy + request.url.toString();
  }

  try {
    const response = await fetchWithtimeout(finalUrl, requestOptions, timeout);
    const contentType = response.headers.get("content-type");
    let fileExtension = "";

    if (contentType) {
      if (contentType.includes("application/pdf")) {
        fileExtension = ".pdf";
      } else if (contentType.includes("image/jpeg")) {
        fileExtension = ".jpg";
      } else if (contentType.includes("image/png")) {
        fileExtension = ".png";
      } else if (contentType.includes("image/gif")) {
        fileExtension = ".gif";
      } else if (contentType.includes("image/webp")) {
        fileExtension = ".webp";
      } else if (contentType.includes("video/mpeg")) {
        fileExtension = ".mpeg";
      } else if (contentType.includes("video/mp4")) {
        fileExtension = ".mp4";
      } else if (contentType.includes("audio/mpeg")) {
        fileExtension = ".mp3";
      } else if (contentType.includes("audio/ogg")) {
        fileExtension = ".ogg";
      } else if (contentType.includes("application/octet-stream")) {
        fileExtension = ".bin";
      } else if (contentType.includes("application/zip")) {
        fileExtension = ".zip";
      }

      if (fileExtension) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        // Now the file name includes the extension
        link.setAttribute("download", `file${fileExtension}`);

        // These two lines are necessary to make the link click in Firefox
        link.style.display = "none";
        document.body.appendChild(link);

        link.click();

        // After link is clicked, it's safe to remove it.
        setTimeout(() => document.body.removeChild(link), 0);

        return response;
      } else {
        return response;
      }
    }

    return response;
  } catch (error) {
    // Re-throw RequestError instances as-is
    if (error instanceof RequestError) {
      throw error;
    }

    // Wrap unexpected errors
    throw new RequestError(
      "unknown",
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while processing the response.",
      error instanceof Error ? error : undefined
    );
  }
}

export default makeRequest;
