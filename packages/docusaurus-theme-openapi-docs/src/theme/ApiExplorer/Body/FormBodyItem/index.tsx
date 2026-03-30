/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useEffect, useState } from "react";

import FormFileUpload from "@theme/ApiExplorer/FormFileUpload";
import FormLabel from "@theme/ApiExplorer/FormLabel";
import FormSelect from "@theme/ApiExplorer/FormSelect";
import FormTextInput from "@theme/ApiExplorer/FormTextInput";
import LiveApp from "@theme/ApiExplorer/LiveEditor";
import { useTypedDispatch } from "@theme/ApiItem/hooks";
import type { SchemaObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";

import FileArrayFormBodyItem from "../FileArrayFormBodyItem";
import { clearFormBodyKey, setFileFormBody, setStringFormBody } from "../slice";
import { setFieldEncoding } from "../../EncodingSelection/slice";

interface FormBodyItemProps {
  schemaObject: SchemaObject;
  id: string;
  schema: SchemaObject;
  label?: string;
  required?: boolean;
  exampleValue?: SchemaObject["example"];
  fieldEncoding?: string;
}

export default function FormBodyItem({
  schemaObject,
  id,
  schema,
  label,
  required,
  exampleValue,
  fieldEncoding,
}: FormBodyItemProps): React.JSX.Element {
  const dispatch = useTypedDispatch();

  // Parse comma-separated encoding contentType into selectable options
  const encodingOptions = fieldEncoding
    ? fieldEncoding
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const hasMultipleEncodings = encodingOptions.length > 1;

  // Initialize with the first declared content type
  const [selectedEncoding, setSelectedEncoding] = useState<string>(
    encodingOptions[0] ?? ""
  );

  useEffect(() => {
    if (encodingOptions[0]) {
      dispatch(
        setFieldEncoding({ field: id, contentType: encodingOptions[0] })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [value, setValue] = useState(() => {
    let initialValue = exampleValue ?? "";

    if (schemaObject.type === "object" && exampleValue) {
      initialValue = JSON.stringify(exampleValue, null, 2);
    }

    return initialValue;
  });

  useEffect(() => {
    if (value) {
      dispatch(setStringFormBody({ key: id, value }));
    } else {
      dispatch(clearFormBodyKey(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (
    schemaObject.type === "array" &&
    schemaObject.items?.format === "binary"
  ) {
    return (
      <>
        {label && <FormLabel label={label} required={required} />}
        <FileArrayFormBodyItem id={id} description={schemaObject.description} />
      </>
    );
  }

  if (schemaObject.format === "binary") {
    return (
      <>
        {label && <FormLabel label={label} required={required} />}
        {hasMultipleEncodings && (
          <FormSelect
            label="Content-Type"
            options={encodingOptions}
            value={selectedEncoding}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const ct = e.target.value;
              setSelectedEncoding(ct);
              dispatch(setFieldEncoding({ field: id, contentType: ct }));
            }}
          />
        )}
        <FormFileUpload
          placeholder={schemaObject.description || id}
          onChange={(file: any) => {
            if (file === undefined) {
              dispatch(clearFormBodyKey(id));
              return;
            }
            dispatch(
              setFileFormBody({
                key: id,
                value: {
                  src: `/path/to/${file.name}`,
                  content: file,
                },
              })
            );
          }}
        />
      </>
    );
  }

  if (schemaObject.type === "object") {
    return (
      <>
        {label && <FormLabel label={label} required={required} />}
        <LiveApp
          action={(code: string) =>
            dispatch(setStringFormBody({ key: id, value: code }))
          }
        >
          {value}
        </LiveApp>
      </>
    );
  }

  if (
    schemaObject.enum &&
    schemaObject.enum.every((value) => typeof value === "string")
  ) {
    return (
      <FormSelect
        label={label}
        required={required}
        value={value}
        options={["---", ...schemaObject.enum]}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          const val = e.target.value;
          setValue(val);
          if (val === "---") {
            dispatch(clearFormBodyKey(id));
          } else {
            dispatch(
              setStringFormBody({
                key: id,
                value: val,
              })
            );
          }
        }}
      />
    );
  }
  // TODO: support all the other types.
  return (
    <FormTextInput
      label={label}
      required={required}
      value={value}
      paramName={id}
      isRequired={
        Array.isArray(schema.required) && schema.required.includes(id)
      }
      placeholder={schemaObject.description || id}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        dispatch(setStringFormBody({ key: id, value: e.target.value }));
      }}
    />
  );
}
