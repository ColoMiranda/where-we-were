import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { WwwBand, WwwCloseWatch } from '../types'
import { bandTasks, captureAnswer, chatExcerpt, closeJobArgv, closeJobInput, contextText, EDIT_TOOLS, errorLine, fit, isShellWrite, isWwwPark, loaded, parentDirs, rowTail, shouldPark } from './parse'
import type { Loaded, Ran } from './parse'

const band = atom({ plugin: 'www', key: 'band' } as const, null as WwwBand | null)
const taskKeys = atom({ plugin: 'www', key: 'taskKeys' } as const, 0)
const closeWatch = atom({ plugin: 'www', key: 'closeWatch' } as const, { isInteractive: false, isRegistered: false, edits: 0, prompts: 0 } as WwwCloseWatch)

const RUN_MS = 20_000
// The transcript's tail the close job's excerpt is cut from: the last
// prompts and replies fit in far less, but a long tool result can take most of it.
const TAIL_BYTES = 1_048_576
// How long the first request waits for the start-up runs; past it, the
// session goes without the www section.
const CONTEXT_WAIT_MS = 3_000

// The start-up runs of this conversation: the band and the first request
// share them, and the close job lists the open tasks they found.
let loading: Promise<Loaded> | undefined
let lastLoaded: Loaded | undefined
// Set once a prompt is sent or the session did not start fresh, so a slow
// start-up run never brings the band back.
let isBandClosed = false
// The system prompt section, fixed for one session at its first request so
// the prompt cache holds; `text` null: no section. A hot reload (development
// only) computes it once more.
let context: { sessionId: string; text: string | null } | undefined

// A `www` run; undefined when it could not start (no `www` on PATH) or timed out.
async function run($: EngineInterface, argv: string[]): Promise<Ran> {
  try {
    const { exitCode, stdout, stderr } = await $.process.run(argv, { timeoutMs: RUN_MS })
    return { exitCode, stdout, stderr }
  } catch {
    return undefined
  }
}

// What www says about this folder. ponytail: two CLI runs, each a database
// round trip, at every start in any folder; add a .www-marker or git-remote
// fast path if starts feel slow.
function load($: EngineInterface): Promise<Loaded> {
  loading ??= Promise.all([run($, ['www', 'project', '--json']), run($, ['www', 'list', '--json'])]).then(([project, list]) => (lastLoaded = loaded(project, list)))
  return loading
}

async function closeBand($: EngineInterface) {
  isBandClosed = true
  if ((await read($, band)) !== null) await update($, band, () => null)
  if ((await read($, taskKeys)) !== 0) await update($, taskKeys, () => 0)
}

// Whether this folder or one above it holds a .www marker. Without the
// database, the marker is the one sign this folder is a www project.
async function hasMarker($: EngineInterface): Promise<boolean> {
  for (const dir of parentDirs(await $.session.cwd())) {
    const isFound = await $.fs.stat(`${dir === '/' ? '' : dir}/.www`).then(
      () => true,
      () => false,
    )
    if (isFound) return true
  }
  return false
}

// Off the start hook, so the session never waits on the database: whether
// the folder is a www project (the close job needs it), and on a fresh start
// the band. A project with no note and no open task shows no band.
async function start($: EngineInterface, isFresh: boolean) {
  const found = await load($)
  await update($, closeWatch, watch => ({ ...watch, isRegistered: found.kind === 'project' }))
  if (!isFresh || isBandClosed || found.kind === 'none') return
  // www that cannot answer (offline, no config) says so only where a marker
  // shows this is a www project, never in every folder.
  if (found.kind === 'error') {
    if (await hasMarker($)) await update($, band, () => ({ error: found.message }))
    return
  }
  const offer = bandTasks(found.tasks)
  const note = found.project.statusNote.trim()
  if (offer.tasks.length === 0 && note === '') return
  await update($, band, () => ({ note, ...offer }))
  await update($, taskKeys, () => offer.tasks.length)
}

