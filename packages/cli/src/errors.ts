/**
 * CLI error carrying the intended write payload, so a failed save prints
 * everything and nothing is lost ("fail loud, never clobber").
 */
export class CliError extends Error {
  payload?: unknown;
  constructor(message: string, payload?: unknown) {
    super(message);
    this.payload = payload;
  }
}
