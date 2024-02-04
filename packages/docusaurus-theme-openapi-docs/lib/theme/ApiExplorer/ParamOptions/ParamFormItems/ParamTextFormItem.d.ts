/// <reference types="react" />
import { Param } from "@theme/ApiExplorer/ParamOptions/slice";
export interface ParamProps {
    param: Param;
}
export default function ParamTextFormItem({ param }: ParamProps): JSX.Element;