// A band press: the task's copy-as-prompt text into the prompt box. The
// person presses Enter; the close job later saves onto this task.
async function pick($: EngineInterface, id: string) {
  const short = id.slice(0, 8)
  const ran = await run($, ['www', 'prompt', id])
  const text = ran?.exitCode === 0 ? ran.stdout.trim() : ''
  if (text === '') {
    $.ui.toast(ran === undefined ? 'www did not run. Is it on PATH?' : `${errorLine(ran.stderr)} Run: www prompt ${short}`)
    return
  }
  const { isFilled } = await $.prompt.fill({ text })
  if (!isFilled) {
    $.ui.toast(`Could not fill the prompt box. Run: www prompt ${short}`)
    return
  }
  await update($, closeWatch, watch => ({ ...watch, pickedTaskId: id }))
}

// /idea and /todo: one `www add`, no model turn. Outside a www project the
// CLI files a /todo in the idea bag, and the answer says so.
async function capture($: EngineInterface, args: string, isIdea: boolean): Promise<{ text: string }> {
  const title = args.trim()
  if (title === '') return { text: `Usage: /${isIdea ? 'idea' : 'todo'} <one line>` }
  // `--` first, so a title that starts with "-" is never read as a flag.
  const ran = await run($, ['www', 'add', '--json', ...(isIdea ? ['--idea'] : []), '--', title])
  if (ran === undefined) return { text: 'www did not run. Is it on PATH?' }
  return { text: ran.exitCode === 0 ? captureAnswer(ran.stdout) : errorLine(ran.stderr) }
}

// The section for this session's system prompt: decided at its first
// request from the start-up runs (if they answer in time), then kept, so
// the prompt cache holds.
async function contextFor($: EngineInterface): Promise<string | null> {
  const sessionId = await $.session.id()
  if (context?.sessionId === sessionId) return context.text
  const found = await Promise.race([load($), $.clock.sleep(CONTEXT_WAIT_MS).then(() => undefined)])
  context = { sessionId, text: found?.kind === 'project' ? contextText(found.project, found.tasks) : null }
  return context.text
}

