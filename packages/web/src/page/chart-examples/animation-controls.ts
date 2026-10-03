import type { Html, HtmlBuilder } from 'foldkit/html'

import type { Model } from '../../model'
import { Message } from '../../message'

type Option = Readonly<{ value: string; label: string }>
type Toggle = Readonly<{ key: string; label: string }>
type Config = Readonly<{
  id: string
  duration: number
  replayLabel?: string
  swapLabel?: string
  modeLabel?: string
  modes?: ReadonlyArray<Option>
  defaultMode?: string
  toggles?: ReadonlyArray<Toggle>
}>

export const animationControls = (model: Model, h: HtmlBuilder<Message>, config: Config): Html => {
  const duration = model.chartAnimationDurations[config.id] ?? config.duration
  const mode =
    model.chartAnimationModes[config.id] ?? config.defaultMode ?? config.modes?.[0]?.value ?? ''
  return h.div(
    [h.Class('flex flex-wrap items-center gap-2 text-sm')],
    [
      h.button(
        [
          h.Class('rounded border px-3 py-1'),
          h.OnClick(Message.ChartAnimationReplayed({ id: config.id })),
        ],
        [config.replayLabel ?? 'Replay entrance animation'],
      ),
      h.button(
        [
          h.Class('rounded border px-3 py-1'),
          h.OnClick(Message.ChartDatasetSwapped({ id: config.id })),
        ],
        [config.swapLabel ?? '⇄ Swap dataset (Shows update animation)'],
      ),
      ...(config.modes === undefined
        ? []
        : [
            h.label(
              [],
              [
                config.modeLabel ?? 'animationInterpolateFn',
                ' ',
                h.select(
                  [
                    h.Class('rounded border px-2 py-1'),
                    h.Value(mode),
                    h.OnChange((value) =>
                      Message.ChartAnimationModeChanged({ id: config.id, value }),
                    ),
                  ],
                  config.modes.map((option) => h.option([h.Value(option.value)], [option.label])),
                ),
              ],
            ),
          ]),
      h.label(
        [],
        [
          'animationDuration ',
          h.input([
            h.Type('number'),
            h.Min('0'),
            h.Value(String(duration)),
            h.OnInput((value) => Message.ChartAnimationDurationChanged({ id: config.id, value })),
            h.Class('w-24 rounded border px-2 py-1'),
          ]),
        ],
      ),
      ...(config.toggles ?? []).map((toggle) =>
        h.label(
          [h.Class('inline-flex items-center gap-1')],
          [
            h.input([
              h.Type('checkbox'),
              h.Checked(!model.chartAnimationDisabled.has(`${config.id}:${toggle.key}`)),
              h.OnChange(() => Message.ChartAnimationToggled({ id: `${config.id}:${toggle.key}` })),
            ]),
            toggle.label,
          ],
        ),
      ),
    ],
  )
}
