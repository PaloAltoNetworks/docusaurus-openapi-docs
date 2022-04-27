/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

const IS_DRY_RUN =
  process.argv.slice(2).findIndex((arg) => /--dry-{0,1}run/i.test(arg)) !== -1;

export function createDryRun<T extends (...args: any) => any>(cmd: T) {
  if (IS_DRY_RUN) {
    return (...args: Parameters<T>) => {
      const arg0 = args[0];
      const arg1 = args[1];

      let commandString = `${cmd.name}(\`${arg0}\`)`;

      if (arg1 !== undefined) {
        commandString = `${cmd.name}(\`${arg0}\`, ${JSON.stringify(
          arg1,
          null,
          2
        )})`;
      }

      console.log();
      for (const line of commandString.split("\n")) {
        console.log(`> ${line}`);
      }
      console.log();
    };
  }

  return cmd;
}
