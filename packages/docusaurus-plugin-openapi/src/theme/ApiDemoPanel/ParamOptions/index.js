/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useState, useEffect } from "react";

import { useSelector } from "react-redux";

import FormItem from "./../FormItem";
import FormMultiSelect from "./../FormMultiSelect";
import FormSelect from "./../FormSelect";
import FormTextInput from "./../FormTextInput";
import { useActions } from "./../redux/actions";
import styles from "./styles.module.css";

function ParamOption({ param }) {
  if (param.schema.type === "array" && param.schema.items.enum) {
    return <ParamMultiSelectFormItem param={param} />;
  }

  if (param.schema.type === "array") {
    return <ParamArrayFormItem param={param} />;
  }

  if (param.schema.enum) {
    return <ParamSelectFormItem param={param} />;
  }

  if (param.schema.type === "boolean") {
    return <ParamBooleanFormItem param={param} />;
  }

  // NOTE: We used to support `password` type, but curl still shows it and
  // Chrome's autocomplete is a huge dick.

  // integer, number, string, int32, int64, float, double, object, byte, binary,
  // date-time, date, password
  return <ParamTextFormItem param={param} />;
}

function ParamOptionWrapper({ param }) {
  return (
    <FormItem label={param.name} type={param.type}>
      <ParamOption param={param} />
    </FormItem>
  );
}

function ParamOptions() {
  const [showOptional, setShowOptional] = useState(false);

  const pathParams = useSelector((state) => state.params.path);
  const queryParams = useSelector((state) => state.params.query);
  const cookieParams = useSelector((state) => state.params.cookie);
  const headerParams = useSelector((state) => state.params.header);

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

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

function ArrayItem({ param, onChange }) {
  if (param.schema.items.type === "boolean") {
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

function ParamArrayFormItem({ param }) {
  const [items, setItems] = useState([]);
  const { updateParam } = useActions();

  function handleAddItem() {
    setItems((i) => [
      ...i,
      {
        id: uuidv4(),
      },
    ]);
  }

  useEffect(() => {
    const values = items.map((item) => item.value).filter((item) => item);

    updateParam({
      ...param,
      value: values.length > 0 ? values : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  function handleDeleteItem(itemToDelete) {
    return () => {
      const newItems = items.filter((i) => i.id !== itemToDelete.id);
      setItems(newItems);
    };
  }

  function handleChangeItem(itemToUpdate) {
    return (value) => {
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

function ParamSelectFormItem({ param }) {
  const { updateParam } = useActions();

  return (
    <FormSelect
      options={["---", ...param.schema.enum]}
      onChange={(e) => {
        const val = e.target.value;
        updateParam({
          ...param,
          value: val === "---" ? undefined : val,
        });
      }}
    />
  );
}

function ParamBooleanFormItem({ param }) {
  const { updateParam } = useActions();

  return (
    <FormSelect
      options={["---", "true", "false"]}
      onChange={(e) => {
        const val = e.target.value;
        updateParam({
          ...param,
          value: val === "---" ? undefined : val,
        });
      }}
    />
  );
}

function ParamMultiSelectFormItem({ param }) {
  const { updateParam } = useActions();

  return (
    <FormMultiSelect
      options={param.schema.items.enum}
      onChange={(e) => {
        const values = Array.prototype.filter
          .call(e.target.options, (o) => o.selected)
          .map((o) => o.value);

        updateParam({
          ...param,
          value: values.length > 0 ? values : undefined,
        });
      }}
    />
  );
}

function ParamTextFormItem({ param }) {
  const { updateParam } = useActions();

  return (
    <FormTextInput
      placeholder={param.description || param.name}
      onChange={(e) => updateParam({ ...param, value: e.target.value })}
    />
  );
}

export default ParamOptions;
