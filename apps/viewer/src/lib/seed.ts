// Seed data for v1 development — illustrative content standing in for
// Supabase records. Shapes mirror Marcos's real projects; details are synthetic.
import type { Project, Win, WwwTask } from "./types";

const daysAgo = (d: number, h = 0) =>
  new Date(Date.now() - (d * 24 + h) * 3600_000).toISOString();

export const projects: Project[] = [
  {
    id: "www",
    name: "where we were",
    remote: "github.com/marcosmiranda/where-we-were",
    statusNote:
      "Product doc settled after the third reframe: memory + staging ground, todo layer deferred. Viewer build just started — board home is being designed first; CLI untouched.",
    lastTouched: daysAgo(0, 2),
  },
  {
    id: "kb",
    name: "knowledge base",
    remote: "github.com/marcosmiranda/kb",
    statusNote:
      "Compile pipeline is stable and the wiki sits at ~140 pages. Distill from Cortex works but over-extracts; needs a novelty threshold before it's trustworthy on big sessions.",
    lastTouched: daysAgo(1, 4),
  },
  {
    id: "arkiv-site",
    name: "arkiv website",
    remote: "github.com/arkiv-network/arkiv-website",
    statusNote:
      "Hero rework shipped and the brand lock held through review. Pricing section is next; waiting on final copy from marketing before the layout can close.",
    lastTouched: daysAgo(2, 1),
  },
  {
    id: "sync",
    name: "tech sync skill",
    remote: null,
    statusNote:
      "Weekly loop runs clean. The Tuesday leads edition still ranks epics by commit count, which everyone agrees is wrong; needs the decision-capture pass wired in first.",
    lastTouched: daysAgo(6),
  },
  {
    id: "home-server",
    name: "home server",
    remote: "github.com/marcosmiranda/home-server",
    statusNote:
      "Migrated to the new box and everything boots. Backups are still manual — the restic timer was never re-enabled after the move.",
    lastTouched: daysAgo(19),
    dormant: true,
  },
  {
    id: "recipes",
    name: "family recipes",
    remote: null,
    statusNote:
      "Twelve recipes transcribed from the notebook. Stalled at the photo pass; nothing blocks it except daylight and a free Sunday.",
    lastTouched: daysAgo(34),
    dormant: true,
  },
  {
    id: "finance",
    name: "finance scripts",
    remote: "github.com/marcosmiranda/finance-scripts",
    statusNote:
      "Monthly import works for both banks. Categorization rules drift every statement; parked until it actually hurts.",
    lastTouched: daysAgo(48),
    dormant: true,
  },
];

export const tasks: WwwTask[] = [
  {
    id: "t1",
    title: "Build the board home screen with zoom levels",
    projectId: "www",
    status: "in-progress",
    priority: 1,
    lastTouched: daysAgo(0, 2),
    sessionLabel: "mbp · claude-code",
    context: {
      repo: "github.com/marcosmiranda/where-we-were",
      branch: "main",
      sha: "a41f2c9",
      decisions: [
        "Briefing column, same order on phone and desktop",
        "Three zoom levels: Focus / Overview / Map",
        "mymind-inspired world, marigold ribbon accent",
      ],
      nextStep: "Wire the capture bar to Supabase once the screen is approved",
    },
  },
  {
    id: "t2",
    title: "Design the CLI save payload for session distill",
    projectId: "www",
    status: "todo",
    priority: 2,
    lastTouched: daysAgo(1),
  },
  {
    id: "t3",
    title: "Add a novelty threshold to the distill prepass",
    projectId: "kb",
    status: "blocked-needs-decision",
    priority: 1,
    lastTouched: daysAgo(1, 4),
    sessionLabel: "mbp · claude-code",
    blocker: {
      question: "Where should the novelty threshold live?",
      options: [
        { id: "o1", label: "Per-source config in frontmatter", recommended: true },
        { id: "o2", label: "Global setting in .kb/config.json" },
        { id: "o3", label: "Ask each compile run interactively" },
      ],
    },
  },
  {
    id: "t4",
    title: "Close the pricing section layout",
    projectId: "arkiv-site",
    status: "blocked-needs-decision",
    priority: 2,
    lastTouched: daysAgo(2, 1),
    blocker: {
      question: "Ship with placeholder copy or wait for marketing?",
      options: [
        { id: "o1", label: "Wait for final copy", recommended: true },
        { id: "o2", label: "Ship placeholder, swap later" },
      ],
    },
  },
  {
    id: "t5",
    title: "Re-enable the restic backup timer",
    projectId: "home-server",
    status: "parked-with-context",
    priority: 3,
    lastTouched: daysAgo(19),
    context: {
      repo: "github.com/marcosmiranda/home-server",
      branch: "main",
      sha: "9c03b1e",
      nextStep: "systemctl enable --now restic-backup.timer, then verify first run",
    },
  },
  {
    id: "t6",
    title: "Wire decision capture into the sync loop",
    projectId: "sync",
    status: "todo",
    priority: 2,
    lastTouched: daysAgo(6),
  },
  // Idea bag — projectless by definition.
  {
    id: "i1",
    title: "A tiny site that turns voice notes into a packing list",
    projectId: null,
    status: "idea",
    priority: 3,
    lastTouched: daysAgo(0, 8),
  },
  {
    id: "i2",
    title: "Try the new agent teams feature on the kb compile pipeline",
    projectId: null,
    status: "idea",
    priority: 3,
    lastTouched: daysAgo(2),
  },
  {
    id: "i3",
    title: "Photo book of the Lisbon trip for mum's birthday",
    projectId: null,
    status: "idea",
    priority: 3,
    lastTouched: daysAgo(4),
  },
  {
    id: "i4",
    title: "Benchmark Supabase vs Turso for single-user apps",
    projectId: null,
    status: "idea",
    priority: 3,
    lastTouched: daysAgo(9),
  },
  {
    id: "i5",
    title: "A 'what broke this week' digest for the home server",
    projectId: null,
    status: "idea",
    priority: 3,
    lastTouched: daysAgo(12),
  },
];

export const wins: Win[] = [
  {
    id: "w1",
    projectId: "www",
    line: "Product doc survived its third adversarial review — scope finally holds",
    at: daysAgo(0, 5),
  },
  {
    id: "w2",
    projectId: "arkiv-site",
    line: "Hero rework shipped; brand lock held through design review",
    at: daysAgo(2),
  },
  {
    id: "w3",
    projectId: "kb",
    line: "Compile pipeline handled a 40-source batch without a single dangling link",
    at: daysAgo(5),
  },
];
