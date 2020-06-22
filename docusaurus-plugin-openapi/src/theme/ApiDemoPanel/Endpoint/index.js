import React from "react";
import FormSelect from "./../FormSelect";
import { useSelector } from "react-redux";
import { useActions } from "./../redux/actions";
import FormItem from "./../FormItem";

function Endpoint() {
  const servers = useSelector((state) => state.servers);
  const endpoint = useSelector((state) => state.endpoint);
  const { setEndpoint } = useActions();

  if (servers.length <= 1) {
    return null;
  }

  return (
    <FormItem label="Endpoint">
      <FormSelect
        options={servers.map((s) => s.url)}
        onChange={(e) => setEndpoint(e.target.value)}
      />
    </FormItem>
  );
}

export default Endpoint;
