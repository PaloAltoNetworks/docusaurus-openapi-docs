/* ============================================================================
 * Portions Copyright (c) Meta Platforms, Inc. and affiliates.
 * Portions Copyright (c) Palo Alto Networks
 *
 * Vendored from @docusaurus/theme-common/src/utils/tabsUtils.tsx (MIT) to
 * remove the dependency on @docusaurus/theme-common/internal. The
 * useQueryStringValue dependency from theme-common's historyUtils is inlined
 * below to avoid pulling another internal module.
 * See: https://github.com/PaloAltoNetworks/docusaurus-openapi-docs/issues/1140
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, {
  createContext,
  isValidElement,
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from "react";

import { useHistory } from "@docusaurus/router";
import { duplicates, useStorageSlot } from "@docusaurus/theme-common";
import useIsomorphicLayoutEffect from "@docusaurus/useIsomorphicLayoutEffect";

import { ScrollControllerProvider } from "./scrollUtils";

export interface TabValue {
  readonly value: string;
  readonly label?: string;
  readonly attributes?: { [key: string]: unknown };
  readonly default?: boolean;
}

export interface TabsProps {
  readonly lazy?: boolean;
  readonly block?: boolean;
  readonly children: ReactNode;
  readonly defaultValue?: string | null;
  readonly values?: readonly TabValue[];
  readonly groupId?: string;
  readonly className?: string;
  readonly queryString?: string | boolean;
}

// Extended Tabs type used across the OpenAPI theme; preserves the historical
// shape that included an optional `length` field.
export interface TabProps extends TabsProps {
  length?: number;
}

export interface TabItemProps {
  readonly children: ReactNode;
  readonly value: string;
  readonly default?: boolean;
  readonly label?: string;
  readonly className?: string;
  readonly attributes?: { [key: string]: unknown };
}

export function sanitizeTabsChildren(children: ReactNode): ReactNode {
  return React.Children.toArray(children).filter((child) => child !== "\n");
}

function extractChildrenTabValues(children: ReactNode): TabValue[] {
  function isTabItemWithValueProp(
    comp: ReactElement
  ): comp is ReactElement<TabItemProps> {
    const { props } = comp;
    return !!props && typeof props === "object" && "value" in props;
  }

  const elements = React.Children.toArray(children).flatMap((child) => {
    if (!child) {
      return [];
    }
    if (isValidElement(child) && isTabItemWithValueProp(child)) {
      return [child];
    }
    const badChildTypeName =
      // @ts-expect-error: guarding against unexpected cases
      typeof child.type === "string" ? child.type : child.type.name;
    throw new Error(
      `Docusaurus error: Bad <Tabs> child <${badChildTypeName}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.
If you do not want to pass on a "value" prop to the direct children of <Tabs>, you can also pass an explicit <Tabs values={...}> prop.`
    );
  });

  return elements.map(
    ({ props: { value, label, attributes, default: isDefault } }) => ({
      value,
      label,
      attributes,
      default: isDefault,
    })
  );
}

function ensureNoDuplicateValue(values: readonly TabValue[]) {
  const dup = duplicates(values, (a, b) => a.value === b.value);
  if (dup.length > 0) {
    throw new Error(
      `Docusaurus error: Duplicate values "${dup
        .map((a) => `'${a.value}'`)
        .join(", ")}" found in <Tabs>. Every value needs to be unique.`
    );
  }
}

function useTabValues(
  props: Pick<TabsProps, "values" | "children">
): readonly TabValue[] {
  const { values: valuesProp, children } = props;
  return useMemo(() => {
    const values = valuesProp ?? extractChildrenTabValues(children);
    ensureNoDuplicateValue(values);
    return values;
  }, [valuesProp, children]);
}

function isValidValue({
  value,
  tabValues,
}: {
  value: string | null | undefined;
  tabValues: readonly TabValue[];
}) {
  return tabValues.some((a) => a.value === value);
}

function getInitialStateValue({
  defaultValue,
  tabValues,
}: {
  defaultValue: TabsProps["defaultValue"];
  tabValues: readonly TabValue[];
}): string {
  if (tabValues.length === 0) {
    throw new Error(
      "Docusaurus error: the <Tabs> component requires at least one <TabItem> children component"
    );
  }
  if (defaultValue) {
    if (!isValidValue({ value: defaultValue, tabValues })) {
      throw new Error(
        `Docusaurus error: The <Tabs> has a defaultValue "${defaultValue}" but none of its children has the corresponding value. Available values are: ${tabValues
          .map((a) => a.value)
          .join(
            ", "
          )}. If you intend to show no default tab, use defaultValue={null} instead.`
      );
    }
    return defaultValue;
  }
  const defaultTabValue =
    tabValues.find((tabValue) => tabValue.default) ?? tabValues[0];
  if (!defaultTabValue) {
    throw new Error("Unexpected error: 0 tabValues");
  }
  return defaultTabValue.value;
}

function getStorageKey(groupId: string | undefined) {
  if (!groupId) {
    return null;
  }
  return `docusaurus.tab.${groupId}`;
}

function getQueryStringKey({
  queryString = false,
  groupId,
}: Pick<TabsProps, "queryString" | "groupId">) {
  if (typeof queryString === "string") {
    return queryString;
  }
  if (queryString === false) {
    return null;
  }
  if (queryString === true && !groupId) {
    throw new Error(
      `Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".`
    );
  }
  return groupId ?? null;
}

// Inlined from @docusaurus/theme-common/internal historyUtils.useQueryStringValue
function useQueryStringValue(key: string | null): string | null {
  const history = useHistory();
  return useSyncExternalStore(
    history.listen,
    () =>
      key === null
        ? null
        : new URLSearchParams(history.location.search).get(key),
    () => null
  );
}

function useTabQueryString({
  queryString = false,
  groupId,
}: Pick<TabsProps, "queryString" | "groupId">) {
  const history = useHistory();
  const key = getQueryStringKey({ queryString, groupId });
  const value = useQueryStringValue(key);

  const setValue = useCallback(
    (newValue: string) => {
      if (!key) {
        return;
      }
      const searchParams = new URLSearchParams(history.location.search);
      searchParams.set(key, newValue);
      history.replace({ ...history.location, search: searchParams.toString() });
    },
    [key, history]
  );

  return [value, setValue] as const;
}

function useTabStorage({ groupId }: Pick<TabsProps, "groupId">) {
  const key = getStorageKey(groupId);
  const [value, storageSlot] = useStorageSlot(key);

  const setValue = useCallback(
    (newValue: string) => {
      if (!key) {
        return;
      }
      storageSlot.set(newValue);
    },
    [key, storageSlot]
  );

  return [value, setValue] as const;
}

type TabsContextValue = {
  selectedValue: string;
  selectValue: (value: string) => void;
  tabValues: readonly TabValue[];
  lazy: boolean;
  block: boolean;
};

export function useTabsContextValue(props: TabsProps): TabsContextValue {
  const { defaultValue, queryString = false, groupId } = props;
  const tabValues = useTabValues(props);

  const [selectedValue, setSelectedValue] = useState(() =>
    getInitialStateValue({ defaultValue, tabValues })
  );

  const [queryStringValue, setQueryString] = useTabQueryString({
    queryString,
    groupId,
  });

  const [storageValue, setStorageValue] = useTabStorage({
    groupId,
  });

  const valueToSync = (() => {
    const value = queryStringValue ?? storageValue;
    if (!isValidValue({ value, tabValues })) {
      return null;
    }
    return value;
  })();

  useIsomorphicLayoutEffect(() => {
    if (valueToSync) {
      setSelectedValue(valueToSync);
    }
  }, [valueToSync]);

  const selectValue = useCallback(
    (newValue: string) => {
      if (!isValidValue({ value: newValue, tabValues })) {
        throw new Error(`Can't select invalid tab value=${newValue}`);
      }
      setSelectedValue(newValue);
      setQueryString(newValue);
      setStorageValue(newValue);
    },
    [setQueryString, setStorageValue, tabValues]
  );

  return {
    selectedValue,
    selectValue,
    tabValues,
    lazy: props.lazy ?? false,
    block: props.block ?? false,
  };
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabs(): TabsContextValue {
  const contextValue = React.useContext(TabsContext);
  if (!contextValue) {
    throw new Error("useTabsContext() must be used within a Tabs component");
  }
  return contextValue;
}

export function TabsProvider(props: {
  children: ReactNode;
  value: TabsContextValue;
}): ReactNode {
  // ScrollControllerProvider is mounted here so every tab consumer
  // (our six OpenAPI tab variants + the swizzled @theme/Tabs) gets a working
  // useScrollPositionBlocker without callers needing a separate provider.
  return (
    <ScrollControllerProvider>
      <TabsContext.Provider value={props.value}>
        {props.children}
      </TabsContext.Provider>
    </ScrollControllerProvider>
  );
}
