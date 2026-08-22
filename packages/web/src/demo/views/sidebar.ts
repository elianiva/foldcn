import type { Html, HtmlBuilder } from 'foldkit/html'

import { Sidebar, SidebarInset, SidebarProvider } from '@foldcn/registry/styles/default/ui/sidebar'

import type { Message } from '../message'
import type { Model } from '../model'

export const sideBarView = (model: Model, h: HtmlBuilder<Message>): Html =>
  SidebarProvider(
    {},
    [
      Sidebar(
        {},
        [
          Sidebar.header({}, [h.div([h.Class('font-semibold')], ['Acme Inc'])], h),
          Sidebar.content(
            {},
            [
              Sidebar.group(
                {},
                [
                  Sidebar.groupLabel({}, ['Platform'], h),
                  Sidebar.menu(
                    {},
                    [
                      Sidebar.menuItem({}, [Sidebar.menuButton({ isActive: true }, ['Dashboard'], h)], h),
                      Sidebar.menuItem({}, [Sidebar.menuButton({}, ['Projects'], h)], h),
                      Sidebar.menuItem({}, [Sidebar.menuButton({}, ['Team'], h)], h),
                    ],
                    h,
                  ),
                ],
                h,
              ),
            ],
            h,
          ),
          Sidebar.footer({}, [Sidebar.menuButton({}, ['Settings'], h)], h),
        ],
        h,
      ),
      SidebarInset(
        {},
        [
          h.header([h.Class('flex h-12 items-center border-b px-4')], ['Dashboard']),
          h.main([h.Class('p-4')], ['Main content area']),
        ],
        h,
      ),
    ],
    h,
  )
