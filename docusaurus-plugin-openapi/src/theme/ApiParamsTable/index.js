import React from 'react';
import MD from 'react-markdown';

import styles from './styles.module.css';

function parseFinalSchema(schema) {
  if (schema.$ref) {
    return schema.$ref.replace('#/components/schemas/', '');
  }
  if (schema.format) {
    return schema.format;
  }
  return schema.type;
}

function getSchemaName(schema) {
  if (schema.type === 'array') {
    return parseFinalSchema(schema.items) + '[]';
  }

  return parseFinalSchema(schema);
}

function ParamsTable({ parameters, type }) {
  if (parameters === undefined) {
    return null;
  }
  const params = parameters.filter((param) => param.in === type);
  if (params.length === 0) {
    return null;
  }
  return (
    <>
      <table style={{ display: 'table' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>
              {type.charAt(0).toUpperCase() + type.slice(1)} Parameters
            </th>
          </tr>
        </thead>
        <tbody>
          {params.map((param) => {
            return (
              <tr key={`${param.in}-${param.name}`}>
                <td>
                  <code>{param.name}</code>
                  <span style={{ opacity: '0.6' }}>
                    {' '}
                    {getSchemaName(param.schema)}
                  </span>
                  {param.required && (
                    <>
                      {<span style={{ opacity: '0.6' }}> — </span>}
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
                  {param.description && (
                    <div className={styles.description}>
                      <MD
                        className="table-markdown"
                        source={param.description}
                      />
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default ParamsTable;
