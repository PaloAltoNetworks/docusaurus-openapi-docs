/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useState, useEffect } from "react";

import { nanoid } from "@reduxjs/toolkit";

import { useTypedDispatch, useTypedSelector } from "../hooks";
import FormItem from "./../FormItem";
import FormMultiSelect from "./../FormMultiSelect";
import FormSelect from "./../FormSelect";
import FormTextInput from "./../FormTextInput";
import { Param, setParam } from "./slice";
import styles from "./styles.module.css";

interface ParamProps {
  param: Param;
}

function ParamOption({ param }: ParamProps) {
  if (param.schema?.type === "array" && param.schema.items?.enum) {
    return <ParamMultiSelectFormItem param={param} />;
  }

  if (param.schema?.type === "array") {
    return <ParamArrayFormItem param={param} />;
  }

  if (param.schema?.enum) {
    return <ParamSelectFormItem param={param} />;
  }

  if (param.schema?.type === "boolean") {
    return <ParamBooleanFormItem param={param} />;
  }

  // integer, number, string, int32, int64, float, double, object, byte, binary,
  // date-time, date, password
  return <ParamTextFormItem param={param} />;
}

function ParamOptionWrapper({ param }: ParamProps) {
  return (
    <FormItem label={param.name} type={param.in}>
      <ParamOption param={param} />
    </FormItem>
  );
}

function ParamOptions() {
  const [showOptional, setShowOptional] = useState(false);

  const pathParams = useTypedSelector((state) => state.params.path);
  const queryParams = useTypedSelector((state) => state.params.query);
  const cookieParams = useTypedSelector((state) => state.params.cookie);
  const headerParams = useTypedSelector((state) => state.params.header);

  const allParams = [
    ...pathParams,
    ...queryParams,
    ...cookieParams,
    ...headerParams,
  ];

  const requiredParams = allParams.filter((p) => p.required);
  const optionalParams = allParams.filter((p) => !p.required);

  return (
    <>
      {/* Required Parameters */}
      {requiredParams.map((param) => (
        <ParamOptionWrapper key={`${param.in}-${param.name}`} param={param} />
      ))}

      {/* Optional Parameters */}
      {optionalParams.length > 0 && (
        <>
          <button
            className={styles.showMoreButton}
            onClick={() => setShowOptional((prev) => !prev)}
          >
            <span
              style={{
                width: "1.5em",
                display: "inline-block",
                textAlign: "center",
              }}
            >
              <span
                className={showOptional ? styles.plusExpanded : styles.plus}
              >
                <div>
                  <svg
                    style={{
                      fill: "currentColor",
                      width: "10px",
                      height: "10px",
                    }}
                    height="16"
                    viewBox="0 0 16 16"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 7h6a1 1 0 0 1 0 2H9v6a1 1 0 0 1-2 0V9H1a1 1 0 1 1 0-2h6V1a1 1 0 1 1 2 0z"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                </div>
              </span>
            </span>
            {showOptional
              ? "Hide optional parameters"
              : "Show optional parameters"}
          </button>

          <div
            className={showOptional ? styles.showOptions : styles.hideOptions}
          >
            {optionalParams.map((param) => (
              <ParamOptionWrapper
                key={`${param.in}-${param.name}`}
                param={param}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function ArrayItem({
  param,
  onChange,
}: ParamProps & { onChange(value?: string): any }) {
  if (param.schema?.items?.type === "boolean") {
    return (
      <FormSelect
        options={["---", "true", "false"]}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === "---" ? undefined : val);
        }}
      />
    );
  }

  return (
    <FormTextInput
      placeholder={param.description || param.name}
      onChange={(e) => {
        onChange(e.target.value);
      }}
    />
  );
}

function ParamArrayFormItem({ param }: ParamProps) {
  const [items, setItems] = useState<{ id: string; value?: string }[]>([]);
  const dispatch = useTypedDispatch();

  function handleAddItem() {
    setItems((i) => [
      ...i,
      {
        id: nanoid(),
      },
    ]);
  }

  useEffect(() => {
    const values = items
      .map((item) => item.value)
      .filter((item): item is string => !!item);

    dispatch(
      setParam({
        ...param,
        value: values.length > 0 ? values : undefined,
      })
    );
  }, [dispatch, items, param]);

  function handleDeleteItem(itemToDelete: { id: string }) {
    return () => {
      const newItems = items.filter((i) => i.id !== itemToDelete.id);
      setItems(newItems);
    };
  }

  function handleChangeItem(itemToUpdate: { id: string }) {
    return (value: string) => {
      const newItems = items.map((i) => {
        if (i.id === itemToUpdate.id) {
          return { ...i, value: value };
        }
        return i;
      });
      setItems(newItems);
    };
  }

  return (
    <>
      {items.map((item) => (
        <div key={item.id} style={{ display: "flex" }}>
          <ArrayItem param={param} onChange={handleChangeItem(item)} />
          <button
            className={styles.buttonDelete}
            onClick={handleDeleteItem(item)}
          >
            <svg
              focusable="false"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              width="16"
              height="16"
              viewBox="0 0 32 32"
              aria-hidden="true"
            >
              <path d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4z"></path>
              <title>Delete</title>
            </svg>
          </button>
        </div>
      ))}
      <button className={styles.buttonThin} onClick={handleAddItem}>
        Add item
      </button>
    </>
  );
}

function ParamSelectFormItem({ param }: ParamProps) {
  const dispatch = useTypedDispatch();

  const options = param.schema?.enum ?? [];

  return (
    <FormSelect
      options={["---", ...(options as string[])]}
      onChange={(e) => {
        const val = e.target.value;
        dispatch(
          setParam({
            ...param,
            value: val === "---" ? undefined : val,
          })
        );
      }}
    />
  );
}

function ParamBooleanFormItem({ param }: ParamProps) {
  const dispatch = useTypedDispatch();

  return (
    <FormSelect
      options={["---", "true", "false"]}
      onChange={(e) => {
        const val = e.target.value;
        dispatch(
          setParam({
            ...param,
            value: val === "---" ? undefined : val,
          })
        );
      }}
    />
  );
}

function ParamMultiSelectFormItem({ param }: ParamProps) {
  const dispatch = useTypedDispatch();

  const options = param.schema?.items?.enum ?? [];

  return (
    <FormMultiSelect
      options={options as string[]}
      onChange={(e) => {
        const values = Array.prototype.filter
          .call(e.target.options, (o) => o.selected)
          .map((o) => o.value);

        dispatch(
          setParam({
            ...param,
            value: values.length > 0 ? values : undefined,
          })
        );
      }}
    />
  );
}

function ParamTextFormItem({ param }: ParamProps) {
  const dispatch = useTypedDispatch();

  return (
    <FormTextInput
      placeholder={param.description || param.name}
      onChange={(e) => dispatch(setParam({ ...param, value: e.target.value }))}
    />
  );
}

export default ParamOptions;
