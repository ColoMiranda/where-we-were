// A task the start band offers: what a row draws and what a press picks up.
// `at` is when the task was last touched (ms since the epoch);
// `isParkedOnClose` marks a save by an earlier chat's close job.
export type WwwBandTask = {
  id: string
  title: string
  status: string
  at: number
  isParkedOnClose: boolean
}

// The start band: the project's status note and its first open tasks, or the
// one line saying www could not answer.
export type WwwBand = { note: string; tasks: WwwBandTask[]; more: number } | { error: string }

// What decides and feeds the close job: a person at the prompt, a folder
// that is a www project, the work since this chat last parked, the task the
// band handed to this chat, and the chat's transcript (its end is the job's input).
export type WwwCloseWatch = {
  isInteractive: boolean
  isRegistered: boolean
  edits: number
  prompts: number
  pickedTaskId?: string
  transcriptPath?: string
}

declare module 'claude-code' {
  interface PluginState {
    www: {
      // band: null once the first prompt is sent, or when there is nothing to show.
      band: WwwBand | null
      // taskKeys: the digit keys the band's task rows take, 0 to 3. recent-chats
      // starts its own keys after them.
      taskKeys: number
      closeWatch: WwwCloseWatch
    }
  }
}
