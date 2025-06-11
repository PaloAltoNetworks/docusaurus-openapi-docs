/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import CodeSamples from "@theme/CodeSamples";
import Markdown from "@theme/Markdown";
import TabItem from "@theme/TabItem";
import {
  sampleFromSchema,
  ExampleContext,
} from "docusaurus-plugin-openapi-docs/lib/openapi/createSchemaExample";
import format from "xml-formatter";

export function json2xml(o: Record<string, any>, tab: string): string {
  const toXml = (v: any, name: string, ind: string): string => {
    let xml = "";
    if (v instanceof Array) {
      for (let i = 0, n = v.length; i < n; i++) {
        xml += ind + toXml(v[i], name, ind + "\t") + "\n";
      }
    } else if (typeof v === "object") {
      let hasChild = false;
      xml += ind + "<" + name;
      for (const m in v) {
        if (m.charAt(0) === "@") {
          xml += " " + m.substr(1) + '="' + v[m].toString() + '"';
        } else {
          hasChild = true;
        }
      }
      xml += hasChild ? ">" : "/>";
      if (hasChild) {
        for (const m2 in v) {
          if (m2 === "#text") xml += v[m2];
          else if (m2 === "#cdata") xml += "<![CDATA[" + v[m2] + "]]>";
          else if (m2.charAt(0) !== "@") xml += toXml(v[m2], m2, ind + "\t");
        }
        xml +=
          (xml.charAt(xml.length - 1) === "\n" ? ind : "") + "</" + name + ">";
      }
    } else {
      xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
    }
    return xml;
  };
  let xml = "";
  for (const m3 in o) xml += toXml(o[m3], m3, "");
  return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
}

export function getLanguageFromMimeType(mimeType: string): string {
  let language = "shell";
  if (mimeType.endsWith("json")) language = "json";
  if (mimeType.endsWith("xml")) language = "xml";
  return language;
}

export interface MimeExampleProps {
  example: any;
  mimeType: string;
}

export const MimeExample: React.FC<MimeExampleProps> = ({
  example,
  mimeType,
}) => {
  const language = getLanguageFromMimeType(mimeType);

  const isObject = typeof example === "object";
  const exampleContent = isObject ? JSON.stringify(example, null, 2) : example;

  return (
    // @ts-ignore
    <TabItem label="Example" value="Example">
      {example.summary && (
        <Markdown className="openapi-example__summary">
          {example.summary}
        </Markdown>
      )}
      <CodeSamples example={exampleContent} language={language} />
    </TabItem>
  );
};

export interface MimeExamplesProps {
  examples: any;
  mimeType: string;
}

export const MimeExamples: React.FC<MimeExamplesProps> = ({
  examples,
  mimeType,
}): any => {
  const language = getLanguageFromMimeType(mimeType);

  // Map examples to an array of TabItem elements
  const examplesArray = Object.entries(examples).map(
    ([exampleName, exampleValue]: any) => {
      const isObject = typeof exampleValue.value === "object";
      const exampleContent = isObject
        ? JSON.stringify(exampleValue.value, null, 2)
        : exampleValue.value;

      return (
        // @ts-ignore
        <TabItem label={exampleName} value={exampleName} key={exampleName}>
          {exampleValue.summary && (
            <Markdown className="openapi-example__summary">
              {exampleValue.summary}
            </Markdown>
          )}
          <CodeSamples example={exampleContent} language={language} />
        </TabItem>
      );
    }
  );

  return examplesArray;
};

export interface SchemaExampleProps {
  example: any;
  mimeType: string;
}

export const SchemaExample: React.FC<SchemaExampleProps> = ({
  example,
  mimeType,
}) => {
  const language = getLanguageFromMimeType(mimeType);

  const isObject = typeof example === "object";
  const exampleContent = isObject ? JSON.stringify(example, null, 2) : example;

  return (
    // @ts-ignore
    <TabItem label="Example" value="Example">
      {example.summary && (
        <Markdown className="openapi-example__summary">
          {example.summary}
        </Markdown>
      )}
      <CodeSamples example={exampleContent} language={language} />
    </TabItem>
  );
};

export interface SchemaExamplesProps {
  examples: any[];
  mimeType: string;
}

export const SchemaExamples: React.FC<SchemaExamplesProps> = ({
  examples,
  mimeType,
}) => {
  const language = getLanguageFromMimeType(mimeType);

  // Map examples to an array of TabItem elements
  const examplesArray = examples.map((example: any, i: number) => {
    const exampleName = `Example ${i + 1}`;
    const isObject = typeof example === "object";
    const exampleContent = isObject
      ? JSON.stringify(example, null, 2)
      : example;

    return (
      // @ts-ignore
      <TabItem label={exampleName} value={exampleName} key={exampleName}>
        <CodeSamples example={exampleContent} language={language} />
      </TabItem>
    );
  });

  return examplesArray;
};

export interface ExampleFromSchemaProps {
  schema: any;
  mimeType: string;
  context: ExampleContext;
}

export const ExampleFromSchema: React.FC<ExampleFromSchemaProps> = ({
  schema,
  mimeType,
  context,
}) => {
  const example = sampleFromSchema(schema, context);

  if (mimeType.endsWith("xml")) {
    let exampleObject;
    try {
      exampleObject = JSON.parse(JSON.stringify(example));
    } catch {
      return null;
    }

    if (typeof exampleObject === "object") {
      let xmlExample;
      try {
        xmlExample = format(json2xml(exampleObject, ""), {
          indentation: "  ",
          lineSeparator: "\n",
          collapseContent: true,
        });
      } catch {
        const xmlExampleWithRoot = { root: exampleObject };
        try {
          xmlExample = format(json2xml(xmlExampleWithRoot, ""), {
            indentation: "  ",
            lineSeparator: "\n",
            collapseContent: true,
          });
        } catch {
          xmlExample = json2xml(exampleObject, "");
        }
      }
      return (
        // @ts-ignore
        <TabItem label="Example (auto)" value="Example (auto)">
          <CodeSamples example={xmlExample} language="xml" />
        </TabItem>
      );
    }
  }

  if (typeof example === "object" || typeof example === "string") {
    return (
      // @ts-ignore
      <TabItem label="Example (auto)" value="Example (auto)">
        <CodeSamples
          example={JSON.stringify(example, null, 2)}
          language="json"
        />
      </TabItem>
    );
  }

  return null;
};
