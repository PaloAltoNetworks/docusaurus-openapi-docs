import React from 'react';
import { useSelector } from 'react-redux';
import { useActions } from './../../redux/actions';

function Response() {
  const response = useSelector((state) => state.response);
  const { clearResponse } = useActions();

  if (response === undefined) {
    return null;
  }

  let prettyResponse = response;
  try {
    prettyResponse = JSON.stringify(JSON.parse(response), null, 2);
  } catch {}

  return (
    <div className="nick-floating-button">
      <button onClick={() => clearResponse()}>Clear</button>
      <pre
        style={{
          background: 'var(--ifm-codeblock-background-color)',
        }}
      >
        {prettyResponse || 'No Response'}
      </pre>
    </div>
  );
}

export default Response;
