import React from 'react';

import { useSelector } from 'react-redux';

function colorForMethod(method) {
  switch (method.toLowerCase()) {
    case 'get':
      return 'var(--code-blue)';
    case 'put':
      return 'var(--code-orange)';
    case 'post':
      return 'var(--code-green)';
    case 'delete':
      return 'var(--code-red)';
    default:
      return undefined;
  }
}

function MethodEndpoint() {
  const method = useSelector((state) => state.method);
  const endpoint = useSelector((state) => state.endpoint);

  return (
    <pre
      style={{
        marginTop: '3.5em',
        background: 'var(--ifm-codeblock-background-color)',
      }}
    >
      <span style={{ color: colorForMethod(method) }}>
        {method.toUpperCase()}
      </span>{' '}
      <span>{endpoint.replace(/{([a-z0-9-_]+)}/gi, ':$1')}</span>
    </pre>
  );
}

export default MethodEndpoint;
