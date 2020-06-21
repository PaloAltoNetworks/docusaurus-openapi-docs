import React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";

import reducer from "./redux/reducer";
import init from "./redux/init";
import MethodEndpoint from "./MethodEndpoint";
import ParamOptions from "./ParamOptions";
import Body from "./Body";
import Curl from "./Curl";
import Response from "./Response";
import Execute from "./Execute";
import Accept from "./Accept";
import ContentType from "./ContentType";

import styles from "./styles.module.css";

function ApiDemoPanel({ item }) {
  const store = createStore(
    reducer,
    init(item),
    composeWithDevTools({ name: `${item.method} ${item.path}` })()
  );

  return (
    <Provider store={store}>
      <MethodEndpoint />

      <div className={styles.optionsPanel}>
        <ParamOptions />
        <ContentType />
        <Body />
        <Accept />
      </div>

      <Curl />
      <Execute />
      <Response />
    </Provider>
  );
}

export default ApiDemoPanel;
