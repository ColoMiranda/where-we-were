import { parseArgs } from "node:util";
import { withDb } from "../db.ts";
import { CliError } from "../errors.ts";
import { resolveCwdProject } from "../store.ts";

export async function project(argv: string[]): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      check: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
    },
    allowPositionals: false,
  });

  await withDb(async (db) => {
    const proj = await resolveCwdProject(db);

    if (values.check) {
      // Exit code only, by design: no stdout, no stderr, either way.
      process.exit(proj ? 0 : 1);
    }

    if (!proj) {
      throw new CliError("Not a registered project. www init <name> to register.");
    }

    if (values.json) {
      console.log(JSON.stringify(proj, null, 2));
    } else {
      console.log(
        `${proj.id} — ${proj.name} ${proj.remote ? `(${proj.remote})` : "(local)"}`,
      );
    }
  });
}
