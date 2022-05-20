import { create } from "../utils";
import { ContactObject } from "../../openapi/types";

export function createContactInfo(contact: ContactObject) {
  if (!contact) return "";
  const { name, url, email } = contact;

  return create("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      marginBottom: "var(--ifm-paragraph-margin-bottom)",
    },
    children: [
      create("h3", {
        style: {
          marginBottom: "0.25rem",
        },
        children: "Contact",
      }),
      create("span", {
        children: [
          `${name}: `,
          create("a", {
            href: `mailto:${email}`,
            children: `${email}`,
          }),
        ],
      }),
      create("span", {
        children: [
          "URL: ",
          create("a", {
            href: `${url}`,
            children: `${url}`,
          }),
        ],
      }),
    ],
  });
}
