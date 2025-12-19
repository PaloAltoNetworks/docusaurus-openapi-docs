/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useState } from "react";
import FormFileUpload from "@theme/ApiExplorer/FormFileUpload";
import { useTypedDispatch } from "@theme/ApiItem/hooks";
import { FileContent, setFileArrayFormBody } from "../slice";

interface FileArrayFormItemProps {
  id: string;
  description: string | undefined;
}

export default function FileArrayFormBodyItem({
  id,
  description,
}: FileArrayFormItemProps): React.JSX.Element {
  const dispatch = useTypedDispatch();
  const [fileItems, setFileItems] = useState<
    Map<number, FileContent["value"] | undefined>
  >(new Map([[0, undefined]]));

  const handleFileChange = (index: number, file: any) => {
    const newItems = new Map(fileItems);

    if (file === undefined) {
      newItems.delete(index);

      setFileItems(newItems);

      dispatch(
        setFileArrayFormBody({
          key: id,
          value: [...newItems.values()].filter((item) => item !== undefined),
        })
      );
      return;
    }

    let maxIndex = 0;

    newItems.keys().forEach((item) => {
      maxIndex = item > maxIndex ? item : maxIndex;
    });
    newItems.set(index, {
      src: `/path/to/${file.name}`,
      content: file,
    });
    newItems.set(index + 1, undefined);

    setFileItems(newItems);

    dispatch(
      setFileArrayFormBody({
        key: id,
        value: [...newItems.values()].filter((item) => item !== undefined),
      })
    );
  };

  return (
    <div>
      {[...fileItems.keys()].map((index) => (
        <div key={index}>
          <FormFileUpload
            placeholder={description || id}
            onChange={(file: any) => handleFileChange(index, file)}
          />
        </div>
      ))}
    </div>
  );
}
