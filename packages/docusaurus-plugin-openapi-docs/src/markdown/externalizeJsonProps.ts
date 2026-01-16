/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/**
 * This module provides utilities for externalizing large JSON props in MDX files.
 *
 * The motivation is to improve MDX compilation performance. When large JSON objects
 * are embedded directly as JSX props, MDX needs to parse them into AST and then
 * serialize them back. By externalizing to JSON files and using require(), the
 * MDX compiler can skip this expensive processing.
 *
 * @see https://github.com/facebook/docusaurus/discussions/11664
 */

export interface ExternalizedJsonFile {
  /** The filename for the JSON file (without path) */
  filename: string;
  /** The JSON content to write */
  content: string;
}

export interface ExternalizeResult {
  /** The transformed MDX content with require() statements */
  mdx: string;
  /** List of JSON files that need to be written */
  jsonFiles: ExternalizedJsonFile[];
}

/**
 * Components and their props that should be externalized.
 * These are the components that typically receive large JSON objects.
 */
const COMPONENTS_TO_EXTERNALIZE = [
  { component: "StatusCodes", prop: "responses" },
  { component: "ParamsDetails", prop: "parameters" },
  { component: "RequestSchema", prop: "body" },
  { component: "Schema", prop: "schema" },
  { component: "SchemaItem", prop: "schema" },
];

/**
 * Minimum size (in characters) for a JSON prop to be externalized.
 * Props smaller than this threshold will remain inline.
 */
const MIN_SIZE_THRESHOLD = 500;

/**
 * Extracts the content between balanced braces starting at a given position.
 * Returns the content (without outer braces) and the end position.
 */
function extractBalancedBraces(
  str: string,
  startIndex: number
): { content: string; endIndex: number } | null {
  if (str[startIndex] !== "{") {
    return null;
  }

  let depth = 0;
  let inString = false;
  let stringChar = "";
  let escaped = false;

  for (let i = startIndex; i < str.length; i++) {
    const char = str[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (!inString) {
      if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
      } else if (char === "{") {
        depth++;
      } else if (char === "}") {
        depth--;
        if (depth === 0) {
          // Found the matching closing brace
          return {
            content: str.substring(startIndex + 1, i),
            endIndex: i,
          };
        }
      }
    } else {
      if (char === stringChar) {
        inString = false;
      }
    }
  }

  return null; // Unbalanced braces
}

/**
 * Externalizes large JSON props from MDX content.
 * Uses brace-counting to correctly handle deeply nested JSON.
 *
 * @param mdx - The original MDX content
 * @param baseFilename - The base filename (without extension) for the MDX file
 * @returns The transformed MDX and list of JSON files to write
 */
export function externalizeJsonPropsSimple(
  mdx: string,
  baseFilename: string
): ExternalizeResult {
  const jsonFiles: ExternalizedJsonFile[] = [];
  let transformedMdx = mdx;

  for (const { component, prop } of COMPONENTS_TO_EXTERNALIZE) {
    // Find pattern: prop={
    const propPattern = new RegExp(`${prop}=\\{`, "g");
    let match;

    // Keep searching until no more matches (need to restart after each replacement)
    let searchStart = 0;
    while (true) {
      propPattern.lastIndex = searchStart;
      match = propPattern.exec(transformedMdx);

      if (!match) break;

      const propStart = match.index;
      const braceStart = propStart + prop.length + 1; // Position of '{'

      // Extract the balanced content
      const extracted = extractBalancedBraces(transformedMdx, braceStart);
      if (!extracted) {
        searchStart = braceStart + 1;
        continue;
      }

      const jsonContent = extracted.content;
      const propEnd = extracted.endIndex + 1; // Position after '}'

      // Skip small or non-JSON content
      const trimmed = jsonContent.trim();
      if (
        jsonContent.length < MIN_SIZE_THRESHOLD ||
        trimmed === "undefined" ||
        trimmed === "null" ||
        trimmed === "true" ||
        trimmed === "false" ||
        trimmed.startsWith("require(")
      ) {
        searchStart = propEnd;
        continue;
      }

      // Check if this is within the target component
      // Look backwards for the component tag
      const beforeProp = transformedMdx.substring(0, propStart);
      const componentTagPattern = new RegExp(`<${component}[\\s\\S]*$`);
      if (!componentTagPattern.test(beforeProp)) {
        searchStart = propEnd;
        continue;
      }

      // Generate filename
      const existingCount = jsonFiles.filter((f) =>
        f.filename.includes(`.${prop}`)
      ).length;
      const suffix = existingCount > 0 ? `.${existingCount + 1}` : "";
      const jsonFilename = `${baseFilename}.${prop}${suffix}.json`;

      // Store the JSON file
      jsonFiles.push({
        filename: jsonFilename,
        content: jsonContent.trim(),
      });

      // Replace the prop value with require()
      const newProp = `${prop}={require("./${jsonFilename}")}`;

      transformedMdx =
        transformedMdx.substring(0, propStart) +
        newProp +
        transformedMdx.substring(propEnd);

      // Continue searching after the replacement
      searchStart = propStart + newProp.length;
    }
  }

  return {
    mdx: transformedMdx,
    jsonFiles,
  };
}
