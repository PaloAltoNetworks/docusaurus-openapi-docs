/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

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

async function generatedRequest(template: string, names: string[]) {
  const [items] = await processOpenapiFile(
    {
      openapi: "3.0.0",
      info: { title: "Path API", version: "1.0.0" },
      paths: {
        [template]: {
          get: {
            operationId: "getPath",
            parameters: names.map((name) => ({
              name,
              in: "path",
              required: true,
              schema: { type: "string" },
            })),
            responses: { "200": { description: "OK" } },
          },
        },
      },
    } as any,
    { specPath: "dummy", outputDir: "build" } as any,
    {} as any
  );
  const apiItem = items.find((item) => item.type === "api") as any;
  expect(apiItem?.api.postman).toBeInstanceOf(sdk.Request);
  return apiItem.api.postman as sdk.Request;
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
    describe("embedded OpenAPI parameters", () => {
      it.each([
        ["/records/{id}:publish", { id: "9527" }, "/records/9527:publish"],
        [
          "/records/{id}:publish.json",
          { id: "9527" },
          "/records/9527:publish.json",
        ],
        [
          "/files/{name}.{ext}",
          { name: "report", ext: "pdf" },
          "/files/report.pdf",
        ],
        ["/records/{id}{part}", { id: "one", part: "two" }, "/records/onetwo"],
        [
          "/records/{id}:{part}",
          { id: "one", part: "two" },
          "/records/one:two",
        ],
        [
          "/records/{id:publish}:cancel",
          { "id:publish": "exact" },
          "/records/exact:cancel",
        ],
        [
          "/records/{id}/{id2}:publish",
          { id: "one", id2: "two" },
          "/records/one/two:publish",
        ],
        [
          "/records/{id}/{id}:publish",
          { id: "one" },
          "/records/one/one:publish",
        ],
        ["/records/prefix{id}", { id: "value" }, "/records/prefixvalue"],
        [
          "/records/{id}:publish",
          { id: "\u03b1$&" },
          "/records/\u03b1$&:publish",
        ],
        [
          "/records/{id}:publish",
          { id: "{{other}}" },
          "/records/{{other}}:publish",
        ],
        ["/User/{id}/page:get", { id: "9527" }, "/User/9527/page:get"],
        ["/records/{id:publish}", { "id:publish": "exact" }, "/records/exact"],
      ] as [string, Record<string, string>, string][])(
        "resolves %s through the converter and SDK",
        async (template, values, expected) => {
          const request = await generatedRequest(template, Object.keys(values));
          expect(
            build(
              {
                pathParams: Object.entries(values).map(([name, value]) => ({
                  name,
                  in: "path",
                  value,
                })),
              },
              request
            ).url.getPath()
          ).toBe(expected);
        }
      );

      it("does not re-interpret a value starting with a colon as another parameter", async () => {
        const request = await generatedRequest(
          "/records/{other}/{id}:publish",
          ["other", "id"]
        );
        expect(
          build(
            {
              pathParams: [
                { name: "other", in: "path", value: "different" },
                { name: "id", in: "path", value: ":other" },
              ],
            },
            request
          ).url.getPath()
        ).toBe("/records/different/:other:publish");
      });

      it("preserves missing values in embedded parameters", async () => {
        const request = await generatedRequest("/records/{id}:publish", ["id"]);
        expect(
          build(
            { pathParams: [{ name: "id", in: "path", value: "" }] },
            request
          ).url.getPath()
        ).toBe("/records/{{id}}:publish");
      });

      it("preserves an unresolved adjacent parameter", async () => {
        const request = await generatedRequest("/records/{id}{part}", [
          "id",
          "part",
        ]);
        expect(
          build(
            { pathParams: [{ name: "id", in: "path", value: "one" }] },
            request
          ).url.getPath()
        ).toBe("/records/one{{part}}");
      });

      it.each([[[]], ["{}"]])(
        "allows empty serialized values: %p",
        async (value) => {
          const request = await generatedRequest("/records/{a}{b}", ["a", "b"]);
          expect(
            build(
              {
                pathParams: [
                  { name: "a", in: "path", value },
                  { name: "b", in: "path", value },
                ],
              },
              request
            ).url.getPath()
          ).toBe("/records/");
        }
      );

      it("avoids internal variable collisions", async () => {
        const names = ["__openapi_path_2", "__openapi_path_2_", "id"];
        const request = await generatedRequest(
          "/{__openapi_path_2}/{__openapi_path_2_}/{id}:publish",
          names
        );
        expect(
          build(
            {
              pathParams: names.map((name, index) => ({
                name,
                in: "path",
                value: String(index),
              })),
            },
            request
          ).url.getPath()
        ).toBe("/0/1/2:publish");
      });

      it("keeps repeated builds independent and leaves the original request unchanged", async () => {
        const request = await generatedRequest("/records/{id}:publish", ["id"]);
        request.body = new sdk.RequestBody({ mode: "raw", raw: "original" });
        const original = request.toJSON();
        const first = build(
          {
            pathParams: [{ name: "id", in: "path", value: "first" }],
            body: { type: "raw", content: { type: "string", value: "new" } },
          },
          request
        );
        const second = build(
          { pathParams: [{ name: "id", in: "path", value: "second" }] },
          request
        );
        expect(first.url.getPath()).toBe("/records/first:publish");
        expect(second.url.getPath()).toBe("/records/second:publish");
        expect(request.toJSON()).toEqual(original);
      });

      it("keeps the server, port, query, and fragment outside path substitution", async () => {
        const request = await generatedRequest("/records/{id}:publish", ["id"]);
        request.url.hash = "{{id}}:publish";
        expect(
          build(
            {
              server: { url: "https://api.example.com:8443/base" },
              pathParams: [{ name: "id", in: "path", value: "9527" }],
              queryParams: [{ name: "id", in: "query", value: "{{id}}" }],
            },
            request
          ).url.toString()
        ).toBe(
          "https://api.example.com:8443/base/records/9527:publish?id={{id}}#{{id}}:publish"
        );
      });
    });

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
  });
});
