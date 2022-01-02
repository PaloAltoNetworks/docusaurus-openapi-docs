/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useState } from "react";

import Editor, { loader } from "@monaco-editor/react";
import useThemeContext from "@theme/hooks/useThemeContext";

import styles from "./styles.module.css";

const LIGHT_BRIGHT = "1c1e21";
const LIGHT_DIM = "aaaaaa";
const LIGHT_BLUE = "648bea";
const LIGHT_GREEN = "39a351";
const LIGHT_BACKGROUND = getComputedStyle(
  document.documentElement
).getPropertyValue("--openapi-monaco-background-color");
const LIGHT_SELECT = "#ebedef";

const DARK_BRIGHT = "f5f6f7";
const DARK_DIM = "7f7f7f";
const DARK_BLUE = "a4cdfe";
const DARK_GREEN = "85d996";
const DARK_BACKGROUND = getComputedStyle(
  document.documentElement
).getPropertyValue("--openapi-monaco-background-color");
const DARK_SELECT = "#515151";

loader
  .init()
  .then((monaco) => {
    monaco.editor.defineTheme("OpenApiDark", {
      base: "vs-dark",
      inherit: false,
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
      inherit: false,
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
  })
  .catch((error) =>
    console.error("An error occurred during initialization of Monaco: ", error)
  );

interface Props {
  value?: string;
  language?: string;
  onChange(value: string): any;
}

function VSCode({ value, language, onChange }: Props) {
  const [focused, setFocused] = useState(false);

  const { isDarkTheme } = useThemeContext();

  return (
    <div className={focused ? styles.monacoFocus : styles.monaco}>
      <Editor
        value={value}
        language={language}
        theme={isDarkTheme ? "OpenApiDark" : "OpenApiLight"}
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
