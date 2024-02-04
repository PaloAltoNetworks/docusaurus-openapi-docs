import { PayloadAction } from "@reduxjs/toolkit";
export interface FileContent {
    type: "file";
    value: {
        src: string;
        content: Blob;
    };
}
export interface StringContent {
    type: "string";
    value?: string;
}
export declare type Content = FileContent | StringContent | undefined;
export interface FormBody {
    type: "form";
    content: {
        [key: string]: Content;
    };
}
export interface RawBody {
    type: "raw";
    content: Content;
}
export interface EmptyBody {
    type: "empty";
}
export declare type Body = EmptyBody | FormBody | RawBody;
export declare type State = Body;
export declare const slice: import("@reduxjs/toolkit").Slice<EmptyBody | FormBody | RawBody, {
    clearRawBody: (_state: import("immer/dist/internal").WritableDraft<EmptyBody> | import("immer/dist/internal").WritableDraft<FormBody> | import("immer/dist/internal").WritableDraft<RawBody>) => {
        type: "empty";
    };
    setStringRawBody: (_state: import("immer/dist/internal").WritableDraft<EmptyBody> | import("immer/dist/internal").WritableDraft<FormBody> | import("immer/dist/internal").WritableDraft<RawBody>, action: PayloadAction<string>) => {
        type: "raw";
        content: {
            type: "string";
            value: string;
        };
    };
    setFileRawBody: (_state: import("immer/dist/internal").WritableDraft<EmptyBody> | import("immer/dist/internal").WritableDraft<FormBody> | import("immer/dist/internal").WritableDraft<RawBody>, action: PayloadAction<FileContent["value"]>) => {
        type: "raw";
        content: {
            type: "file";
            value: {
                src: string;
                content: Blob;
            };
        };
    };
    clearFormBodyKey: (state: import("immer/dist/internal").WritableDraft<EmptyBody> | import("immer/dist/internal").WritableDraft<FormBody> | import("immer/dist/internal").WritableDraft<RawBody>, action: PayloadAction<string>) => void;
    setStringFormBody: (state: import("immer/dist/internal").WritableDraft<EmptyBody> | import("immer/dist/internal").WritableDraft<FormBody> | import("immer/dist/internal").WritableDraft<RawBody>, action: PayloadAction<{
        key: string;
        value: string;
    }>) => import("immer/dist/internal").WritableDraft<FormBody>;
    setFileFormBody: (state: import("immer/dist/internal").WritableDraft<EmptyBody> | import("immer/dist/internal").WritableDraft<FormBody> | import("immer/dist/internal").WritableDraft<RawBody>, action: PayloadAction<{
        key: string;
        value: FileContent["value"];
    }>) => import("immer/dist/internal").WritableDraft<FormBody> | {
        type: "form";
        content: {
            [x: string]: {
                type: "file";
                value: {
                    src: string;
                    content: Blob;
                };
            };
        };
    };
}, "body">;
export declare const clearRawBody: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"body/clearRawBody">, setStringRawBody: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "body/setStringRawBody">, setFileRawBody: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    src: string;
    content: Blob;
}, "body/setFileRawBody">, clearFormBodyKey: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "body/clearFormBodyKey">, setStringFormBody: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    key: string;
    value: string;
}, "body/setStringFormBody">, setFileFormBody: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    key: string;
    value: FileContent["value"];
}, "body/setFileFormBody">;
declare const _default: import("redux").Reducer<EmptyBody | FormBody | RawBody, import("redux").AnyAction>;
export default _default;
