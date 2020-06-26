import React from "react";
import FormSelect from "./../FormSelect";
import { useSelector } from "react-redux";
import { useActions } from "./../redux/actions";
import FormItem from "./../FormItem";

function Endpoint() {
  const servers = useSelector((state) => state.servers);
  const endpoint = useSelector((state) => state.endpoint);
  const { setEndpoint, setEndpointValue } = useActions();

  if (servers.length <= 0) {
    return null;
  }

  if (servers.length <= 1 && endpoint.variables === undefined) {
    return null;
  }

  return (
    <>
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
          }
          return null;
        })}
    </>
  );
}

export default Endpoint;
