import React from 'react';
import MD from 'react-markdown';

function getType(val) {
  if (val.type === 'object') {
    return val.xml.name;
  }
  if (val.type === 'array') {
    return getType(val.items) + '[]';
  }
  return val.format || val.type;
}

function getType3(name, schema, other) {
  for (let [key, val] of Object.entries(schema.properties)) {
    if (other[name] === undefined) {
      other[name] = {};
    }
    other[name][key] = getType(val);
  }
}

function drillThroughArray(val, other) {
  if (val.items.type === 'object') {
    getType3(val.items.xml.name, val.items, other);
  } else if (val.items.type === 'array') {
    drillThroughArray(val.items, other);
  } else {
    // noop, primitive array covered in the root object already covered.
  }
}

function getType2(schema, other) {
  for (let val of Object.values(schema.properties)) {
    if (val.type === 'object') {
      getType3(val.xml.name, val, other);
    } else if (val.type === 'array') {
      drillThroughArray(val, other);
    } else {
      // noop, primitives of the root object already covered.
    }
  }
}

function flattenSchema(schema) {
  if (schema.type === 'array') {
    // TODO: this will probably break for nested arrays...
    const [x] = flattenSchema(schema.items);
    return [schema.items.xml.name + '[]', { [schema.items.xml.name]: x }];
  }

  // build root object.
  let rootObj = {};
  if (schema.type === 'object') {
    Object.entries(schema.properties).forEach(([key, val]) => {
      rootObj[key] = getType(val);
    });
  }

  // other schemas.
  let other = {};
  if (schema.type === 'object') {
    getType2(schema, other);
  }

  return [JSON.stringify(rootObj, null, 2).replace(/[",]/g, ''), other];
}

function RequestBodyTable({ body }) {
  if (body === undefined) {
    return null;
  }

  // TODO: support more than one content type.
  const randomFirstKey = Object.keys(body.content)[0];

  // too lazy to descide how to handle all content types.
  const firstBody = body.content[randomFirstKey];

  const [root, other] = flattenSchema(firstBody.schema);

  // TODO: we don't handle arrays or primitives.

  return (
    <>
      <table style={{ display: 'table' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>
              Request Body{' '}
              {body.required && (
                <>
                  {
                    <span style={{ opacity: '0.6', fontWeight: 'normal' }}>
                      {' '}
                      —{' '}
                    </span>
                  }
                  <strong
                    style={{
                      fontSize: 'var(--ifm-code-font-size)',
                      color: 'var(--required)',
                    }}
                  >
                    {' '}
                    REQUIRED
                  </strong>
                </>
              )}
              <div style={{ fontWeight: 'normal' }}>
                <MD className="table-markdown" source={body.description} />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <pre
                style={{
                  marginBottom: 0,
                  marginTop: '0',
                }}
              >
                {root}
              </pre>
            </td>
          </tr>
        </tbody>
      </table>

      {Object.entries(other).map(([key, val]) => (
        <table key={key} style={{ display: 'table' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>{key}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <pre
                  style={{
                    marginBottom: 0,
                    marginTop: '0',
                  }}
                >
                  {typeof val === 'string'
                    ? val
                    : JSON.stringify(val, null, 2).replace(/[",]/g, '')}
                </pre>
              </td>
            </tr>
          </tbody>
        </table>
      ))}
    </>
  );
}

export default RequestBodyTable;
