/// <reference types="react" />
export interface Props {
    method: string;
    path: string;
}
declare function MethodEndpoint({ method, path }: Props): JSX.Element;
export default MethodEndpoint;
