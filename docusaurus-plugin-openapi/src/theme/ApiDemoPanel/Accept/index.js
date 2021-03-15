import React from "react";
import FormSelect from "./../FormSelect";
import { useSelector } from "react-redux";
import { useActions } from "./../redux/actions";
import FormItem from "./../FormItem";

function Accept() {
  const acceptOptions = useSelector((state) => state.acceptOptions);
  const accept = useSelector((state) => state.accept);
  const { setAccept } = useActions();

  if (acceptOptions.length <= 1) {
    return null;
  }

  return (
    <FormItem label="Accept">
      <FormSelect
        options={acceptOptions}
        value={accept}
        onChange={(e) => setAccept(e.target.value)}
      />
    </FormItem>
  );
}

export default Accept;
