/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { usePrismTheme } from "@docusaurus/theme-common";
import useIsBrowser from "@docusaurus/useIsBrowser";
import { LiveProvider, LiveEditor, withLive } from "react-live";

import { setStringRawBody } from "../Body/slice";
import styles from "./styles.module.css";

function Live({ onEdit }: any) {
  const isBrowser = useIsBrowser();

  return (
    <>
      <LiveEditor
        key={String(isBrowser)}
        className={styles.playgroundEditor}
        onChange={onEdit}
      />
    </>
  );
}

const LiveComponent = withLive(Live);

function App({
  children,
  transformCode,
  value,
  language,
  action,
  ...props
}: any): JSX.Element {
  const prismTheme = usePrismTheme();
  const [code, setCode] = React.useState(children);

  // Skip over Editor when navigating through keyboard tab
  const editorTextArea = document.querySelector(
    ".npm__react-simple-code-editor__textarea"
  );
  editorTextArea?.setAttribute("tabindex", "-1");

  action(setStringRawBody(code));
  return (
    <div className={styles.playgroundContainer}>
      <LiveProvider
        code={children.replace(/\n$/, "")}
        transformCode={transformCode ?? ((code) => `${code};`)}
        theme={prismTheme}
        language={language}
        {...props}
      >
        <LiveComponent onEdit={setCode} />
      </LiveProvider>
    </div>
  );
}

const LiveApp = withLive(App);
export default LiveApp;
