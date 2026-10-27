/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { Blob } from "buffer";

// eslint-disable-next-line import/no-extraneous-dependencies
import { processOpenapiFile } from "docusaurus-plugin-openapi-docs/src/openapi/openapi";
// eslint-disable-next-line import/no-extraneous-dependencies
import * as sdk from "postman-collection";

import buildPostmanRequest from "./buildPostmanRequest";

type Options = { [K in keyof Parameters<typeof buildPostmanRequest>[1]]?: any };

beforeAll(() => {
  (global as any).window = {
    location: { origin: "http://localhost:3000" },
    btoa: (value: string) => Buffer.from(value).toString("base64"),
  };
});

afterAll(() => {
  delete (global as any).window;
});

function build(options: Options = {}, request?: sdk.Request) {
  const postman =
    request ??
    new sdk.Request({ url: "http://example.com/pets/:petId", method: "GET" });
  return buildPostmanRequest(postman, {
    queryParams: [],
    pathParams: [],
    cookieParams: [],
    headerParams: [],
    contentType: "",
    accept: "",
    body: { type: "empty" },
    auth: { data: {}, options: {} },
    ...options,
  });
}

function query(options: Options) {
  return build(options)
    .url.query.all()
    .map(({ key, value }) => [key, value]);
}

function headers(options: Options) {
  return build(options)
    .headers.all()
    .map(({ key, value }) => [key, value]);
}

function pathVariable(options: Options, name = "petId") {
  return build(options).url.variables.get(name);
}

function cookie(options: Options) {
  return build(options).headers.get("Cookie");
}

