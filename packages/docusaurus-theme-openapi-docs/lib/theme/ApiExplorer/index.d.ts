/// <reference types="react" />
import { ApiItem } from "docusaurus-plugin-openapi-docs/src/types";
declare function ApiExplorer({ item, infoPath, }: {
    item: NonNullable<ApiItem>;
    infoPath: string;
}): JSX.Element;
export default ApiExplorer;
