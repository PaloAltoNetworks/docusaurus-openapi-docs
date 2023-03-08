/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useEffect, useState } from "react";

import { usePrismTheme } from "@docusaurus/theme-common";
import useIsBrowser from "@docusaurus/useIsBrowser";
import { setStringRawBody } from "@theme/ApiDemoPanel/Body/slice";
import { LiveProvider, LiveEditor, withLive } from "react-live";

function Live({ onEdit }: any) {
  const isBrowser = useIsBrowser();
  const [editorDisabled, setEditorDisabled] = useState(false);

  // TODO: Temporary solution for disabling tab key
  const handleKeydown = (event: React.KeyboardEvent) => {
    if (event.key === "Tab") {
      event.preventDefault();
      setEditorDisabled(true);
    }
  };

  return (
    <div onClick={() => setEditorDisabled(false)}>
      <LiveEditor
        key={String(isBrowser)}
        className="openapi-demo__playground-editor"
        onChange={onEdit}
        disabled={editorDisabled}
        onKeyDown={handleKeydown}
      />
    </div>
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

  useEffect(() => {
    action(setStringRawBody(code));
  }, [action, code]);

  return (
    <div className="openapi-demo__playground-container">
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
