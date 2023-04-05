import React from "react";
import clsx from "clsx";
import { translate } from "@docusaurus/Translate";
import styles from "./styles.module.css";
export default function ExitButton({ className, handler }) {
  return (
    <button
      type="button"
      aria-label={translate({
        id: "theme.CodeBlock.exitButtonAriaLabel",
        message: "Exit expanded view",
        description: "The ARIA label for exit expanded view button",
      })}
      title={translate({
        id: "theme.CodeBlock.copy",
        message: "Copy",
        description: "The exit button label on code blocks",
      })}
      className={clsx("clean-btn", className, styles.exitButton)}
      onClick={handler}
    >
      <span className={styles.exitButtonIcons} aria-hidden="true">
        <svg className={styles.exitButtonIcon} viewBox="0 0 384 512">
          <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
        </svg>
      </span>
    </button>
  );
}
