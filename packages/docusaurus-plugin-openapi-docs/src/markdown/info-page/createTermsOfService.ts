import { create } from "../utils";

export function createTermsOfService(termsOfService: string | undefined) {
  if (!createTermsOfService) return "";

  return create("div", {
    style: {
      marginBottom: "var(--ifm-paragraph-margin-bottom)",
    },
    children: [
      create("h3", {
        style: {
          marginBottom: "0.25rem",
        },
        children: "Terms of Service",
      }),
      create("a", {
        href: `${termsOfService}`,
        children: termsOfService,
      }),
    ],
  });
}
