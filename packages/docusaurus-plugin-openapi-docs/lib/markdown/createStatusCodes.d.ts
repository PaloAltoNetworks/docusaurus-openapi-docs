import { ApiItem } from "../types";
export default function json2xml(o: any, tab: any): string;
interface Props {
    id?: string;
    label?: string;
    responses: ApiItem["responses"];
}
export declare function createResponseExamples(responseExamples: any, mimeType: string): string[];
export declare function createResponseExample(responseExample: any, mimeType: string): string;
export declare function createExampleFromSchema(schema: any, mimeType: string): string | undefined;
export declare function createStatusCodes({ label, id, responses }: Props): string | undefined;
export {};
