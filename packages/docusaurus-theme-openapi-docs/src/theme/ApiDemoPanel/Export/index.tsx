/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

// @ts-ignore
import fileSaver from "file-saver";

const saveFile = (url: string) => {
  fileSaver.saveAs(url, url.endsWith("json") ? "openapi.json" : "openapi.yaml");
};

function Export({ url, proxy }: any) {
  return (
    <div
      style={{ float: "right" }}
      className="dropdown dropdown--hoverable dropdown--right"
    >
      <button className="button button--sm button--secondary">Export</button>
      <ul className="dropdown__menu">
        <li>
          <a
            onClick={(e) => {
              e.preventDefault();
              saveFile(`${url}`);
            }}
            className="dropdown__link"
            href={`${url}`}
          >
            OpenAPI Spec
          </a>
        </li>
      </ul>
    </div>
  );
}

export default Export;
