export declare type Children = string | undefined | (string | undefined)[];
export declare type Props = Record<string, any> & {
    children?: Children;
};
export declare function create(tag: string, props: Props): string;
export declare function guard<T>(value: T | undefined | string, cb: (value: T) => Children): string;
export declare function render(children: Children): string;
export declare function toString(value: any): string | undefined;
