/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import type { ThemeConfig } from "docusaurus-theme-openapi-docs/src/types";

export const SCHEMA_EXPANSION_STORAGE_KEY =
  "docusaurus-openapi-schema-expansion-level";

export interface SchemaExpansionConfig {
  enabled: boolean;
  defaultLevel: number;
  max: number;
  persist: boolean;
}

interface SchemaExpansionContextValue {
  config: SchemaExpansionConfig;
  level: number;
  setLevel: (next: number) => void;
}

const DEFAULT_CONFIG: SchemaExpansionConfig = {
  enabled: false,
  defaultLevel: 0,
  max: 4,
  persist: true,
};

const SchemaExpansionContext = createContext<SchemaExpansionContextValue>({
  config: DEFAULT_CONFIG,
  level: 0,
  setLevel: () => {},
});

const SchemaDepthContext = createContext<number>(0);

export function normalizeLevel(value: number | "all" | undefined): number {
  if (value === "all") return Infinity;
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  return 0;
}

function readConfig(
  themeConfig: ThemeConfig | undefined
): SchemaExpansionConfig {
  const raw = themeConfig?.api?.schemaExpansion;
  if (!raw) return DEFAULT_CONFIG;
  const enabled = raw.enabled ?? false;
  return {
    enabled,
    defaultLevel: normalizeLevel(raw.default),
    max: typeof raw.max === "number" && raw.max > 0 ? Math.floor(raw.max) : 4,
    // Persistence only matters when the reader can change the level via the
    // UI control. When the control is hidden, fall back to the configured
    // default on every visit so it isn't shadowed by a stale localStorage
    // value from a session where the control used to be enabled.
    persist: enabled ? (raw.persist ?? true) : false,
  };
}

function readPersistedLevel(): number | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const stored = window.localStorage.getItem(SCHEMA_EXPANSION_STORAGE_KEY);
    if (stored === null) return undefined;
    if (stored === "all") return Infinity;
    const parsed = parseInt(stored, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function writePersistedLevel(level: number): void {
  if (typeof window === "undefined") return;
  try {
    const value = level === Infinity ? "all" : String(level);
    window.localStorage.setItem(SCHEMA_EXPANSION_STORAGE_KEY, value);
  } catch {
    // ignore quota / disabled storage
  }
}

export const SchemaExpansionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { siteConfig } = useDocusaurusContext();
  const themeConfig = siteConfig.themeConfig as ThemeConfig | undefined;
  const config = useMemo(() => readConfig(themeConfig), [themeConfig]);

  const [level, setLevelState] = useState<number>(config.defaultLevel);

  useEffect(() => {
    if (!config.persist) return;
    const persisted = readPersistedLevel();
    if (persisted !== undefined) {
      setLevelState(persisted);
    }
  }, [config.persist]);

  const setLevel = useCallback(
    (next: number) => {
      setLevelState(next);
      if (config.persist) {
        writePersistedLevel(next);
      }
    },
    [config.persist]
  );

  const value = useMemo(
    () => ({ config, level, setLevel }),
    [config, level, setLevel]
  );

  return (
    <SchemaExpansionContext.Provider value={value}>
      {children}
    </SchemaExpansionContext.Provider>
  );
};

export const SchemaDepthProvider: React.FC<{
  depth: number;
  children: React.ReactNode;
}> = ({ depth, children }) => (
  <SchemaDepthContext.Provider value={depth}>
    {children}
  </SchemaDepthContext.Provider>
);

export function useSchemaExpansion(): SchemaExpansionContextValue {
  return useContext(SchemaExpansionContext);
}

export function useSchemaDepth(): number {
  return useContext(SchemaDepthContext);
}
