/// <reference types="react" />
import { ApiItem } from "docusaurus-plugin-openapi-docs/src/types";
declare function Request({ item }: {
    item: NonNullable<ApiItem>;
}): JSX.Element | null;
export default Request;
