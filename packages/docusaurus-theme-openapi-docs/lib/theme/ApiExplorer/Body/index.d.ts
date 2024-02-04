/// <reference types="react" />
import { RequestBodyObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";
export interface Props {
    jsonRequestBodyExample: string;
    requestBodyMetadata?: RequestBodyObject;
    methods?: any;
    required?: boolean;
}
declare function BodyWrap({ requestBodyMetadata, jsonRequestBodyExample, methods, required, }: Props): JSX.Element | null;
export default BodyWrap;
