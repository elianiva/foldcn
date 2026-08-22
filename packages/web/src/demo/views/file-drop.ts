import type { Html, HtmlBuilder } from 'foldkit/html'

import * as fileDrop from '@foldcn/registry/styles/default/ui/file-drop'

import {
  ClickedRemoveFile,
  GotFileDropMessage,
  type Message,
} from '../message'
import type { Model } from '../model'

export const fileDropView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('w-full max-w-md')],
    [
      h.submodel({
        slotId: model.fileDrop.id,
        model: model.fileDrop,
        view: fileDrop.view,
        viewInputs: fileDrop.styledViewInputs(
          {
            multiple: true,
            accept: ['image/*'],
            content: [
              h.span([h.Class('text-base font-medium')], ['Drag and drop files here']),
              h.span(
                [h.Class('text-sm text-muted-foreground')],
                ['or click to browse — up to a few MB each.'],
              ),
            ],
          },
          h,
        ),
        toParentMessage: (message) => GotFileDropMessage({ message }),
      }),
      ...model.fileDropFiles.map((_, index) =>
        h.div(
          [
            h.Class(
              'mt-2 flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2',
            ),
          ],
          [
            h.span([h.Class('truncate text-sm font-medium')], [`File ${index + 1}`]),
            h.button(
              [
                h.Class('text-sm text-muted-foreground transition-colors hover:text-destructive'),
                h.OnClick(ClickedRemoveFile({ fileIndex: index })),
              ],
              ['Remove'],
            ),
          ],
        ),
      ),
    ],
  )
