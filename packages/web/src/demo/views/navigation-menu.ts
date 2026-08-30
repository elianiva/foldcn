import { Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Update from 'foldkit/update'

import * as NavMenu from '../../generated/registry/ui/navigation-menu'
import { icon } from '../../generated/registry/lib/icons'
import { CircleAlert, CircleCheck, CircleDashed } from 'lucide'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const NavigationMenu = NavMenu.NavigationMenu

const Message = defineMessageUnion({
  GotNavigationMenuMessage: { message: NavMenu.Message },
})

const COMPONENTS: ReadonlyArray<{ title: string; href: string; description: string }> = [
  {
    title: 'Alert Dialog',
    href: '/docs/primitives/alert-dialog',
    description: 'A modal dialog that interrupts the user with important content.',
  },
  {
    title: 'Hover Card',
    href: '/docs/primitives/hover-card',
    description: 'For sighted users to preview content available behind a link.',
  },
  {
    title: 'Progress',
    href: '/docs/primitives/progress',
    description: 'Displays an indicator showing the completion progress of a task.',
  },
  {
    title: 'Scroll-area',
    href: '/docs/primitives/scroll-area',
    description: 'Visually or semantically separates content.',
  },
  {
    title: 'Tabs',
    href: '/docs/primitives/tabs',
    description: 'A set of layered sections of content displayed one at a time.',
  },
  {
    title: 'Tooltip',
    href: '/docs/primitives/tooltip',
    description: 'A popup that displays information related to an element.',
  },
]

const toParentMessage = (message: NavMenu.Message): AppMessage =>
  Message.GotNavigationMenuMessage({ message })

const GETTING_STARTED_ID = 'getting-started'
const COMPONENTS_ID = 'components'
const WITH_ICON_ID = 'with-icon'
const NAV_ITEM_IDS = [GETTING_STARTED_ID, COMPONENTS_ID, WITH_ICON_ID] as const

const navDropdown = (
  id: string,
  trigger: string,
  content: ReadonlyArray<Html>,
  model: Model,
  h: HtmlBuilder<AppMessage>,
): Html =>
  NavigationMenu.item(
    {},
    [
      h.submodel({
        slotId: id,
        model: NavMenu.getPopover(model.navigationMenu, id),
        view: NavMenu.view,
        viewInputs: NavMenu.dropdownViewInputs({ id, trigger }, content, h),
        toParentMessage: (message) =>
          toParentMessage(NavMenu.Message.GotItemMessage({ id, message })),
      }),
    ],
    h,
  )

export const navigationMenuView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          NavigationMenu(
            {},
            [
              NavigationMenu.list(
                {},
                [
                  navDropdown(
                    GETTING_STARTED_ID,
                    'Getting started',
                    [
                      h.ul(
                        [h.Class('grid w-96 gap-1')],
                        [
                          navListItem(
                            h,
                            'Introduction',
                            '/docs',
                            'Re-usable components built with Tailwind CSS.',
                          ),
                          navListItem(
                            h,
                            'Installation',
                            '/docs/installation',
                            'How to install dependencies and structure your app.',
                          ),
                          navListItem(
                            h,
                            'Typography',
                            '/docs/primitives/typography',
                            'Styles for headings, paragraphs, lists...etc',
                          ),
                        ],
                      ),
                    ],
                    model,
                    h,
                  ),
                  navDropdown(
                    COMPONENTS_ID,
                    'Components',
                    [
                      h.ul(
                        [h.Class('grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]')],
                        COMPONENTS.map((c) => navListItem(h, c.title, c.href, c.description)),
                      ),
                    ],
                    model,
                    h,
                  ),
                  navDropdown(
                    WITH_ICON_ID,
                    'With Icon',
                    [
                      h.ul(
                        [h.Class('grid w-[200px] gap-1')],
                        [
                          h.li(
                            [],
                            [
                              NavigationMenu.link(
                                { href: '#', className: 'flex-row items-center gap-2' },
                                [icon(h, CircleAlert, 'size-4'), ' Backlog'],
                                h,
                              ),
                            ],
                          ),
                          h.li(
                            [],
                            [
                              NavigationMenu.link(
                                { href: '#', className: 'flex-row items-center gap-2' },
                                [icon(h, CircleDashed, 'size-4'), ' To Do'],
                                h,
                              ),
                            ],
                          ),
                          h.li(
                            [],
                            [
                              NavigationMenu.link(
                                { href: '#', className: 'flex-row items-center gap-2' },
                                [icon(h, CircleCheck, 'size-4'), ' Done'],
                                h,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                    model,
                    h,
                  ),
                  NavigationMenu.item(
                    {},
                    [
                      NavigationMenu.link(
                        { href: '/docs', className: NavMenu.navigationMenuTriggerStyle() },
                        ['Docs'],
                        h,
                      ),
                    ],
                    h,
                  ),
                ],
                h,
              ),
            ],
            h,
          ),
        ],
      ),
    ],
  )

const navListItem = (
  h: HtmlBuilder<AppMessage>,
  title: string,
  href: string,
  description: string,
): Html =>
  h.li(
    [],
    [
      NavigationMenu.link(
        { href },
        [
          h.div(
            [h.Class('flex flex-col gap-1 text-sm')],
            [
              h.div([h.Class('leading-none font-medium')], [title]),
              h.div([h.Class('line-clamp-2 text-muted-foreground')], [description]),
            ],
          ),
        ],
        h,
      ),
    ],
  )

const fields = { navigationMenu: NavMenu.Model }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

const foldNavigationMenu = Update.foldChild({
  update: NavMenu.update,
  read: (model: State) => Option.some(model.navigationMenu),
  write: (model, next) => evo(model, { navigationMenu: () => next }),
  toParentMessage,
  foldOutMessage: (): Update.Step<State, unknown> => (model) => ({ model }),
})

export const slice = defineSlice({
  fields,
  init: { navigationMenu: NavMenu.init(NAV_ITEM_IDS) },
  messages: [Message.GotNavigationMenuMessage],
  handlers: (model: State) => ({
    GotNavigationMenuMessage: (
      payload: typeof Message.GotNavigationMenuMessage.Type,
    ): UpdateReturn => foldNavigationMenu(model, payload.message),
  }),
  samples: [],
})
