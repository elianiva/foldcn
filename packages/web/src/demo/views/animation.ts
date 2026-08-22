import type { Html, HtmlBuilder } from 'foldkit/html'

import * as animation from '@foldcn/registry/styles/default/ui/animation'

import { GotAnimationMessage, ToggledAnimation, type Message } from '../message'
import type { Model } from '../model'

export const animationView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-col items-start gap-4')],
    [
      h.button(
        [
          h.Class('rounded-md border border-input bg-background px-4 py-2 text-sm font-medium'),
          h.OnClick(ToggledAnimation()),
        ],
        [model.isAnimationShowing ? 'Hide content' : 'Show content'],
      ),
      h.submodel({
        slotId: model.animation.id,
        model: model.animation,
        view: animation.view,
        viewInputs: animation.styledViewInputs({
          animateSize: true,
          content: h.div(
            [h.Class('flex flex-col gap-2')],
            [
              h.p([h.Class('text-foreground')], ['This card animates in and out.']),
              h.p(
                [h.Class('text-sm text-muted-foreground')],
                [
                  'The Animation component coordinates CSS enter/leave lifecycles via data attributes; animateSize uses a CSS grid wrapper for smooth height animation.',
                ],
              ),
            ],
          ),
        }),
        toParentMessage: (message) => GotAnimationMessage({ message }),
      }),
    ],
  )
