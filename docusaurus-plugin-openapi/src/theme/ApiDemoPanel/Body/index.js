import React from 'react';
import VSCode from './../VSCode';
import FormTextInput from './../FormTextInput';
import FormFileUpload from './../FormFileUpload';
import { sampleFromSchema, createXMLExample } from './../../x-utils';
import { useSelector } from 'react-redux';
import { useActions } from './../../redux/actions';
import FormItem from './../FormItem';

function Body() {
  const contentType = useSelector((state) => state.contentType);
  const requestBodyMetadata = useSelector((state) => state.requestBodyMetadata);
  const { setBody, setForm } = useActions();

  // Lot's of possible content-types:
  // - application/json
  // - application/xml
  // - text/plain
  // - text/css
  // - text/html
  // - text/javascript
  // - application/javascript
  // - multipart/form-data
  // - application/x-www-form-urlencoded
  // - image/svg+xml;charset=US-ASCII

  // Show editor:
  // - application/json
  // - application/xml
  // - */*

  // Show form:
  // - multipart/form-data
  // - application/x-www-form-urlencoded

  // No body
  if (contentType === undefined) {
    return null;
  }

  const schema = requestBodyMetadata?.content?.[contentType]?.schema;
  if (schema.format === 'binary') {
    return (
      <FormItem label="Body">
        <FormFileUpload
          placeholder={schema.description || 'Body'}
          onChange={(file) => {
            if (file === undefined) {
              setBody(undefined);
              return;
            }
            setBody({
              type: 'file',
              src: `/path/to/${file.name}`,
              content: file,
            });
          }}
        />
      </FormItem>
    );
  }

  if (
    (contentType === 'multipart/form-data' ||
      contentType === 'application/x-www-form-urlencoded') &&
    requestBodyMetadata?.content?.[contentType]?.schema.type === 'object'
  ) {
    return (
      <div className="nick-form-item">
        <code>Body</code>
        <div
          style={{
            marginTop: 'calc(var(--ifm-pre-padding) / 2)',
            borderRadius: '4px',
            padding: 'var(--ifm-pre-padding)',
            border: '1px solid var(--monaco-border-color)',
          }}
        >
          {Object.entries(
            requestBodyMetadata?.content?.[contentType]?.schema.properties
          ).map(([key, val]) => {
            if (val.format === 'binary') {
              return (
                <FormItem key={key} label={key}>
                  <FormFileUpload
                    placeholder={val.description || key}
                    onChange={(file) => {
                      if (file === undefined) {
                        setForm({ key: key, value: undefined });
                        return;
                      }
                      setForm({
                        key: key,
                        value: {
                          type: 'file',
                          src: `/path/to/${file.name}`,
                          content: file,
                        },
                      });
                    }}
                  />
                </FormItem>
              );
            }
            // TODO: support all the other types.
            return (
              <FormItem key={key} label={key}>
                <FormTextInput
                  placeholder={val.description || key}
                  onChange={(e) => {
                    setForm({ key: key, value: e.target.value });
                  }}
                />
              </FormItem>
            );
          })}
        </div>
      </div>
    );
  }

  let language = 'plaintext';
  let exampleBodyString = 'body content';

  if (contentType === 'application/json') {
    exampleBodyString = JSON.stringify(
      sampleFromSchema(
        requestBodyMetadata?.content?.['application/json']?.schema
      ),
      null,
      2
    );
    language = 'json';
  }

  if (contentType === 'application/xml') {
    exampleBodyString = createXMLExample(
      requestBodyMetadata?.content?.['application/xml']?.schema
    ).replace(/\t/g, '  ');
    language = 'xml';
  }

  return (
    <FormItem label="Body">
      <VSCode
        value={exampleBodyString}
        language={language}
        onChange={setBody}
      />
    </FormItem>
  );
}

export default Body;
