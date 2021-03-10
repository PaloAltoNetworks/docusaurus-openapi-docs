import React from "react";
import FormSelect from "./../FormSelect";
import { useSelector } from "react-redux";
import { useActions } from "./../redux/actions";
import FormItem from "./../FormItem";

function ContentType() {
  const contentTypeOptions = useSelector((state) => state.contentTypeOptions);
  const contentType = useSelector((state) => state.contentType);
  const { setContentType } = useActions();

  if (contentTypeOptions.length <= 1) {
    return null;
  }

  return (
    <FormItem label="Content-Type">
      <FormSelect
        options={contentTypeOptions}
        value={contentType}
        onChange={(e) => setContentType(e.target.value)}
      />
    </FormItem>
  );
}

export default ContentType;
