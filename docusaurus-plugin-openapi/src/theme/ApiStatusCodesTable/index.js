import React from 'react';
import MD from 'react-markdown';

function StatusCodesTable({ responses }) {
  // openapi requires at least one response, so we shouldn't HAVE to check...
  if (responses === undefined) {
    return null;
  }
  const codes = Object.keys(responses);
  if (codes.length === 0) {
    return null;
  }
  return (
    <>
      <table style={{ display: 'table' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Status Codes</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((code) => {
            return (
              <tr key={code}>
                <td>
                  <div style={{ display: 'flex' }}>
                    <div
                      style={{ marginRight: 'var(--ifm-table-cell-padding)' }}
                    >
                      <code>{code}</code>
                    </div>
                    <div>
                      <MD
                        className="table-markdown"
                        source={responses[code].description}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default StatusCodesTable;
