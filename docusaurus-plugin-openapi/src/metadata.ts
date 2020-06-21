// /**
//  * Copyright (c) Facebook, Inc. and its affiliates.
//  *
//  * This source code is licensed under the MIT license found in the
//  * LICENSE file in the root directory of this source tree.
//  */

// import path from "path";
// import {
//   parseMarkdownFile,
//   aliasedSitePath,
//   normalizeUrl,
//   getEditUrl,
// } from "@docusaurus/utils";
// import { LoadContext } from "@docusaurus/types";

// import lastUpdate from "./lastUpdate";
// import { MetadataRaw, LastUpdateData, MetadataOptions } from "./types";

// type Args = {
//   source: string;
//   refDir: string;
//   context: LoadContext;
//   options: MetadataOptions;
// };

// async function lastUpdated(
//   filePath: string,
//   options: MetadataOptions
// ): Promise<LastUpdateData> {
//   const { showLastUpdateAuthor, showLastUpdateTime } = options;
//   if (showLastUpdateAuthor || showLastUpdateTime) {
//     // Use fake data in dev for faster development.
//     const fileLastUpdateData =
//       process.env.NODE_ENV === "production"
//         ? await lastUpdate(filePath)
//         : {
//             author: "Author",
//             timestamp: 1539502055,
//           };

//     if (fileLastUpdateData) {
//       const { author, timestamp } = fileLastUpdateData;
//       return {
//         lastUpdatedAt: showLastUpdateTime ? timestamp : undefined,
//         lastUpdatedBy: showLastUpdateAuthor ? author : undefined,
//       };
//     }
//   }

//   return {};
// }

// export default async function processMetadata({
//   source,
//   refDir,
//   context,
//   options,
// }: Args): Promise<MetadataRaw> {
//   const { routeBasePath, editUrl, homePageId } = options;
//   const { siteDir, baseUrl } = context;
//   const filePath = path.join(refDir, source);

//   const fileMarkdownPromise = parseMarkdownFile(filePath);
//   const lastUpdatedPromise = lastUpdated(filePath, options);

//   const dirName = path.dirname(source);

//   // The version portion of the url path. Eg: 'next', '1.0.0', and ''.
//   const versionPath = "";

//   const relativePath = path.relative(siteDir, filePath);

//   const docsEditUrl = getEditUrl(relativePath, editUrl);

//   const { frontMatter = {}, excerpt } = await fileMarkdownPromise;
//   const { sidebar_label, custom_edit_url } = frontMatter;

//   // Default base id is the file name.
//   const baseID: string =
//     frontMatter.id || path.basename(source, path.extname(source));
//   if (baseID.includes("/")) {
//     throw new Error('Document id cannot include "/".');
//   }
//   const id = dirName !== "." ? `${dirName}/${baseID}` : baseID;
//   const idWithoutVersion = id;

//   const isDocsHomePage = idWithoutVersion === homePageId;
//   if (frontMatter.slug && isDocsHomePage) {
//     throw new Error(
//       `The docs homepage (homePageId=${homePageId}) is not allowed to have a frontmatter slug=${frontMatter.slug} => you have to chooser either homePageId or slug, not both`
//     );
//   }

//   const baseSlug: string = frontMatter.slug || baseID;
//   if (baseSlug.includes("/")) {
//     throw new Error('Document slug cannot include "/".');
//   }
//   const slug = dirName !== "." ? `${dirName}/${baseSlug}` : baseSlug;

//   // Default title is the id.
//   const title: string = frontMatter.title || baseID;

//   const description: string = frontMatter.description || excerpt;

//   // The last portion of the url path. Eg: 'foo/bar', 'bar'.
//   let routePath;
//   if (isDocsHomePage) {
//     // TODO can we remove this trailing / ?
//     // Seems it's not that easy...
//     // Related to https://github.com/facebook/docusaurus/issues/2917
//     routePath = "/";
//   } else {
//     routePath = slug;
//   }

//   const permalink = normalizeUrl([
//     baseUrl,
//     routeBasePath,
//     versionPath,
//     routePath,
//   ]);

//   const { lastUpdatedAt, lastUpdatedBy } = await lastUpdatedPromise;

//   // Assign all of object properties during instantiation (if possible) for
//   // NodeJS optimization.
//   // Adding properties to object after instantiation will cause hidden
//   // class transitions.
//   const metadata: MetadataRaw = {
//     id,
//     isDocsHomePage,
//     title,
//     description,
//     source: aliasedSitePath(filePath, siteDir),
//     permalink,
//     editUrl: custom_edit_url !== undefined ? custom_edit_url : docsEditUrl,
//     lastUpdatedBy,
//     lastUpdatedAt,
//     sidebar_label,
//   };

//   return metadata;
// }
