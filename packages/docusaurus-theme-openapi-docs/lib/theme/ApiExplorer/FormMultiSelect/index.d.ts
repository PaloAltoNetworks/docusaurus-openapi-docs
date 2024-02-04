import React from "react";
export interface Props {
    value?: string;
    options: string[];
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
    showErrors?: boolean;
}
declare function FormMultiSelect({ value, options, onChange, showErrors }: Props): JSX.Element | null;
export default FormMultiSelect;
