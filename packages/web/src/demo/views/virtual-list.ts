import { Command, Subscription, Update } from 'foldkit'
import { Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { createLazy } from 'foldkit/html'

import { VirtualList as FoldkitVirtualList } from '@foldkit/ui'

import * as virtualList from '../../generated/registry/ui/virtual-list'
import { badge } from '../../generated/registry/ui/badge'
import { button } from '../../generated/registry/ui/button'
import { Empty } from '../../generated/registry/ui/empty'
import { inputClass } from '../../generated/registry/ui/input'
import { icon } from '../../generated/registry/lib/icons'
import { ArrowUp, ChevronRight, LocateFixed, Search, Users, X } from 'lucide'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotVirtualListMessage: { message: virtualList.Message },
  UpdatedVirtualListSearch: { value: S.String },
  SelectedVirtualListTeam: { team: S.String },
  ClearedVirtualListFilters: {},
  ClickedScrollToMiddle: {},
  ClickedScrollToTop: {},
})

export const VIRTUAL_LIST_ROW_COUNT = 100_000

export const ROW_HEIGHT_PX = 64

const ALL_TEAMS = 'All'

const TEAMS = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Support'] as const

type Team = (typeof TEAMS)[number]

type Status = 'Active' | 'Away' | 'Invited'

type Person = Readonly<{
  index: number
  name: string
  handle: string
  role: string
  team: Team
  status: Status
  lastActive: string
  initials: string
  tone: string
  searchBlob: string
}>

type DemoItem =
  | Readonly<{ tag: 'header'; team: string; count: number }>
  | Readonly<{ tag: 'person'; person: Person }>

const FIRST_NAMES = [
  'Ada',
  'Grace',
  'Alan',
  'Linus',
  'Barbara',
  'Margaret',
  'Katherine',
  'Dorothy',
  'Tim',
  'Guido',
  'Yukihiro',
  'Brendan',
  'Linus',
  'Rob',
  'Ken',
  'Dennis',
  'Bjarne',
  'James',
  'Anders',
  'Chris',
  'Julia',
  'Hadley',
  'Wes',
  'Katie',
  'Marco',
  'Lena',
  'Priya',
  'Ravi',
  'Chen',
  'Yuki',
  'Sofia',
  'Mateo',
  'Amara',
  'Kwame',
  'Ingrid',
  'Lars',
  'Freya',
  'Oscar',
  'Nadia',
  'Omar',
  'Elena',
  'Viktor',
  'Aisha',
  'Diego',
  'Hana',
  'Kenji',
  'Zara',
  'Felix',
] as const

const LAST_NAMES = [
  'Lovelace',
  'Hopper',
  'Turing',
  'Torvalds',
  'Liskov',
  'Hamilton',
  'Johnson',
  'Vaughan',
  'Berners-Lee',
  'van Rossum',
  'Matsumoto',
  'Eich',
  'Pike',
  'Thompson',
  'Ritchie',
  'Stroustrup',
  'Gosling',
  'Hejlsberg',
  'Lattner',
  'Evans',
  'Wickham',
  'McKinney',
  'Boone',
  'Stone',
  'Rossi',
  'Fischer',
  'Sharma',
  'Patel',
  'Wei',
  'Tanaka',
  'Garcia',
  'Lopez',
  'Diallo',
  'Mensah',
  'Larsen',
  'Johansson',
  'Nilsen',
  'Weber',
  'Haddad',
  'Farouk',
  'Petrova',
  'Novak',
  'Khan',
  'Silva',
  'Sato',
  'Yamamoto',
  'Ali',
  'Moreau',
] as const

const ROLES = [
  'Frontend Engineer',
  'Backend Engineer',
  'Product Designer',
  'Product Manager',
  'Data Scientist',
  'DevOps Engineer',
  'QA Engineer',
  'Engineering Manager',
  'Design Lead',
  'Support Specialist',
  'Account Executive',
  'Marketing Manager',
] as const

const LAST_ACTIVE = ['5m ago', '32m ago', '2h ago', 'Yesterday', '3d ago', 'Last week'] as const

const AVATAR_TONES = [
  'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
] as const

