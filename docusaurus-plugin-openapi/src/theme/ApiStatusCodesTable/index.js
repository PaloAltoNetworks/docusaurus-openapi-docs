import React from "react";
import RequestBodyTable from "../ApiRequestBodyTable";

function StatusCodesTable({ responses }) {
  // openapi requires at least one response, so we shouldn't HAVE to check...
  if (responses === undefined) {
    return null;
  }
  const codes = Object.keys(responses);
  if (codes.length === 0) {
    return null;
  }

  return codes.map((code) => {
    const response = responses[code];

    return <StatusCodeTable key={code} code={code} response={response} />;
  })
}

function StatusCodeTable({ code, response }) {
  const mappedResponse = {
    ...response,
    description: ''
  };

  return (
    <>
      <RequestBodyTable body={mappedResponse} title="Response Body" />
    </>
  );
}

export default StatusCodesTable;
