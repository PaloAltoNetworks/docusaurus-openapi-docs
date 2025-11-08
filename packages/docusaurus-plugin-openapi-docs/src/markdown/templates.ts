export const introMdTemplateDefault = `---
id: {{{id}}}
title: "{{{title}}}"
description: "{{{frontMatter.description}}}"
{{^api}}
sidebar_label: Introduction
{{/api}}
{{#api}}
sidebar_label: "{{{title}}}"
{{/api}}
{{^api}}
sidebar_position: 0
{{/api}}
hide_title: true
{{#api}}
hide_table_of_contents: true
{{/api}}
{{#json}}
api: {{{json}}}
{{/json}}
{{#api.method}}
sidebar_class_name: "{{{api.method}}} api-method"
{{/api.method}}
{{#infoPath}}
info_path: {{{infoPath}}}
{{/infoPath}}
custom_edit_url: null
{{#frontMatter.proxy}}
proxy: {{{frontMatter.proxy}}}
{{/frontMatter.proxy}}
{{#frontMatter.hide_send_button}}
hide_send_button: true
{{/frontMatter.hide_send_button}}
{{#frontMatter.show_extensions}}
show_extensions: true
{{/frontMatter.show_extensions}}
{{#frontMatter.mask_credentials_disabled}}
mask_credentials: false
{{/frontMatter.mask_credentials_disabled}}
---

{{{markdown}}}
      `;

export const infoMdTemplateDefault = `---
id: {{{id}}}
title: "{{{title}}}"
description: "{{{frontMatter.description}}}"
sidebar_label: "{{{title}}}"
hide_title: true
custom_edit_url: null
---

{{{markdown}}}

\`\`\`mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
\`\`\`
      `;

export const tagMdTemplateDefault = `---
id: {{{id}}}
title: "{{{frontMatter.description}}}"
description: "{{{frontMatter.description}}}"
custom_edit_url: null
---

{{{markdown}}}

\`\`\`mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
\`\`\`
      `;

export const schemaMdTemplateDefault = `---;
id: {{{id}}}
title: "{{{title}}}"
description: "{{{frontMatter.description}}}"
sidebar_label: "{{{title}}}"
hide_title: true
{{#schema}}
hide_table_of_contents: true
{{/schema}}
schema: true
sample: {{{frontMatter.sample}}}
custom_edit_url: null
---

{{{markdown}}}
            `;
