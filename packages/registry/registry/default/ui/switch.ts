import { Switch as FoldkitSwitch } from '@foldkit/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'

export const switchSizeKeys = ['default', 'sm'] as const
export type SwitchSize = (typeof switchSizeKeys)[number]

export const switchSizes: Record<SwitchSize, string> = {
  default: 'h-5 w-9',
  sm: 'h-3.5 w-6',
}

const switchBase =
  'peer group/switch inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input shadow-xs transition-[background-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-primary dark:bg-input/80 motion-reduce:transition-none'

export const switchClass = switchBase

export const switchThumbClass =
  'pointer-events-none block rounded-full bg-background ring-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:group-data-[checked]/switch:bg-primary-foreground dark:group-data-[unchecked]/switch:bg-foreground motion-reduce:transition-none'

export const switchThumbSizes: Record<SwitchSize, string> = {
  default: 'size-4 group-data-[checked]/switch:translate-x-4',
  sm: 'size-3 group-data-[checked]/switch:translate-x-3',
}

export const switchLabelClass =
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'

export const switchDescriptionClass = 'text-sm text-muted-foreground'

export const switchWrapperClass = 'flex items-center gap-3'

export const switchTextWrapperClass = 'flex flex-col gap-1'

export type SwitchConfig<M> = Readonly<{
  id: string
  isChecked: boolean
  onToggle: (isChecked: boolean) => M
  label: string
  maybeDescription?: string
  isDisabled?: boolean
  isReadOnly?: boolean
  name?: string
  value?: string
  size?: SwitchSize
  className?: string
  thumbClass?: string
  labelClass?: string
  descriptionClass?: string
  wrapperClass?: string
}>

/** Styled switch with label and optional description, built on the
 *  @foldkit/ui Switch helper. */
export const switch_ = <M>(config: SwitchConfig<M>, h: HtmlBuilder<M>): Html =>
  FoldkitSwitch.view<M>(
    {
      id: config.id,
      isChecked: config.isChecked,
      onToggle: config.onToggle,
      isDisabled: config.isDisabled,
      isReadOnly: config.isReadOnly,
      name: config.name,
      value: config.value,
      toView: (attributes) =>
        h.div(
          [h.Class(cn(switchWrapperClass, config.wrapperClass))],
          [
            h.button(
              [
                ...attributes.button,
                h.Class(cn(switchClass, switchSizes[config.size ?? 'default'], config.className)),
                h.DataAttribute('size', config.size ?? 'default'),
              ],
              [
                h.span([
                  h.Class(
                    cn(
                      switchThumbClass,
                      switchThumbSizes[config.size ?? 'default'],
                      config.thumbClass,
                    ),
                  ),
                ]),
              ],
            ),
            h.div(
              [h.Class(switchTextWrapperClass)],
              [
                h.label(
                  [...attributes.label, h.Class(cn(switchLabelClass, config.labelClass))],
                  [config.label],
                ),
                config.maybeDescription === undefined
                  ? h.empty
                  : h.p(
                      [
                        ...attributes.description,
                        h.Class(cn(switchDescriptionClass, config.descriptionClass)),
                      ],
                      [config.maybeDescription],
                    ),
              ],
            ),
          ],
        ),
    },
    h,
  )
