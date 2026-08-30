import { Array } from 'effect'
import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { File } from 'foldkit'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as fileDrop from '../../generated/registry/ui/file-drop'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotFileDropMessage: { message: fileDrop.Message },
  ClickedRemoveFile: { fileIndex: S.Number },
})

export const fileDropView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
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
        toParentMessage: (message) => Message.GotFileDropMessage({ message }),
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
                h.OnClick(Message.ClickedRemoveFile({ fileIndex: index })),
              ],
              ['Remove'],
            ),
          ],
        ),
      ),
    ],
  )

const foldNoOp =
  (): ((out: fileDrop.OutMessage) => Update.Step<State, unknown>) => () => (model) => ({ model })

const foldFileDropOutMessage = M.type<fileDrop.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    ReceivedFiles:
      ({ files }) =>
      (model) => ({ model: evo(model, { fileDropFiles: () => [...model.fileDropFiles, ...files] }) }),
    RejectedNonFiles: foldNoOp(),
  }),
)

const foldFileDrop = Update.foldChild({
  update: fileDrop.update,
  read: (model: State) => Option.some(model.fileDrop),
  write: (model, next) => evo(model, { fileDrop: () => next }),
  toParentMessage: (message) => Message.GotFileDropMessage({ message }),
  foldOutMessage: foldFileDropOutMessage,
})

const fields = {
  fileDrop: fileDrop.Model,
  fileDropFiles: S.Array(File.File),
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    fileDrop: fileDrop.init({ id: 'file-drop-demo' }),
    fileDropFiles: [],
  },
  messages: [Message.GotFileDropMessage, Message.ClickedRemoveFile],
  handlers: (model: State) => ({
    GotFileDropMessage: (payload: typeof Message.GotFileDropMessage.Type): UpdateReturn =>
      foldFileDrop(model, payload.message),
    ClickedRemoveFile: ({ fileIndex }: typeof Message.ClickedRemoveFile.Type): UpdateReturn => ({
      model: evo(model, {
        fileDropFiles: () => Array.remove(model.fileDropFiles, fileIndex),
      }),
    }),
  }),
})