describe("buildPostmanRequest", () => {
  describe("query parameters", () => {
    it.each([
      ["a plain string", "available", "available"],
      ["a number", "5", "5"],
      ["a quoted JSON string", '"abc"', '"abc"'],
      ["null", "null", "null"],
    ])(
      "keeps %s as a single value when explode is true",
      (_name, value, expected) => {
        expect(
          query({
            queryParams: [
              { name: "status", in: "query", explode: true, value },
            ],
          })
        ).toEqual([["status", expected]]);
      }
    );

    it("expands a JSON object into key=value pairs when explode is true", () => {
      expect(
        query({
          queryParams: [
            {
              name: "filter",
              in: "query",
              explode: true,
              value: '{"color":"red","size":"L"}',
            },
          ],
        })
      ).toEqual([
        ["color", "red"],
        ["size", "L"],
      ]);
    });

    it("serializes a deepObject as name[key]=value pairs", () => {
      expect(
        query({
          queryParams: [
            {
              name: "filter",
              in: "query",
              style: "deepObject",
              value: '{"color":"red"}',
            },
          ],
        })
      ).toEqual([["filter[color]", "red"]]);
    });

    it.each([
      ["spaceDelimited", false, [["tags", "a b"]]],
      ["pipeDelimited", false, [["tags", "a|b"]]],
      [
        "form",
        true,
        [
          ["tags", "a"],
          ["tags", "b"],
        ],
      ],
      ["form", false, [["tags", "a,b"]]],
    ])(
      "serializes an array with style %s and explode %s",
      (style, explode, expected) => {
        expect(
          query({
            queryParams: [
              {
                name: "tags",
                in: "query",
                style: style as any,
                explode,
                value: ["a", "b"],
              },
            ],
          })
        ).toEqual(expected);
      }
    );

    it("adds a valueless parameter when allowEmptyValue is set", () => {
      expect(
        query({
          queryParams: [
            {
              name: "extended",
              in: "query",
              allowEmptyValue: true,
              value: "true",
            },
          ],
        })
      ).toEqual([["extended", null]]);
    });

    it("skips parameters without a value", () => {
      expect(
        query({ queryParams: [{ name: "status", in: "query", value: "" }] })
      ).toEqual([]);
    });
  });

  describe("header parameters", () => {
    it("sets Content-Type and Accept", () => {
      expect(
        headers({ contentType: "application/json", accept: "text/plain" })
      ).toEqual([
        ["Content-Type", "application/json"],
        ["Accept", "text/plain"],
      ]);
    });

    it.each([
      ["a plain string", "abc"],
      ["null", "null"],
    ])("keeps %s as a single value", (_name, value) => {
      expect(
        headers({
          headerParams: [
            {
              name: "X-Value",
              in: "header",
              style: "simple",
              explode: true,
              value,
            },
          ],
        })
      ).toEqual([["X-Value", value]]);
    });

    it.each([
      [
        true,
        [
          ["X-Obj", "a=1"],
          ["X-Obj", "b=2"],
        ],
      ],
      [false, [["X-Obj", "a,1,b,2"]]],
    ])(
      "serializes a simple-style object with explode %s",
      (explode, expected) => {
        expect(
          headers({
            headerParams: [
              {
                name: "X-Obj",
                in: "header",
                style: "simple",
                explode,
                value: '{"a":1,"b":2}',
              },
            ],
          })
        ).toEqual(expected);
      }
    );

    it.each([
      [
        true,
        [
          ["X-List", "a"],
          ["X-List", "b"],
        ],
      ],
      [false, [["X-List", "a,b"]]],
    ])(
      "serializes a simple-style array with explode %s",
      (explode, expected) => {
        expect(
          headers({
            headerParams: [
              {
                name: "X-List",
                in: "header",
                style: "simple",
                explode,
                value: ["a", "b"],
              },
            ],
          })
        ).toEqual(expected);
      }
    );
  });

  describe("path parameters", () => {
    it.each([
      ["simple", "1,2"],
      ["label", ".1.2"],
      ["matrix", ";petId=1;2"],
    ])("serializes an array with style %s", (style, expected) => {
      expect(
        pathVariable({
          pathParams: [
            {
              name: "petId",
              in: "path",
              style: style as any,
              value: ["1", "2"],
            },
          ],
        })
      ).toBe(expected);
    });

    it.each([
      ["simple", "a=1,b=2"],
      ["matrix", ";a=1;b=2"],
    ])("serializes an object with style %s", (style, expected) => {
      expect(
        pathVariable({
          pathParams: [
            {
              name: "petId",
              in: "path",
              style: style as any,
              value: '{"a":1,"b":2}',
            },
          ],
        })
      ).toBe(expected);
    });

    it("keeps a scalar value", () => {
      expect(
        pathVariable({
          pathParams: [{ name: "petId", in: "path", value: "42" }],
        })
      ).toBe("42");
    });
  });

  describe("cookie parameters", () => {
    it("sets a scalar cookie", () => {
      expect(
        cookie({
          cookieParams: [{ name: "session", in: "cookie", value: "abc" }],
        })
      ).toBe("session=abc");
    });

    it.each([
      [true, "a=1; b=2"],
      [false, "obj=a%2C1%2Cb%2C2"],
    ])(
      "serializes a form-style object with explode %s",
      (explode, expected) => {
        expect(
          cookie({
            cookieParams: [
              {
                name: "obj",
                in: "cookie",
                style: "form",
                explode,
                value: '{"a":1,"b":2}',
              },
            ],
          })
        ).toBe(expected);
      }
    );
  });

  describe("authentication", () => {
    function withAuth(scheme: any, data: Record<string, string | undefined>) {
      return {
        auth: {
          data: { key: data },
          options: { selected: [{ key: "key", scopes: [], ...scheme }] },
          selected: "selected",
        },
      };
    }

    it("adds a bearer token", () => {
      expect(
        headers(withAuth({ type: "http", scheme: "bearer" }, { token: "t0k" }))
      ).toEqual([["Authorization", "Bearer t0k"]]);
    });

    it("adds a bearer placeholder when no token is set", () => {
      expect(headers(withAuth({ type: "http", scheme: "bearer" }, {}))).toEqual(
        [["Authorization", "Bearer <TOKEN>"]]
      );
    });

    it("adds basic credentials", () => {
      expect(
        headers(
          withAuth(
            { type: "http", scheme: "basic" },
            { username: "user", password: "pass" }
          )
        )
      ).toEqual([["Authorization", "Basic dXNlcjpwYXNz"]]);
    });

    it("skips basic credentials when the password is missing", () => {
      expect(
        headers(
          withAuth({ type: "http", scheme: "basic" }, { username: "user" })
        )
      ).toEqual([]);
    });

    it("adds an API key in a header, a query parameter, and a cookie", () => {
      const request = build(
        withAuth(
          { type: "apiKey", in: "header", name: "X-Key" },
          {
            apiKey: "k",
          }
        )
      );
      expect(request.headers.get("X-Key")).toBe("k");

      expect(
        query(
          withAuth(
            { type: "apiKey", in: "query", name: "api_key" },
            {
              apiKey: "k",
            }
          )
        )
      ).toEqual([["api_key", "k"]]);

      expect(
        cookie(
          withAuth(
            { type: "apiKey", in: "cookie", name: "key" },
            {
              apiKey: "k",
            }
          )
        )
      ).toBe("key=k");
    });

    it("adds an API key placeholder when no key is set", () => {
      expect(
        headers(withAuth({ type: "apiKey", in: "header", name: "X-Key" }, {}))
      ).toEqual([["X-Key", "<X-Key>"]]);
    });
  });

  describe("server", () => {
    it("uses the window origin when no server is given", () => {
      expect(build().url.host).toEqual(["http://localhost:3000"]);
    });

    it("substitutes server variable defaults and drops a trailing slash", () => {
      const request = build({
        server: {
          url: "https://{region}.example.com/",
          variables: { region: { default: "us" } },
        },
      });
      expect(request.url.host).toEqual(["https://us.example.com"]);
    });
  });

  describe("body", () => {
    const withBody = (mode: string) =>
      new sdk.Request({
        url: "http://example.com/pets",
        method: "POST",
        body: { mode, raw: "", urlencoded: [], formdata: [] } as any,
      });

    it("removes the body when it is empty", () => {
      expect(build({}, withBody("raw")).body).toBeUndefined();
    });

    it("sets a raw body", () => {
      const request = build(
        {
          body: { type: "raw", content: { type: "string", value: '{"a":1}' } },
        },
        withBody("raw")
      );
      expect(request.body?.raw).toBe('{"a":1}');
    });

    it("sets urlencoded fields and skips empty ones", () => {
      const request = build(
        {
          body: {
            type: "form",
            content: {
              name: { type: "string", value: "Rex" },
              tag: { type: "string", value: "" },
            },
          },
        },
        withBody("urlencoded")
      );
      expect(
        request.body?.urlencoded?.all().map(({ key, value }) => [key, value])
      ).toEqual([["name", "Rex"]]);
    });

    it("applies the encoding content type to form-data parts", () => {
      const request = build(
        {
          body: {
            type: "form",
            content: { meta: { type: "string", value: "{}" } },
          },
          encoding: { meta: { contentType: "application/json, text/plain" } },
        },
        withBody("formdata")
      );
      const [part] = request.body?.formdata?.all() as any[];
      expect([part.key, part.value, part.contentType]).toEqual([
        "meta",
        "{}",
        "application/json",
      ]);
    });

    describe("selected form content type", () => {
      const multipart = "multipart/form-data";
      const urlencoded = "application/x-www-form-urlencoded";
      const fields = {
        type: "form",
        content: { name: { type: "string", value: "Rex" } },
      };
      const file = {
        src: "/path/to/pets.csv",
        content: new Blob(["id,name\n1,Rex\n"], { type: "text/csv" }),
      };
      const formFields = (request: sdk.Request) =>
        request.body?.[request.body.mode as "formdata" | "urlencoded"]
          ?.all()
          .map(({ key, value }) => [key, value]);
      const formRequest = (mode: string) =>
        new sdk.Request({
          url: "http://example.com/pets",
          method: "POST",
          body: { mode },
        });

      it.each([
        [multipart, urlencoded],
        [urlencoded, multipart],
      ])(
        "uploads a file with mixed types in order %s, %s",
        async (first, second) => {
          const formSchema = {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                file: { type: "string", format: "binary" },
              },
            },
          };
          const [items] = await processOpenapiFile(
            {
              openapi: "3.0.0",
              info: { title: "Mixed forms", version: "1.0.0" },
              paths: {
                "/pets": {
                  post: {
                    operationId: "uploadPets",
                    requestBody: {
                      content: { [first]: formSchema, [second]: formSchema },
                    },
                    responses: { "200": { description: "OK" } },
                  },
                },
              },
            } as any,
            { specPath: "unused", outputDir: "unused" },
            {}
          );
          const original = (items.find((item) => item.type === "api") as any)
            .api.postman as sdk.Request;
          const before = original.toJSON();
          const request = build(
            {
              contentType: multipart,
              body: {
                type: "form",
                content: {
                  ...fields.content,
                  file: { type: "file", value: file },
                },
              },
            },
            original
          );
          expect(request.body?.mode).toBe("formdata");
          expect(formFields(request)).toEqual([
            ["name", "Rex"],
            ["file", file],
          ]);
          expect(original.toJSON()).toEqual(before);
        }
      );

      it.each([
        ["urlencoded", multipart, "formdata"],
        ["formdata", urlencoded, "urlencoded"],
        ["raw", multipart, "formdata"],
        ["raw", urlencoded, "urlencoded"],
      ])(
        "switches %s to %s while preserving body metadata",
        (from, contentType, mode) => {
          const original = new sdk.Request({
            url: "http://example.com/pets",
            method: "POST",
            body: {
              mode: from,
              [from]:
                from === "raw"
                  ? "old raw body"
                  : [{ key: "old", value: "stale" }],
              options: { raw: { language: "json" } },
              disabled: true,
            } as any,
          });
          const before = original.toJSON();
          const request = build({ contentType, body: fields }, original);
          expect(request.body?.mode).toBe(mode);
          expect(formFields(request)).toEqual([["name", "Rex"]]);
          expect(
            request.body?.[mode === "formdata" ? "urlencoded" : "formdata"]
          ).toBeUndefined();
          expect(request.body?.raw).toBeUndefined();
          expect(request.body?.toJSON()).toMatchObject({
            options: { raw: { language: "json" } },
            disabled: true,
          });
          expect(original.toJSON()).toEqual(before);
        }
      );

      it("can switch back to urlencoded and rebuild from the original request", () => {
        const original = formRequest("urlencoded");
        const before = original.toJSON();
        const uploaded = build(
          {
            contentType: multipart,
            body: {
              type: "form",
              content: {
                ...fields.content,
                file: { type: "file", value: file },
              },
            },
          },
          original
        );
        const returned = build(
          { contentType: urlencoded, body: fields },
          uploaded
        );
        const repeated = build(
          { contentType: urlencoded, body: fields },
          original
        );
        expect(uploaded.body?.mode).toBe("formdata");
        expect(uploaded.body?.formdata?.all()).toHaveLength(2);
        expect(returned.body?.mode).toBe("urlencoded");
        expect(returned.body?.formdata).toBeUndefined();
        expect(formFields(returned)).toEqual([["name", "Rex"]]);
        expect(formFields(repeated)).toEqual([["name", "Rex"]]);
        expect(original.toJSON()).toEqual(before);
      });

      it("keeps individual files, file arrays, and per-part encodings", () => {
        const second = {
          src: "/path/to/more.csv",
          content: new Blob(["id,name\n2,Spot\n"], { type: "text/csv" }),
        };
        const request = build(
          {
            contentType: multipart,
            body: {
              type: "form",
              content: {
                file: { type: "file", value: file },
                files: { type: "file[]", value: [file, second] },
                meta: { type: "string", value: "{}" },
              },
            },
            encoding: {
              file: { contentType: "text/csv" },
              files: { contentType: "text/csv, text/plain" },
              meta: { contentType: "application/json" },
            },
          },
          formRequest("urlencoded")
        );
        expect(request.body?.mode).toBe("formdata");
        expect(request.body?.formdata?.all()).toMatchObject([
          { key: "file", value: file, contentType: "text/csv" },
          { key: "files", value: file, contentType: "text/csv" },
          {
            key: "files",
            value: second,
            contentType: "text/csv",
          },
          {
            key: "meta",
            value: "{}",
            contentType: "application/json",
          },
        ]);
      });

      it("keeps metadata when the mode is already correct", () => {
        const original = formRequest("formdata");
        original.body?.update({
          mode: "formdata",
          options: { raw: { language: "json" } },
          disabled: true,
        } as any);
        const request = build(
          { contentType: multipart, body: fields },
          original
        );
        expect(formFields(request)).toEqual([["name", "Rex"]]);
        expect(request.body?.toJSON()).toMatchObject({
          options: { raw: { language: "json" } },
          disabled: true,
        });
      });

      it.each([
        ["urlencoded", multipart],
        ["formdata", urlencoded],
      ])(
        "keeps an empty %s body absent when selecting %s",
        (mode, contentType) => {
          expect(
            build({ contentType }, formRequest(mode)).body
          ).toBeUndefined();
        }
      );

      it("preserves existing encoded placeholders before files are uploaded", () => {
        const original = new sdk.Request({
          url: "http://example.com/pets",
          body: { mode: "formdata", formdata: [{ key: "meta", value: "{}" }] },
        });
        const request = build(
          {
            contentType: multipart,
            encoding: { meta: { contentType: "application/json, text/plain" } },
          },
          original
        );
        expect(request.body?.mode).toBe("formdata");
        expect(request.body?.formdata?.all()).toMatchObject([
          { key: "meta", value: "{}", contentType: "application/json" },
        ]);
      });

      it("does not create a body when the original request has none", () => {
        expect(
          build({ contentType: multipart, body: fields }).body
        ).toBeUndefined();
      });

      it.each(["", "application/json", "multipart/form-data; charset=utf-8"])(
        "keeps the original form mode for unsupported selection %s",
        (contentType) => {
          const request = build(
            { contentType, body: fields },
            formRequest("urlencoded")
          );
          expect(request.body?.mode).toBe("urlencoded");
          expect(formFields(request)).toEqual([["name", "Rex"]]);
        }
      );

      it.each([
        ["formdata", urlencoded],
        ["urlencoded", multipart],
      ])(
        "keeps raw strings when selecting a form type from %s",
        (mode, contentType) => {
          const request = build(
            {
              contentType,
              body: {
                type: "raw",
                content: { type: "string", value: "raw text" },
              },
            },
            formRequest(mode)
          );
          expect(request.body?.mode).toBe("raw");
          expect(request.body?.raw).toBe("raw text");
        }
      );

      it("keeps raw file uploads", () => {
        const request = build(
          {
            contentType: multipart,
            body: { type: "raw", content: { type: "file", value: file } },
          },
          formRequest("urlencoded")
        );
        expect(request.body?.mode).toBe("file");
        expect(request.body?.file).toEqual({ src: file.src });
      });
    });
  });
});
