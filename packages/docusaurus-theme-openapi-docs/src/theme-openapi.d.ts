/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/// <reference types="docusaurus-plugin-openapi-docs" />

declare module "@docusaurus/plugin-content-docs-types" {
  // Makes all properties visible when hovering over the type
  type Expand<T extends Record<string, unknown>> = { [P in keyof T]: T[P] };

  export type SidebarItemBase = {
    className?: string;
    customProps?: Record<string, unknown>;
  };

  export type SidebarItemLink = SidebarItemBase & {
    type: "link";
    href: string;
    label: string;
    docId: string;
  };

  type SidebarItemCategoryBase = SidebarItemBase & {
    type: "category";
    label: string;
    collapsed: boolean;
    collapsible: boolean;
  };

  export type PropSidebarItemCategory = Expand<
    SidebarItemCategoryBase & {
      items: PropSidebarItem[];
    }
  >;

  export type PropSidebarItem = SidebarItemLink | PropSidebarItemCategory;
  export type PropSidebar = PropSidebarItem[];
  export type PropSidebars = {
    [sidebarId: string]: PropSidebar;
  };
}

declare module "docusaurus-theme-openapi-docs" {
  export type ThemeConfig = Partial<import("./types").ThemeConfig>;
}

declare module "@theme/ApiItem/hooks" {
  export { useTypedDispatch, useTypedSelector };
}

declare module "@theme/ApiItem/Layout" {
  export default function Layout(props: any): JSX.Element;
}

declare module "@theme/ApiItem/store" {
  export { AppDispatch, RootState };
}

declare module "@theme/SchemaTabs" {
  export default function SchemaTabs(props: any): JSX.Element;
}

declare module "@theme/ApiDemoPanel/Accept" {
  export default function Accept(): JSX.Element;
}

declare module "@theme/ApiDemoPanel/Accept/slice" {
  export default accept as Reducer<State, AnyAction>;
}

declare module "@theme/ApiDemoPanel/Authorization" {
  export default function Authorization(): JSX.Element;
}

declare module "@theme/ApiDemoPanel/Authorization/slice" {
  export { AuthState, Scheme, setAuthData, setSelectedAuth, createAuth };
  export default auth as Reducer<State, AnyAction>;
}

declare module "@theme/ApiDemoPanel/Body" {
  import { Props as BodyProps } from "@theme/ApiDemoPanel/Body";

  export default function Body(props: BodyProps): JSX.Element;
}

declare module "@theme/ApiDemoPanel/Body/json2xml" {
  export default function json2xml(any, any?): any;
}

declare module "@theme/ApiDemoPanel/Body/slice" {
  import { Body, Content, State } from "@theme/ApiDemoPanel/Body/slice";

  export { Body, Content, State };
  export function setStringRawBody(any, any?): any;
  export default body as Reducer<State, AnyAction>;
}

declare module "@theme/ApiDemoPanel/buildPostmanRequest" {
  export default function buildPostmanRequest(any, any?): any;
}

declare module "@theme/ApiDemoPanel/CodeTabs" {
  import { Props as CodeTabsProps } from "@theme/ApiDemoPanel/CodeTabs";

  export default function CodeTabs(props: CodeTabsProps): JSX.Element;
}

declare module "@theme/ApiDemoPanel/ContentType" {
  export default function ContentType(): JSX.Element;
}

declare module "@theme/ApiDemoPanel/ContentType/slice" {
  export { setContentType };
  export default contentType as Reducer<State, AnyAction>;
}

declare module "@theme/ApiDemoPanel/Curl" {
  import { Props as CurlProps } from "@theme/ApiDemoPanel/Curl";

  export { languageSet, Language } from "@theme/ApiDemoPanel/Curl";
  export default function Curl(props: CurlProps): JSX.Element;
}

declare module "@theme/ApiDemoPanel/FloatingButton" {
  import { Props as FloatingButtonProps } from "@theme/ApiDemoPanel/FloatingButton";

  export default function FloatingButton(
    props: FloatingButtonProps
  ): JSX.Element;
}

declare module "@theme/ApiDemoPanel/FormItem" {
  import { Props as FormItemProps } from "@theme/ApiDemoPanel/FormItem";

  export default function FormItem(props: FormItemProps): JSX.Element;
}

declare module "@theme/ApiDemoPanel/FormSelect" {
  import { Props as FormSelectProps } from "@theme/ApiDemoPanel/FormSelect";

  export default function FormSelect(props: FormSelectProps): JSX.Element;
}

declare module "@theme/ApiDemoPanel/FormTextInput" {
  import { Props as FormTextInputProps } from "@theme/ApiDemoPanel/FormTextInput";

  export default function FormTextInput(props: FormTextInputProps): JSX.Element;
}

declare module "@theme/ApiDemoPanel/FormFileUpload" {
  import { Props as FormFileUploadProps } from "@theme/ApiDemoPanel/FormFileUpload";

  export default function FormFileUpload(
    props: FormFileUploadProps
  ): JSX.Element;
}

declare module "@theme/ApiDemoPanel/FormMultiSelect" {
  import { Props as FormMultiSelectProps } from "@theme/ApiDemoPanel/FormMultiSelect";

  export default function FormMultiSelect(
    props: FormMultiSelectProps
  ): JSX.Element;
}

declare module "@theme/ApiDemoPanel/Execute" {
  import { Props as ExecuteProps } from "@theme/ApiDemoPanel/Execute";

  export default function Execute(props: ExecuteProps): JSX.Element;
}

declare module "@theme/ApiDemoPanel/LiveEditor" {
  export default function LiveEditor(props: any): JSX.Element;
}

declare module "@theme/ApiDemoPanel/MethodEndpoint" {
  import { Props as MethodEndpointProps } from "@theme/ApiDemoPanel/MethodEndpoint";

  export default function MethodEndpoint(
    props: MethodEndpointProps
  ): JSX.Element;
}

declare module "@theme/ApiDemoPanel/ParamOptions" {
  import { ParamProps } from "@theme/ApiDemoPanel/ParamOptions";

  export default function ParamOptions(props: ParamProps): JSX.Element;
}

declare module "@theme/ApiDemoPanel/ParamOptions/slice" {
  export type { Param };
  export default params as Reducer<State, AnyAction>;
}

declare module "@theme/ApiDemoPanel/persistanceMiddleware" {
  export { createPersistanceMiddleware };
}

declare module "@theme/ApiDemoPanel/Request" {
  import { ApiItem } from "docusaurus-plugin-openapi-docs/src/types";

  export interface RequestProps {
    item: NonNullable<ApiItem>;
  }
  export default function Request(props: RequestProps): JSX.Element;
}

declare module "@theme/ApiDemoPanel/Response" {
  export default function Response(): JSX.Element;
}

declare module "@theme/ApiDemoPanel/Response/slice" {
  export { setResponse };
  export default response as Reducer<State, AnyAction>;
}

declare module "@theme/ApiDemoPanel/SecuritySchemes" {
  export default function SecuritySchemes(props: any): JSX.Element;
}

declare module "@theme/ApiDemoPanel/Server" {
  export default function Server(): JSX.Element;
}

declare module "@theme/ApiDemoPanel/Server/slice" {
  export default server as Reducer<State, AnyAction>;
}

declare module "@theme/ApiDemoPanel/storage-utils" {
  export { createStorage, hashArray };
}