export const register: Register = (on, options) => {
  // The plugin's "Park on close" setting (userConfig closeJob): on unless turned off.
  const isCloseJobOn = options.closeJob !== false

  // Every new conversation (a start, a resume, a /clear) gets its own
  // counters, start-up runs and system prompt section; only a fresh start
  // gets the band. A compaction keeps the conversation.
  on('classic.SessionStart', async ($, e, next) => {
    if (e.source !== 'compact') {
      if (e.source !== 'startup') await closeBand($)
      await update($, closeWatch, watch => ({ isInteractive: watch.isInteractive, isRegistered: watch.isRegistered, edits: 0, prompts: 0, transcriptPath: e.transcript_path }))
      loading = undefined
      lastLoaded = undefined
      const isFresh = e.source === 'startup'
      $.clock.after(0, () => void start($, isFresh))
    }

    return next(e)
  })

  // Whether a person is at the prompt (only then a close job), and the capture commands.
  on('session.start', async ($, e, next) => {
    await update($, closeWatch, watch => ({ ...watch, isInteractive: e.isInteractive }))
    await Promise.allSettled([
      $.command.register({ name: 'idea', description: 'Save a one-line idea to the www idea bag, no model turn', argumentHint: '<one line>', immediate: true }),
      $.command.register({ name: 'todo', description: 'Save a one-line task to this www project, no model turn', argumentHint: '<one line>', immediate: true }),
    ])

    return next(e)
  })

  on('command.run', { command: 'idea' }, ($, e) => capture($, e.args, true))
  on('command.run', { command: 'todo' }, ($, e) => capture($, e.args, false))

  // The first prompt ends the band. Only prompts a person sends (typed, or
  // from the phone through Remote Control) count toward the close job: not
  // task notifications, schedules, peers or plugins.
  on('prompt.submit', async ($, e, next) => {
    await closeBand($)
    if (e.origin.kind === 'composer' || e.origin.kind === 'bridge') await update($, closeWatch, watch => ({ ...watch, prompts: watch.prompts + 1 }))

    return next(e)
  })

  // /wrap closes the session on purpose: it parks what is left, or decides
  // nothing is, so the close job has nothing to add after it.
  on('command.run', async ($, e, next) => {
    const ran = await next(e)
    if (e.command === 'wrap' || e.command === 'www:wrap') await update($, closeWatch, watch => ({ ...watch, edits: 0, prompts: 0 }))

    return ran
  })

  // Watches, never steers: a file edit (an edit tool, or a shell command
  // that writes files) counts toward the close job, and a park (a www save
  // with what is left) means this chat saved its own work so far.
  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && ran.isError !== true) {
      const isPark = e.tool === 'Bash' && isWwwPark(e.command)
      const isEdit = EDIT_TOOLS.has(String(e.tool)) || (e.tool === 'Bash' && !isPark && isShellWrite(e.command))
      if (isPark) await update($, closeWatch, watch => ({ ...watch, edits: 0, prompts: 0 }))
      else if (isEdit) await update($, closeWatch, watch => ({ ...watch, edits: watch.edits + 1 }))
    }

    return ran
  }).catch(($, e, next) => next(e))

  // The close job: the end of this chat handed to a detached, lean run that
  // outlives this process (see closeJobArgv).
  on('session.end', async ($, e, next) => {
    try {
      const watch = await read($, closeWatch)
      if (isCloseJobOn && shouldPark(watch) && watch.transcriptPath !== undefined) {
        const tail = await $.process.run(['tail', '-c', String(TAIL_BYTES), '--', watch.transcriptPath], { timeoutMs: 500 })
        const excerpt = chatExcerpt(tail.stdout)
        if (excerpt !== '') {
          const found = lastLoaded?.kind === 'project' ? lastLoaded : undefined
          const input = closeJobInput(excerpt, found?.project.id, found?.tasks ?? [], watch.pickedTaskId)
          await $.process.run(closeJobArgv(e.resume.id, `${$.plugin.root}/skills/www/SKILL.md`), { stdin: input, timeoutMs: 800 })
        }
      }
    } catch {
      // A close job that cannot start must never hold up the exit.
    }

    return next(e)
  })

  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)
    const text = await contextFor($)

    return text === null ? composed : { sections: [...composed.sections, { id: 'www:context', text, scope: 'session' as const }] }
  })

  // The start band, over the other mods' rows: the status note, then up to
  // three tasks, keys 1 to 3. A survey holds the band alone.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const shown = await read($, band)
    if (e.props.hasSurvey || shown === null) return next(e)
    const { Box, Button, Text } = $.ui.resolve(e)
    // Nothing beneath (a test's bare engine): the band alone.
    const rest = await next(e).catch(() => undefined)

    if ('error' in shown) {
      return (
        <Box flexDirection="column">
          <Text dimColor wrap="truncate-end">
            {shown.error}
          </Text>
          {rest}
        </Box>
      )
    }

    const now = await $.clock.now()
    const width = e.props.bodyColumns

    return (
      <Box flexDirection="column">
        {shown.note !== '' && (
          <Text dimColor wrap="wrap">
            {fit(`Where we were: ${shown.note}`, width * 2 - 2)}
          </Text>
        )}
        {shown.tasks.map((task, i) => {
          const tail = rowTail(task, now)
          // `1: ` before the title, a space and the tail after it.
          const room = width - tail.length - 4
          return (
            <Box gap={1}>
              <Button key={`task-${i + 1}`} plain hotkey={String(i + 1)} label={fit(task.title, room)} onPress={() => pick($, task.id)} />
              <Text dimColor>{tail}</Text>
            </Box>
          )
        })}
        {shown.more > 0 && <Text dimColor>{`   +${shown.more} more: www list`}</Text>}
        {rest}
      </Box>
    )
  })
}
