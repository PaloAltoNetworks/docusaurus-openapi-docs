/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/**
 * Represents an external JSON file to be written alongside the MDX.
 */
export interface ExternalFile {
  /** The filename for the JSON file (relative to outputDir) */
  filename: string;
  /** The JSON content to write */
  content: string;
}

/**
 * Result of MDX generation that includes both the MDX string
 * and any external files that need to be written.
 */
export interface MdxResult {
  /** The generated MDX content */
  mdx: string;
  /** External JSON files to write */
  externalFiles: ExternalFile[];
}

/**
 * Context for externalization during MDX generation.
 * Set this before calling render() to enable externalization.
 */
interface ExternalizationContext {
  /** Base filename for external files (e.g., "add-pet" for "add-pet.api.mdx") */
  baseFilename: string;
  /** Whether externalization is enabled */
  enabled: boolean;
  /** Counter for generating unique filenames per component type */
  componentCounters: Record<string, number>;
  /** Collected external files during generation */
  files: ExternalFile[];
}

/**
 * Module-level externalization context.
 * Set via setExternalizationContext() before generating MDX.
 */
let externalizationContext: ExternalizationContext | null = null;

/**
 * Components whose props should be externalized to separate JSON files.
 * These are the components that typically receive large JSON objects.
 */
const EXTERNALIZABLE_COMPONENTS = new Set([
  "StatusCodes",
  "ParamsDetails",
  "RequestSchema",
  "Schema",
  "SchemaItem",
]);

/**
 * Sets up the externalization context for MDX generation.
 * Call this before render() to enable externalization of large JSON props.
 *
 * @param baseFilename - Base filename for the MDX file (without extension)
 * @param enabled - Whether externalization should be enabled
 */
export function setExternalizationContext(
  baseFilename: string,
  enabled: boolean
): void {
  externalizationContext = {
    baseFilename,
    enabled,
    componentCounters: {},
    files: [],
  };
}

/**
 * Clears the externalization context and returns collected files.
 * Call this after render() to get the external files to write.
 *
 * @returns Array of external files collected during generation
 */
export function clearExternalizationContext(): ExternalFile[] {
  const files = externalizationContext?.files ?? [];
  externalizationContext = null;
  return files;
}

/**
 * Checks if externalization is currently enabled.
 */
export function isExternalizationEnabled(): boolean {
  return externalizationContext?.enabled ?? false;
}

/**
 * Children in the plugin does not accept DOM elements, when compared with Children in the theme.
 * It is designed for rendering HTML as strings.
 */
export type Children = string | undefined | (string | string[] | undefined)[];

export type Props = Record<string, any> & { children?: Children };

export type Options = { inline?: boolean };

/**
 * Creates a JSX component string with the given tag, props, and options.
 * When externalization context is set and enabled, props for eligible
 * components are externalized to a single JSON file and spread.
 */
export function create(
  tag: string,
  props: Props,
  options: Options = {}
): string {
  const { children, ...rest } = props;

  let propString = "";

  // Check if this component's props should be externalized
  if (shouldExternalizeComponent(tag, rest)) {
    const filename = generateExternalFilename(tag);
    const content = JSON.stringify(rest);

    // Add to external files
    externalizationContext!.files.push({
      filename,
      content,
    });

    // Use spread syntax with require
    propString = `\n  {...require("./${filename}")}`;
  } else {
    // Inline props as usual
    for (const [key, value] of Object.entries(rest)) {
      propString += `\n  ${key}={${JSON.stringify(value)}}`;
    }
  }

  let indentedChildren = render(children).replace(/^/gm, "  ");

  if (options.inline) {
    propString += `\n  children={${JSON.stringify(children)}}`;
    indentedChildren = "";
  }

  propString += propString ? "\n" : "";
  indentedChildren += indentedChildren ? "\n" : "";
  return `<${tag}${propString}>\n${indentedChildren}</${tag}>`;
}

/**
 * Determines if a component's props should be externalized.
 */
function shouldExternalizeComponent(
  tag: string,
  props: Record<string, any>
): boolean {
  if (!externalizationContext?.enabled) {
    return false;
  }

  if (!EXTERNALIZABLE_COMPONENTS.has(tag)) {
    return false;
  }

  // Don't externalize if props are empty or only contain undefined/null
  const hasContent = Object.values(props).some(
    (v) => v !== undefined && v !== null
  );
  if (!hasContent) {
    return false;
  }

  return true;
}

/**
 * Generates a unique filename for an externalized component's props.
 */
function generateExternalFilename(componentName: string): string {
  if (!externalizationContext) {
    throw new Error("Externalization context not set");
  }

  const count =
    (externalizationContext.componentCounters[componentName] ?? 0) + 1;
  externalizationContext.componentCounters[componentName] = count;

  const suffix = count > 1 ? `.${count}` : "";
  return `${externalizationContext.baseFilename}.${componentName}${suffix}.json`;
}

export function guard<T>(
  value: T | undefined,
  cb: (value: T) => Children
): string {
  if (!!value || value === 0) {
    const children = cb(value);
    return render(children);
  }
  return "";
}

export function render(children: Children): string {
  if (Array.isArray(children)) {
    const filteredChildren = children.filter((c) => c !== undefined);
    return filteredChildren
      .map((i: any) => (Array.isArray(i) ? i.join("") : i))
      .join("");
  }
  return children ?? "";
}

// Regex to selectively URL-encode '>' and '<' chars
export const lessThan =
  /<=?(?!(=|button|\s?\/button|code|\s?\/code|details|\s?\/details|summary|\s?\/summary|hr|\s?\/hr|br|\s?\/br|span|\s?\/span|strong|\s?\/strong|small|\s?\/small|table|\s?\/table|thead|\s?\/thead|tbody|\s?\/tbody|td|\s?\/td|tr|\s?\/tr|th|\s?\/th|h1|\s?\/h1|h2|\s?\/h2|h3|\s?\/h3|h4|\s?\/h4|h5|\s?\/h5|h6|\s?\/h6|title|\s?\/title|p|\s?\/p|em|\s?\/em|b|\s?\/b|i|\s?\/i|u|\s?\/u|strike|\s?\/strike|bold|\s?\/bold|a|\s?\/a|table|\s?\/table|li|\s?\/li|ol|\s?\/ol|ul|\s?\/ul|img|\s?\/img|svg|\s?\/svg|div|\s?\/div|center|\s?\/center))/gu;
export const greaterThan =
  /(?<!(button|code|details|summary|hr|br|span|strong|small|table|thead|tbody|td|tr|th|h1|h2|h3|h4|h5|h6|title|p|em|b|i|u|strike|bold|a|li|ol|ul|img|svg|div|center|\/|\s|"|'))>/gu;
export const codeFence = /`{1,3}[\s\S]*?`{1,3}/g;
export const curlyBrackets = /([{}])/g;
export const codeBlock = /(^```.*[\s\S]*?```$|`[^`].+?`)/gm;

export function clean(value: string | undefined): string {
  if (!value) {
    return "";
  }

  let sections = value.split(codeBlock);
  for (let sectionIndex in sections) {
    if (!sections[sectionIndex].startsWith("`")) {
      sections[sectionIndex] = sections[sectionIndex]
        .replace(lessThan, "&lt;")
        .replace(greaterThan, "&gt;")
        .replace(codeFence, function (match) {
          return match.replace(/\\>/g, ">");
        })
        .replace(curlyBrackets, "\\$1");
    }
  }
  return sections.join("");
}
