import { create } from "../utils";
import { LicenseObject } from "../../openapi/types";

export function createLicense(license: LicenseObject) {
  if (!license) return "";
  const { name, url } = license;

  return create("div", {
    style: {
      marginBottom: "var(--ifm-paragraph-margin-bottom)",
    },
    children: [
      create("h3", {
        style: {
          marginBottom: "0.25rem",
        },
        children: "License",
      }),
      create("a", {
        href: url,
        children: name,
      }),
    ],
  });
}
