/// <reference types="react" />
export interface Props {
    placeholder: string;
    onChange?(file?: File): any;
}
declare function FormFileUpload({ placeholder, onChange }: Props): JSX.Element;
export default FormFileUpload;
