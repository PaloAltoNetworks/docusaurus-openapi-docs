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

    return <StatusCodeTable key={code} response={response} />;
  })
}

function StatusCodeTable({ response }) {
  const mappedResponse = {
    ...response,
    description: '' // remove description since we are describing the fields
  };

  return (
    <>
      <RequestBodyTable body={mappedResponse} title="Response Body" />
    </>
  );
}

export default StatusCodesTable;
