import { Effect, Queue, Schema as S, Stream } from 'effect'
import * as Mount from 'foldkit/mount'

import { Message } from '../../message'

/** Place a nested treemap tooltip at the pointer, in the chart's SVG coordinates. */
export const ObserveTreemapPointer = Mount.defineStream('ObserveTreemapPointer', {
  args: { id: S.String, width: S.Number, height: S.Number },
  messages: [Message.ChartTreemapMoved],
  execute: ({ element, id, width, height }) =>
    Stream.callback<ReturnType<typeof Message.ChartTreemapMoved>>((queue) =>
      Effect.gen(function* () {
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            const move = (event: Event) => {
              if (!(event instanceof MouseEvent)) return
              const svg = element.querySelector('svg')
              if (svg === null) return
              const rect = svg.getBoundingClientRect()
              if (rect.width === 0 || rect.height === 0) return
              Queue.offerUnsafe(
                queue,
                Message.ChartTreemapMoved({
                  id,
                  x: ((event.clientX - rect.left) / rect.width) * width,
                  y: ((event.clientY - rect.top) / rect.height) * height,
                }),
              )
            }
            element.addEventListener('mousemove', move)
            return move
          }),
          (move) => Effect.sync(() => element.removeEventListener('mousemove', move)),
        )
        return yield* Effect.never
      }),
    ),
})
