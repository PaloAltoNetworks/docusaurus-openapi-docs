/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { useDoc } from "@docusaurus/plugin-content-docs/client";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useTypedSelector } from "@theme/ApiItem/hooks";
import type { ThemeConfig } from "docusaurus-theme-openapi-docs/src/types";

/**
 * Whether the explorer can send a request for this operation: it is not a
 * webhook, a server or proxy is available, and the send button is not hidden.
 */
export default function useCanSendRequest(method: string): boolean {
  const { frontMatter } = useDoc();
  const { siteConfig } = useDocusaurusContext();
  const { proxy: frontMatterProxy, hide_send_button: hideSendButton } =
    frontMatter as { proxy?: string; hide_send_button?: boolean };
  // Frontmatter proxy (per-spec) takes precedence over theme config proxy (site-wide)
  const proxy =
    frontMatterProxy ?? (siteConfig.themeConfig as ThemeConfig).api?.proxy;
  const hasServers = useTypedSelector(
    (state: any) => (state.server?.options?.length ?? 0) > 0
  );

  return method !== "event" && (hasServers || !!proxy) && !hideSendButton;
}
