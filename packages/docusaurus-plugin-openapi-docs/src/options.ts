/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { Joi } from "@docusaurus/utils-validation";

const sidebarOptions = Joi.object({
  groupPathsBy: Joi.string().valid("tag"),
  // TODO: Remove "none" in 2.0, make it the default if not specified
  categoryLinkSource: Joi.string().valid("tag", "info", "none"),
  customProps: Joi.object(),
  sidebarCollapsible: Joi.boolean(),
  sidebarCollapsed: Joi.boolean(),
});

const markdownGenerators = Joi.object({
  createApiPageMD: Joi.function(),
  createInfoPageMD: Joi.function(),
  createTagPageMD: Joi.function(),
});

export const OptionsSchema = Joi.object({
  id: Joi.string().required(),
  docsPluginId: Joi.string().required(),
  config: Joi.object()
    .pattern(
      /^/,
      Joi.object({
        specPath: Joi.string().required(),
        proxy: Joi.string(),
        outputDir: Joi.string().required(),
        template: Joi.string(),
        downloadUrl: Joi.string(),
        hideSendButton: Joi.boolean(),
        showExtensions: Joi.boolean(),
        sidebarOptions: sidebarOptions,
        markdownGenerators: markdownGenerators,
        version: Joi.string().when("versions", {
          is: Joi.exist(),
          then: Joi.required(),
        }),
        label: Joi.string().when("versions", {
          is: Joi.exist(),
          then: Joi.required(),
        }),
        baseUrl: Joi.string().when("versions", {
          is: Joi.exist(),
          then: Joi.required(),
        }),
        versions: Joi.object().pattern(
          /^/,
          Joi.object({
            specPath: Joi.string().required(),
            outputDir: Joi.string().required(),
            label: Joi.string().required(),
            baseUrl: Joi.string().required(),
          })
        ),
      })
    )
    .required(),
});
