import React from "react";
import MD from "react-markdown";
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import ParamsTable from "@theme/ApiParamsTable";
import StatusCodesTable from "@theme/ApiStatusCodesTable";
import RequestBodyTable from "@theme/ApiRequestBodyTable";
import DocPaginator from "@theme/DocPaginator";

import styles from "./styles.module.css";
import "./styles.css";

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

import { MDXProvider } from "@mdx-js/react";
import MDXComponents from "@theme/MDXComponents";

let ApiDemoPanel = () => <div />;

if (ExecutionEnvironment.canUseDOM) {
  ApiDemoPanel = require("@theme/ApiDemoPanel").default;
}

function ApiItem({ openapi, content: DescriptionContent }) {
  const { siteConfig = {} } = useDocusaurusContext();
  const { title: siteTitle } = siteConfig;

  const {
    summary,
    description,
    deprecated,
    parameters,
    requestBody,
    "x-deprecated-description": deprecatedDescription,
    responses,
    next,
    previous,
  } = openapi;

  const metaTitle = summary ? `${summary} | ${siteTitle}` : siteTitle;

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta property="og:title" content={metaTitle} />
        {description && <meta name="description" content={description} />}
        {description && (
          <meta property="og:description" content={description} />
        )}
      </Head>
      <div className="padding-vert--lg">
        <div className="container">
          <div className="row">
            <div className="col">
              <div className={styles.docItemContainer}>
                <article>
                  <header>
                    <h1 className={styles.docTitle}>{summary}</h1>
                  </header>
                  <div className={"markdown " + styles.markdown}>
                    {deprecated && (
                      <div className="admonition admonition-caution alert alert--warning">
                        <div className="admonition-heading">
                          <h5>
                            <span className="admonition-icon">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"
                                ></path>
                              </svg>
                            </span>
                            deprecated
                          </h5>
                        </div>
                        {deprecatedDescription && (
                          <div className="admonition-content">
                            <MD
                              rehypePlugins={[rehypeRaw, rehypeSanitize]}
                              children={deprecatedDescription}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <MDXProvider components={MDXComponents}>
                      <DescriptionContent />
                    </MDXProvider>

                    {/* <MD rehypePlugins={[rehypeRaw, rehypeSanitize]} children={description} /> */}
                    <ParamsTable parameters={parameters} type="path" />
                    <ParamsTable parameters={parameters} type="query" />
                    <ParamsTable parameters={parameters} type="header" />
                    <ParamsTable parameters={parameters} type="cookie" />

                    <RequestBodyTable body={requestBody} title={"Request Body"} />

                    <StatusCodesTable responses={responses} />
                  </div>
                </article>
              </div>
            </div>
            <div className="col col--5">
              <ApiDemoPanel item={openapi} />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className={styles.docItemContainer}>
                <div className="margin-vert--lg">
                  <DocPaginator metadata={{ next, previous }} />
                </div>
              </div>
            </div>
            <div className="col col--5"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ApiItem;
