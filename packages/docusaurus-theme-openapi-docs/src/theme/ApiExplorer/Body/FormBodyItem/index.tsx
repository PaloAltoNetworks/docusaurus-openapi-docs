/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import FormFileUpload from "@theme/ApiExplorer/FormFileUpload";
import FormSelect from "@theme/ApiExplorer/FormSelect";
import FormTextInput from "@theme/ApiExplorer/FormTextInput";
import LiveApp from "@theme/ApiExplorer/LiveEditor";
import { useTypedDispatch } from "@theme/ApiItem/hooks";
import type { SchemaObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";

import FileArrayFormBodyItem from "../FileArrayFormBodyItem";
import { clearFormBodyKey, setFileFormBody, setStringFormBody } from "../slice";

interface FormBodyItemProps {
  schemaObject: SchemaObject;
  id: string;
  schema: SchemaObject;
}

export default function FormBodyItem({
  schemaObject,
  id,
  schema,
}: FormBodyItemProps): React.JSX.Element {
  const dispatch = useTypedDispatch();

  if (
    schemaObject.type === "array" &&
    schemaObject.items?.format === "binary"
  ) {
    return (
      <FileArrayFormBodyItem id={id} description={schemaObject.description} />
    );
  }

  if (schemaObject.format === "binary") {
    return (
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
    );
  }

  if (
    schemaObject.type === "object" &&
    (schemaObject.example || schemaObject.examples)
  ) {
    const objectExample = JSON.stringify(
      schemaObject.example ?? schemaObject.examples[0],
      null,
      2
    );

    return (
      <LiveApp
        action={(code: string) =>
          dispatch(setStringFormBody({ key: id, value: code }))
        }
      >
        {objectExample}
      </LiveApp>
    );
  }

  if (
    schemaObject.enum &&
    schemaObject.enum.every((value) => typeof value === "string")
  ) {
    return (
      <FormSelect
        options={["---", ...schemaObject.enum]}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          const val = e.target.value;
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
      paramName={id}
      isRequired={
        Array.isArray(schema.required) && schema.required.includes(id)
      }
      placeholder={schemaObject.description || id}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setStringFormBody({ key: id, value: e.target.value }));
      }}
    />
  );
}
