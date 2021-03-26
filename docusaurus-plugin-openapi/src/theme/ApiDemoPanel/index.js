import React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import sdk from "postman-collection";

import reducer from "./redux/reducer";
import init from "./redux/init";
import MethodEndpoint from "./MethodEndpoint";
import ParamOptions from "./ParamOptions";
import Body from "./Body";
import Curl from "./Curl";
import Response from "./Response";
import Execute from "./Execute";
import Accept from "./Accept";

import styles from "./styles.module.css";
import Endpoint from "./Endpoint";
import Authorization from "./Authorization";

function ApiDemoPanel({ item }) {
  item.postman = new sdk.Request(item.postman);
  const store = createStore(
    reducer,
    init(item),
    composeWithDevTools({ name: `${item.method} ${item.path}` })()
  );

  return (
    <Provider store={store}>
      <div style={{ marginTop: "3.5em" }}>
        <Authorization />

        {item.operationId !== undefined && (
          <div style={{ marginBottom: "var(--ifm-table-cell-padding)" }}>
            <code>
              <b>{item.operationId}</b>
            </code>
          </div>
        )}

        <MethodEndpoint />

        <div className={styles.optionsPanel}>
          <ParamOptions />
          <Body />
          <Accept />
        </div>

        <Endpoint />

        <Curl />

        <Execute />

        <Response />
      </div>
    </Provider>
  );
}

export default ApiDemoPanel;
