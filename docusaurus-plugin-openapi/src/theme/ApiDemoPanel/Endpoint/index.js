import React, { useState } from "react";
import FormSelect from "./../FormSelect";
import FormTextInput from "./../FormTextInput";
import { useSelector } from "react-redux";
import { useActions } from "./../redux/actions";
import FormItem from "./../FormItem";

import styles from "./styles.module.css";
import FloatingButton from "../FloatingButton";

function Endpoint() {
  const [edit, setEdit] = useState(false);
  const servers = useSelector((state) => state.servers);
  const endpoint = useSelector((state) => state.endpoint);
  const { setEndpoint, setEndpointValue } = useActions();

  if (servers.length <= 0) {
    return null;
  }

  if (servers.length <= 1 && endpoint.variables === undefined) {
    return null;
  }

  if (!edit) {
    let url;
    if (endpoint) {
      url = endpoint.url.replace(/\/$/, "");
      if (endpoint.variables) {
        Object.keys(endpoint.variables).forEach((variable) => {
          url = url.replace(
            `{${variable}}`,
            endpoint.variables[variable].default
          );
        });
      }
    }
    return (
      <FloatingButton onClick={() => setEdit(true)} label="Edit">
        <pre
          style={{
            background: "var(--openapi-card-background-color)",
            paddingRight: "60px",
          }}
        >
          <code>{url}</code>
        </pre>
      </FloatingButton>
    );
  }

  return (
    <div className={styles.optionsPanel}>
      <button className={styles.showMoreButton} onClick={() => setEdit(false)}>
        Hide
      </button>
      <FormItem label="Endpoint">
        <FormSelect
          options={servers.map((s) => s.url)}
          onChange={(e) => setEndpoint(e.target.value)}
        />
      </FormItem>
      {endpoint.variables &&
        Object.keys(endpoint.variables).map((key) => {
          if (endpoint.variables[key].enum) {
            return (
              <FormItem label={key}>
                <FormSelect
                  options={endpoint.variables[key].enum}
                  onChange={(e) => {
                    setEndpointValue(key, e.target.value);
                  }}
                />
              </FormItem>
            );
          } else {
            return (
              <FormItem label={key}>
                <FormTextInput
                  placeholder={endpoint.variables[key].default}
                  onChange={(e) => {
                    setEndpointValue(key, e.target.value);
                  }}
                />
              </FormItem>
            )
          }
          return null;
        })}
    </div>
  );
}

export default Endpoint;
