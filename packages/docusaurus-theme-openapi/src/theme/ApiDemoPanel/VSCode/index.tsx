/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useState } from "react";

import { useColorMode } from "@docusaurus/theme-common";
import Editor, { Monaco } from "@monaco-editor/react";

import styles from "./styles.module.css";

interface Props {
  value?: string;
  language?: string;
  onChange(value: string): any;
}

function VSCode({ value, language, onChange }: Props) {
  const [focused, setFocused] = useState(false);
  const isDarkTheme = useColorMode().colorMode === "dark" ?? false;

  function handleEditorWillMount(monaco: Monaco) {
    const styles = getComputedStyle(document.documentElement);

    function getColor(property: string) {
      // Weird chrome bug, returns " #ffffff " instead of "#ffffff", see: https://github.com/cloud-annotations/docusaurus-openapi/issues/144
      const color = styles.getPropertyValue(property).trim();
      const isColorRgb = color.includes("rgb");
      const isColorHexShortened = color.length === 4;

      // Convert "rgb(r, g, b)" to color hex code
      const getColorHex = (color: string) => {
        const rgbValues = color.substring(4).split(")")[0].split(",");
        const [r, g, b] = rgbValues;

        const colorToHex = (rgb: string) => {
          const hexadecimal = parseInt(rgb).toString(16);
          return hexadecimal.length === 1 ? "0" + hexadecimal : hexadecimal;
        };

        return "#" + colorToHex(r) + colorToHex(g) + colorToHex(b);
      };

      // Extend shortened hex codes ie. "#aaa" => "#aaaaaa" or "#xyz" => "#xxyyzz"
      const getFullColorHex = (color: string) => {
        let fullColorHex = "#";
        const hexValues = color.slice(1);

        for (let i = 0; i < hexValues.length; i++) {
          for (let j = 0; j < 2; j++) {
            fullColorHex += hexValues[i];
          }
        }

        return fullColorHex.toLowerCase();
      };

      if (isColorRgb) {
        return getColorHex(color);
      } else if (isColorHexShortened) {
        return getFullColorHex(color);
      } else {
        return color;
      }
    }

    const LIGHT_BACKGROUND = getColor(
      "--openapi-monaco-background-color-light"
    );
    const LIGHT_BRIGHT = getColor("--openapi-code-bright-light");
    const LIGHT_DIM = getColor("--openapi-code-dim-light");
    const LIGHT_BLUE = getColor("--openapi-code-blue-light");
    const LIGHT_GREEN = getColor("--openapi-code-green-light");
    const LIGHT_SELECT = getColor("--openapi-code-select-light");

    const DARK_BACKGROUND = getColor("--openapi-monaco-background-color-dark");
    const DARK_BRIGHT = getColor("--openapi-code-bright-dark");
    const DARK_DIM = getColor("--openapi-code-dim-dark");
    const DARK_BLUE = getColor("--openapi-code-blue-dark");
    const DARK_GREEN = getColor("--openapi-code-green-dark");
    const DARK_SELECT = getColor("--openapi-code-select-dark");

    monaco.editor.defineTheme("OpenApiDark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: DARK_BRIGHT },
        { token: "string.key.json", foreground: DARK_BRIGHT },
        { token: "string.value.json", foreground: DARK_GREEN },
        { token: "number", foreground: DARK_BLUE },
        { token: "keyword.json", foreground: DARK_BLUE },
        { token: "delimiter", foreground: DARK_DIM },
        { token: "tag.xml", foreground: DARK_DIM },
        { token: "metatag.xml", foreground: DARK_DIM },
        { token: "attribute.name.xml", foreground: DARK_BRIGHT },
        { token: "attribute.value.xml", foreground: DARK_GREEN },
        { token: "metatag.xml", foreground: DARK_BLUE },
        { token: "tag.xml", foreground: DARK_BLUE },
      ],
      colors: {
        "editor.background": DARK_BACKGROUND,
        "editor.lineHighlightBackground": DARK_BACKGROUND,
        "editorBracketMatch.background": DARK_BACKGROUND,
        "editorBracketMatch.border": DARK_BACKGROUND,
        "editor.selectionBackground": DARK_SELECT,
      },
    });
    monaco.editor.defineTheme("OpenApiLight", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "", foreground: LIGHT_BRIGHT },
        { token: "string.key.json", foreground: LIGHT_BRIGHT },
        { token: "string.value.json", foreground: LIGHT_GREEN },
        { token: "number", foreground: LIGHT_BLUE },
        { token: "keyword.json", foreground: LIGHT_BLUE },
        { token: "delimiter", foreground: LIGHT_DIM },
        { token: "tag.xml", foreground: LIGHT_DIM },
        { token: "metatag.xml", foreground: LIGHT_DIM },
        { token: "attribute.name.xml", foreground: LIGHT_BRIGHT },
        { token: "attribute.value.xml", foreground: LIGHT_GREEN },
        { token: "metatag.xml", foreground: LIGHT_BLUE },
        { token: "tag.xml", foreground: LIGHT_BLUE },
      ],
      colors: {
        "editor.background": LIGHT_BACKGROUND,
        "editor.lineHighlightBackground": LIGHT_BACKGROUND,
        "editorBracketMatch.background": LIGHT_BACKGROUND,
        "editorBracketMatch.border": LIGHT_BACKGROUND,
        "editor.selectionBackground": LIGHT_SELECT,
      },
    });
  }

  return (
    <div className={focused ? styles.monacoFocus : styles.monaco}>
      <Editor
        value={value}
        language={language}
        theme={isDarkTheme ? "OpenApiDark" : "OpenApiLight"}
        beforeMount={handleEditorWillMount}
        options={{
          lineNumbers: "off",
          scrollBeyondLastLine: false,
          scrollBeyondLastColumn: 3,
          readOnly: false,
          minimap: { enabled: false },
          fontFamily:
            "SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
          fontSize: 14.4,
          overviewRulerLanes: 0,
          folding: false,
          lineDecorationsWidth: 0,
          contextmenu: false,
          scrollbar: {
            horizontal: "hidden",
          },
        }}
        onMount={(editor) => {
          editor.onDidFocusEditorText(() => {
            setFocused(true);
          });
          editor.onDidBlurEditorText(() => {
            setFocused(false);
          });
          editor.onDidChangeModelDecorations(() => {
            updateEditorHeight(); // typing
            requestAnimationFrame(updateEditorHeight); // folding
          });

          let prevHeight = 0;

          const updateEditorHeight = () => {
            onChange(editor.getValue());
            const editorElement = editor.getDomNode();

            if (!editorElement) {
              return;
            }

            const lineHeight = 22;
            const lineCount = editor.getModel()?.getLineCount() || 1;
            const height =
              editor.getTopForLineNumber(lineCount + 1) + lineHeight;

            const clippedHeight = Math.min(height, 500);

            if (prevHeight !== clippedHeight) {
              prevHeight = clippedHeight;
              editorElement.style.height = `${clippedHeight}px`;
              editor.layout();
            }
          };

          updateEditorHeight();
        }}
      />
    </div>
  );
}

export default VSCode;
