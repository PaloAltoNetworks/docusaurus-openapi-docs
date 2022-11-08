/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import sdk from "@paloaltonetworks/postman-collection";
import Modal from "react-modal";

import { useTypedDispatch, useTypedSelector } from "../../ApiItem/hooks";
import { Param } from "../ParamOptions/slice";
import { setResponse } from "../Response/slice";
import buildPostmanRequest from "./../buildPostmanRequest";
import makeRequest from "./makeRequest";

function validateRequest(params: {
  path: Param[];
  query: Param[];
  header: Param[];
  cookie: Param[];
}) {
  for (let paramList of Object.values(params)) {
    for (let param of paramList) {
      if (param.required && !param.value) {
        return false;
      }
    }
  }
  return true;
}

interface Props {
  postman: sdk.Request;
  proxy?: string;
}

function Execute({ postman, proxy }: Props) {
  const pathParams = useTypedSelector((state) => state.params.path);
  const queryParams = useTypedSelector((state) => state.params.query);
  const cookieParams = useTypedSelector((state) => state.params.cookie);
  const headerParams = useTypedSelector((state) => state.params.header);
  const contentType = useTypedSelector((state) => state.contentType.value);
  const body = useTypedSelector((state) => state.body);
  const accept = useTypedSelector((state) => state.accept.value);
  const server = useTypedSelector((state) => state.server.value);
  const params = useTypedSelector((state) => state.params);
  const auth = useTypedSelector((state) => state.auth);

  const isValidRequest = validateRequest(params);

  const dispatch = useTypedDispatch();

  const postmanRequest = buildPostmanRequest(postman, {
    queryParams,
    pathParams,
    cookieParams,
    contentType,
    accept,
    headerParams,
    body,
    server,
    auth,
  });

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function acceptAgreement() {
    setIsOpen(false);
    setAgreementAccepted(true);
    sessionStorage.setItem("agreement-ack", "true");
  }

  const [modalIsOpen, setIsOpen] = React.useState(false);
  // Set the following as default value to persist to session and enable modal
  // sessionStorage.getItem("agreement-ack") === "true"
  const [agreementAccepted, setAgreementAccepted] = React.useState(true);

  const customStyles = {
    overlay: {
      backdropFilter: "blur(10px)",
      backgroundColor: "transparent",
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      border: "none",
      padding: "none",
      borderRadius: "var(--openapi-card-border-radius)",
      background: "var(--ifm-card-background-color)",
      transform: "translate(-50%, -50%)",
      maxWidth: "550px",
    },
  };

  if (agreementAccepted) {
    return (
      <button
        className="button button--sm button--secondary"
        disabled={!isValidRequest}
        style={!isValidRequest ? { pointerEvents: "all" } : {}}
        onClick={async () => {
          dispatch(setResponse("Fetching..."));
          try {
            await delay(1200);
            const res = await makeRequest(postmanRequest, proxy, body);
            dispatch(setResponse(res));
          } catch (e: any) {
            console.log(e);
            dispatch(setResponse("Connection failed"));
          }
        }}
      >
        Send API Request
      </button>
    );
  } else {
    return (
      <React.Fragment>
        <button
          className="button button--sm button--secondary"
          onClick={openModal}
        >
          Send API Request
        </button>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Terms of Use"
        >
          <form>
            <div className="card">
              <div className="card__header">
                <h2>Terms of Use</h2>
                <hr></hr>
              </div>
              <div className="card__body">
                <p>
                  By accepting this agreement the end user acknowledges the
                  risks of performing authenticated and non-authenticated API
                  requests from the browser.
                </p>
                <p>
                  The end user also accepts the responsibility of safeguarding
                  API credentials and any potentially sensitive data returned by
                  the API.
                </p>
                <br></br>
              </div>
              <div className="card__footer">
                <div className="button-group button-group--block">
                  <button
                    className="button button--sm button--outline button--success"
                    onClick={acceptAgreement}
                  >
                    AGREE
                  </button>
                  <button
                    className="button button--sm button--outline button--danger"
                    onClick={closeModal}
                  >
                    DISAGREE
                  </button>
                </div>
              </div>
            </div>
          </form>
        </Modal>
      </React.Fragment>
    );
  }
}

export default Execute;
