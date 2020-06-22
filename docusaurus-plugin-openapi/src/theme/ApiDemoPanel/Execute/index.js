import React from "react";
import { useSelector } from "react-redux";

import { useActions } from "./../redux/actions";
import { convert } from "./util";
import { buildPostmanRequest } from "./../build-postman-request";

import styles from "./styles.module.css";

function isRequestComplete(params) {
  for (let paramList of Object.values(params)) {
    for (let param of paramList) {
      if (param.required && !param.value) {
        return false;
      }
    }
  }
  return true;
}

function Execute() {
  const postman = useSelector((state) => state.postman);

  const pathParams = useSelector((state) => state.params.path);
  const queryParams = useSelector((state) => state.params.query);
  const cookieParams = useSelector((state) => state.params.cookie);
  const headerParams = useSelector((state) => state.params.header);
  const contentType = useSelector((state) => state.contentType);
  const body = useSelector((state) => state.body);
  const accept = useSelector((state) => state.accept);

  const params = useSelector((state) => state.params);
  const finishedRequest = isRequestComplete(params);

  const { setResponse } = useActions();

  const postmanRequest = buildPostmanRequest(postman, {
    queryParams,
    pathParams,
    cookieParams,
    contentType,
    accept,
    headerParams,
    body,
  });

  return (
    <button
      className={styles.executeButton}
      disabled={!finishedRequest}
      onClick={async () => {
        const res = await convert(postmanRequest, body);
        setResponse(res);
      }}
    >
      Execute
    </button>
  );
}

export default Execute;
