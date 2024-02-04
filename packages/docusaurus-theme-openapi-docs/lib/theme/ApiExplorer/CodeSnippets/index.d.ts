/// <reference types="react" />
import sdk from "@paloaltonetworks/postman-collection";
import { CodeSample, Language } from "./code-snippets-types";
export declare const languageSet: Language[];
export interface Props {
    postman: sdk.Request;
    codeSamples: CodeSample[];
}
declare function CodeSnippets({ postman, codeSamples }: Props): JSX.Element | null;
export default CodeSnippets;
