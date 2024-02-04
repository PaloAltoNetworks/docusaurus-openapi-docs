export declare function hashArray(arr: string[]): string;
declare type Persistance = false | "localStorage" | "sessionStorage" | undefined;
export declare function createStorage(persistance: Persistance): Storage;
export {};