const mulberry32 = (seed: number): (() => number) => {
  let state = seed >>> 0
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const buildPersons = (count: number): ReadonlyArray<Person> => {
  const pick = mulberry32(0xc10c9)
  return Array.from({ length: count }, (_, index) => {
    const first = FIRST_NAMES[Math.floor(pick() * FIRST_NAMES.length)]!
    const last = LAST_NAMES[Math.floor(pick() * LAST_NAMES.length)]!
    const name = `${first} ${last}`
    const team = TEAMS[Math.floor(pick() * TEAMS.length)]!
    const role = ROLES[Math.floor(pick() * ROLES.length)]!
    const statusRoll = pick()
    const status: Status = statusRoll < 0.72 ? 'Active' : statusRoll < 0.87 ? 'Away' : 'Invited'
    const handle = `@${first.toLowerCase()}${last.toLowerCase().replace(/[^a-z]/g, '')}${index % 997}`
    const lastActive =
      status === 'Active' && pick() < 0.45
        ? 'Active now'
        : LAST_ACTIVE[Math.floor(pick() * LAST_ACTIVE.length)]!
    const person: Person = {
      index,
      name,
      handle,
      role,
      team,
      status,
      lastActive,
      initials: `${first[0]}${last[0]}`.toUpperCase(),
      tone: AVATAR_TONES[index % AVATAR_TONES.length]!,
      searchBlob: `${name} ${handle} ${role}`.toLowerCase(),
    }
    return person
  })
}

const PERSONS: ReadonlyArray<Person> = buildPersons(VIRTUAL_LIST_ROW_COUNT)

const statusVariant = (status: Status): 'secondary' | 'outline' | 'ghost' =>
  status === 'Active' ? 'secondary' : status === 'Away' ? 'outline' : 'ghost'

const formatCount = (count: number): string => count.toLocaleString('en-US')

export const filteredPersons = (search: string, team: string): ReadonlyArray<Person> => {
  const query = search.trim().toLowerCase()
  return PERSONS.filter(
    (person) =>
      (team === ALL_TEAMS || person.team === team) &&
      (query === '' || person.searchBlob.includes(query)),
  )
}

type VisibleList = Readonly<{
  items: ReadonlyArray<DemoItem>
  personCount: number
  groupCount: number
}>

const TEAM_INDEX: Readonly<Record<string, number>> = Object.fromEntries(
  TEAMS.map((team, index) => [team, index]),
)

/** Single-pass grouping: buckets members per team and emits header bands with
 *  counts, so one walk yields items and both counters (the old shape paid a
 *  full filter pass per team plus two more reduce passes per render). */
const buildGrouped = (persons: ReadonlyArray<Person>): VisibleList => {
  const buckets: Array<Array<Person>> = TEAMS.map(() => [])
  for (const person of persons) buckets[TEAM_INDEX[person.team]!]!.push(person)
  const items: Array<DemoItem> = []
  let groupCount = 0
  for (let index = 0; index < TEAMS.length; index++) {
    const members = buckets[index]!
    if (members.length === 0) continue
    groupCount += 1
    items.push({ tag: 'header', team: TEAMS[index]!, count: members.length })
    for (const person of members) items.push({ tag: 'person', person })
  }
  return { items, personCount: persons.length, groupCount }
}

/** Precomputed unfiltered list (headers + all rows) so idle scrolling pays
 *  no filter cost — only keystrokes and team switches rebuild the array. */
const DEFAULT_VISIBLE: VisibleList = buildGrouped(PERSONS)

const computeVisible = (search: string, team: string): VisibleList =>
  search.trim() === '' && team === ALL_TEAMS
    ? DEFAULT_VISIBLE
    : buildGrouped(filteredPersons(search, team))

/** Last-args memo for the visible list. Scroll ticks re-render with the same
 *  (search, team), so every scroll render is a cache hit and the
 *  filter+group work runs only on keystrokes and team switches. Keyed by
 *  value (two small strings), never by row — rows are unbounded, so they
 *  stay out of any memo map. */
let visibleCache: { search: string; team: string; visible: VisibleList } | null = null

export const getVisible = (search: string, team: string): VisibleList => {
  const cached = visibleCache
  if (cached !== null && cached.search === search && cached.team === team) return cached.visible
  const visible = computeVisible(search, team)
  visibleCache = { search, team, visible }
  return visible
}

export const visibleItems = (search: string, team: string): ReadonlyArray<DemoItem> =>
  getVisible(search, team).items

const personRow = (person: Person, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex h-full w-full items-center gap-3 border-b border-border px-4')],
    [
      h.div(
        [
          h.Class(
            `flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${person.tone}`,
          ),
        ],
        [person.initials],
      ),
      h.div(
        [h.Class('flex min-w-0 flex-1 flex-col justify-center gap-0.5')],
        [
          h.div(
            [h.Class('flex min-w-0 items-center gap-2')],
            [
              h.span([h.Class('truncate text-sm font-medium')], [person.name]),
              badge<AppMessage>({ variant: statusVariant(person.status) }, [person.status], h),
            ],
          ),
          h.div(
            [h.Class('truncate text-xs text-muted-foreground')],
            [`${person.handle} · ${person.role} · ${person.team}`],
          ),
        ],
      ),
      h.div(
        [h.Class('hidden shrink-0 items-center gap-1.5 sm:flex')],
        [
          h.span([h.Class('text-xs text-muted-foreground')], [person.lastActive]),
          icon(h, ChevronRight, 'size-4 text-muted-foreground'),
        ],
      ),
    ],
  )

const headerRow = (team: string, count: number, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex h-full w-full items-center gap-2 border-b border-border bg-muted/50 px-4')],
    [
      h.span(
        [h.Class('text-[11px] font-semibold tracking-wider text-muted-foreground uppercase')],
        [team],
      ),
      h.span(
        [
          h.Class(
            'rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground',
          ),
        ],
        [formatCount(count)],
      ),
    ],
  )

/** Memo slots for the scroll-stable subtrees. Each renders at exactly one
 *  position and takes only primitives + the frame builder as args, so every
 *  scroll tick — which changes just the virtual-list child model — is a cache
 *  hit, skipping both VNode construction and subtree diffing. The list itself
 *  stays unmemoized (it must re-render on every scroll), and rows stay out of
 *  keyed memo maps (row keys are unbounded at 100k). */
const headerLazy = createLazy()
const toolbarLazy = createLazy()
const footerLazy = createLazy()

const directoryHeader = (h: HtmlBuilder<AppMessage>, shownPersons: number): Html =>
  h.div(
    [h.Class('flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center')],
    [
      h.div(
        [h.Class('flex min-w-0 items-center gap-3')],
        [
          h.div(
            [h.Class('flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted')],
            [icon(h, Users, 'size-4')],
          ),
          h.div(
            [h.Class('flex min-w-0 flex-col')],
            [
              h.span([h.Class('text-sm font-medium')], ['Team directory']),
              h.span(
                [h.Class('truncate text-xs text-muted-foreground')],
                ['100,000 members virtualized — only visible rows mount.'],
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex shrink-0 items-center gap-2 sm:ml-auto')],
        [badge<AppMessage>({ variant: 'secondary' }, [`${formatCount(shownPersons)} shown`], h)],
      ),
    ],
  )

const directoryToolbar = (
  h: HtmlBuilder<AppMessage>,
  search: string,
  team: string,
  isFiltering: boolean,
): Html =>
  h.div(
    [h.Class('flex flex-col gap-2 border-b border-border bg-muted/40 p-3')],
    [
      h.div(
        [h.Class('flex flex-col gap-2 lg:flex-row lg:items-center')],
        [
          h.div(
            [h.Class('relative w-full lg:max-w-xs')],
            [
              h.span(
                [h.Class('pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2')],
                [icon(h, Search, 'size-4 text-muted-foreground')],
              ),
              h.input([
                h.Type('search'),
                h.Placeholder('Search name, handle, or role…'),
                h.Value(search),
                h.OnInput((value) => Message.UpdatedVirtualListSearch({ value })),
                h.Class(`${inputClass} pl-8`),
              ]),
            ],
          ),
          h.div(
            [h.Class('flex flex-wrap items-center gap-1.5')],
            [
              ...[ALL_TEAMS, ...TEAMS].map((option) =>
                button<AppMessage>(
                  {
                    variant: team === option ? 'secondary' : 'outline',
                    size: 'xs',
                    onClick: Message.SelectedVirtualListTeam({ team: option }),
                  },
                  option,
                  h,
                ),
              ),
              ...(isFiltering
                ? [
                    button<AppMessage>(
                      {
                        variant: 'ghost',
                        size: 'xs',
                        onClick: Message.ClearedVirtualListFilters(),
                      },
                      h.span(
                        [h.Class('inline-flex items-center gap-1')],
                        [icon(h, X, 'size-3'), 'Clear'],
                      ),
                      h,
                    ),
                  ]
                : []),
            ],
          ),
          h.div(
            [h.Class('flex items-center gap-2 lg:ml-auto')],
            [
              button<AppMessage>(
                {
                  variant: 'outline',
                  size: 'sm',
                  onClick: Message.ClickedScrollToTop(),
                },
                h.span(
                  [h.Class('inline-flex items-center gap-1.5')],
                  [icon(h, ArrowUp, 'size-3.5'), 'Top'],
                ),
                h,
              ),
              button<AppMessage>(
                {
                  variant: 'outline',
                  size: 'sm',
                  onClick: Message.ClickedScrollToMiddle(),
                },
                h.span(
                  [h.Class('inline-flex items-center gap-1.5')],
                  [icon(h, LocateFixed, 'size-3.5'), 'Middle'],
                ),
                h,
              ),
            ],
          ),
        ],
      ),
    ],
  )

const directoryFooter = (
  h: HtmlBuilder<AppMessage>,
  shownPersons: number,
  groupCount: number,
): Html =>
  h.div(
    [
      h.Class(
        'flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border px-4 py-2.5 text-xs text-muted-foreground',
      ),
    ],
    [
      h.span(
        [],
        [
          `${formatCount(shownPersons)} of ${formatCount(VIRTUAL_LIST_ROW_COUNT)} members${groupCount > 0 ? ` · ${groupCount} teams` : ''}`,
        ],
      ),
      h.span([h.Class('ml-auto')], ['Tip: scroll fast — overscan keeps it smooth.']),
    ],
  )

export const virtualListView = (model: Model, h: HtmlBuilder<AppMessage>): Html => {
  const search = model.virtualListSearch
  const team = model.virtualListTeam
  const { items, personCount, groupCount } = getVisible(search, team)
  const isFiltering = search.trim() !== '' || team !== ALL_TEAMS

  return h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Team directory']),
          h.div(
            [h.Class('w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm')],
            [
              headerLazy(directoryHeader, [h, personCount]),
              toolbarLazy(directoryToolbar, [h, search, team, isFiltering]),
              ...(items.length === 0
                ? [
                    Empty<AppMessage>(
                      { className: 'rounded-none border-0 py-10' },
                      [
                        Empty.header<AppMessage>(
                          {},
                          [
                            Empty.media<AppMessage>(
                              { variant: 'icon' },
                              [icon(h, Search, 'size-4')],
                              h,
                            ),
                            Empty.title<AppMessage>({}, ['No members found'], h),
                            Empty.description<AppMessage>(
                              {},
                              [
                                `Nothing matches “${search.trim()}”${team === ALL_TEAMS ? '' : ` in ${team}`}. Try a different search or team.`,
                              ],
                              h,
                            ),
                          ],
                          h,
                        ),
                        Empty.content<AppMessage>(
                          {},
                          [
                            button<AppMessage>(
                              {
                                variant: 'outline',
                                size: 'sm',
                                onClick: Message.ClearedVirtualListFilters(),
                              },
                              h.span(
                                [h.Class('inline-flex items-center gap-1.5')],
                                [icon(h, X, 'size-3.5'), 'Clear filters'],
                              ),
                              h,
                            ),
                          ],
                          h,
                        ),
                      ],
                      h,
                    ),
                  ]
                : [
                    h.submodel({
                      slotId: model.virtualList.id,
                      model: model.virtualList,
                      view: virtualList.view<DemoItem>(),
                      viewInputs: virtualList.styledViewInputs<DemoItem>({
                        items,
                        itemToKey: (item) =>
                          item.tag === 'header'
                            ? `header-${item.team}`
                            : `person-${item.person.index}`,
                        itemToView: (item) =>
                          item.tag === 'header'
                            ? headerRow(item.team, item.count, h)
                            : personRow(item.person, h),
                        itemToRowHeightPx: () => ROW_HEIGHT_PX,
                        containerClass: 'h-[420px] rounded-none border-0 shadow-none',
                      }),
                      toParentMessage: (message) => Message.GotVirtualListMessage({ message }),
                    }),
                  ]),
              footerLazy(directoryFooter, [h, personCount, groupCount]),
            ],
          ),
        ],
      ),
    ],
  )
}

const foldVirtualList = Update.foldChild({
  update: virtualList.update,
  read: (model: State) => Option.some(model.virtualList),
  write: (model, next) => evo(model, { virtualList: () => next }),
  toParentMessage: (message) => Message.GotVirtualListMessage({ message }),
})

/** Reset the list to the top. Zeroes the child model's `scrollTop` directly
 *  instead of waiting for the command's scroll event to flow back: a
 *  programmatic `scrollTop` set on an element that is already at 0 fires no
 *  event (e.g. after a style-switch remount), which would leave the model
 *  stranded past the end of a freshly filtered list and render it blank. */
const topOfList = (model: State) => {
  const zeroed = evo(model.virtualList, { scrollTop: () => 0 })
  const { model: next, commands = [] } = FoldkitVirtualList.scrollToIndex(zeroed, 0)
  return {
    next,
    commands: Command.mapMessages(commands, (message) =>
      Message.GotVirtualListMessage({ message }),
    ),
  }
}

const fields = {
  virtualList: virtualList.Model,
  virtualListSearch: S.String,
  virtualListTeam: S.String,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const subscriptions = Subscription.lift({
  virtualListContainerEvents: FoldkitVirtualList.subscriptions.containerEvents,
})<State, typeof Message.GotVirtualListMessage.Type>({
  toChildModel: (model) => model.virtualList,
  toParentMessage: (message) => Message.GotVirtualListMessage({ message }),
})

export const slice = defineSlice({
  fields,
  init: {
    virtualList: virtualList.init({ id: 'virtual-list-demo', rowHeightPx: ROW_HEIGHT_PX }),
    virtualListSearch: '',
    virtualListTeam: ALL_TEAMS,
  },
  messages: [
    Message.GotVirtualListMessage,
    Message.UpdatedVirtualListSearch,
    Message.SelectedVirtualListTeam,
    Message.ClearedVirtualListFilters,
    Message.ClickedScrollToMiddle,
    Message.ClickedScrollToTop,
  ],
  handlers: (model: State) => ({
    GotVirtualListMessage: (payload: typeof Message.GotVirtualListMessage.Type): UpdateReturn =>
      foldVirtualList(model, payload.message),
    UpdatedVirtualListSearch: (
      payload: typeof Message.UpdatedVirtualListSearch.Type,
    ): UpdateReturn => {
      const { next, commands } = topOfList(model)
      return {
        model: evo(model, {
          virtualListSearch: () => payload.value,
          virtualList: () => next,
        }),
        commands,
      }
    },
    SelectedVirtualListTeam: (
      payload: typeof Message.SelectedVirtualListTeam.Type,
    ): UpdateReturn => {
      if (payload.team === model.virtualListTeam) return { model }
      const { next, commands } = topOfList(model)
      return {
        model: evo(model, {
          virtualListTeam: () => payload.team,
          virtualList: () => next,
        }),
        commands,
      }
    },
    ClearedVirtualListFilters: (): UpdateReturn => {
      const { next, commands } = topOfList(model)
      return {
        model: evo(model, {
          virtualListSearch: () => '',
          virtualListTeam: () => ALL_TEAMS,
          virtualList: () => next,
        }),
        commands,
      }
    },
    ClickedScrollToMiddle: (): UpdateReturn => {
      const items = getVisible(model.virtualListSearch, model.virtualListTeam).items
      const { model: next, commands = [] } = FoldkitVirtualList.scrollToIndex(
        model.virtualList,
        Math.floor(items.length / 2),
      )
      return {
        model: evo(model, { virtualList: () => next }),
        commands: Command.mapMessages(commands, (message) =>
          Message.GotVirtualListMessage({ message }),
        ),
      }
    },
    ClickedScrollToTop: (): UpdateReturn => {
      const { next, commands } = topOfList(model)
      return {
        model: evo(model, { virtualList: () => next }),
        commands,
      }
    },
  }),
  samples: [
    Message.UpdatedVirtualListSearch({ value: 'ada' }),
    Message.SelectedVirtualListTeam({ team: 'Engineering' }),
    Message.ClearedVirtualListFilters(),
  ],
  // Virtual-list events arrive through the child's own update; there are no
  // parent-side samples to feed update().
  subscriptions,
})
