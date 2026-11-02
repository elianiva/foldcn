import { Effect, Queue, Schema as S, Stream } from 'effect'
import * as Mount from 'foldkit/mount'

import { Message } from '../../message'

/** Recharts responsive examples measure each layout cell, then redraw its SVG at that size. */
export const ObserveChartSize = Mount.defineStream('ObserveChartSize', {
  args: { id: S.String },
  messages: [Message.ChartResized],
  execute: ({ element, id }) =>
    Stream.callback<ReturnType<typeof Message.ChartResized>>((queue) =>
      Effect.gen(function* () {
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            let previous = ''
            const measure = () => {
              const rect = element.getBoundingClientRect()
              const width = Math.max(1, Math.round(rect.width))
              const height = Math.max(1, Math.round(rect.height))
              const key = `${width}:${height}`
              if (key === previous) return
              previous = key
              Queue.offerUnsafe(queue, Message.ChartResized({ id, width, height }))
            }
            const observer = new ResizeObserver(measure)
            observer.observe(element)
            measure()
            return observer
          }),
          (observer) => Effect.sync(() => observer.disconnect()),
        )
        return yield* Effect.never
      }),
    ),
})
