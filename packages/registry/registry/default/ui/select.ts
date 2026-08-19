import { Listbox as FoldkitListbox, Select as FoldkitSelect } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/listbox'
import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { icon } from '@/lib/icons'
import { Check, ChevronDown } from 'lucide'
import { cn } from '@/lib/utils'

export const create = FoldkitListbox.create
export const init = FoldkitListbox.init
export const buttonId = FoldkitListbox.buttonId
export const Model = FoldkitListbox.Model
export type Model = typeof Model.Type
export const Message = FoldkitListbox.Message
export type Message = typeof Message.Type
export const OutMessage = FoldkitListbox.OutMessage
export type OutMessage = typeof OutMessage.Type

export type Bundle<Item = string> = FoldkitListbox.Bundle<Item>
export type InitConfig = FoldkitListbox.InitConfig
export type ViewInputs<Item, Value extends string = string> = FoldkitListbox.ViewInputs<Item, Value>
export type ItemConfig = FoldkitListbox.ItemConfig

export const selectTriggerClass =
  'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none transition-[color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[placeholder]:text-muted-foreground dark:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4 [&_svg:not([class*="text-"])]:text-muted-foreground motion-reduce:transition-none'

export const selectItemsClass =
  'z-50 max-h-96 min-w-[var(--button-width)] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none'

export const selectItemClass =
  'relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none transition-colors duration-150 ease-out data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:font-medium motion-reduce:transition-none'

export const selectLabelClass = 'text-sm font-medium leading-none'
export const selectDescriptionClass = 'text-sm text-muted-foreground'
export const selectWrapperClass = 'flex w-full flex-col gap-1.5'
export const selectBackdropClass = 'fixed inset-0 z-0'
export const SELECT_ANCHOR: AnchorConfig = { placement: 'bottom-start', gap: 4, padding: 8 }

export type SelectOption = Readonly<{ value: string; label: string }>

export type SelectViewInputsConfig<Item, Value extends string = string> = Readonly<{
  options: ReadonlyArray<Item>
  maybeSelectedValue: Option.Option<Value>
  itemToValue: (item: Item) => Value
  itemToLabel: (item: Item) => string
  label: string
  placeholder?: string
  description?: string
  anchor?: AnchorConfig
  isDisabled?: boolean
  isInvalid?: boolean
  name?: string
  triggerClass?: string
  itemsClass?: string
  itemClass?: string
  wrapperClass?: string
}>

/** Build a themed custom select view from the @foldkit/ui Listbox submodel. */
export const styledViewInputs = <M, Item, Value extends string = string>(
  config: SelectViewInputsConfig<Item, Value>,
  h: HtmlBuilder<M>,
): ViewInputs<Item, Value> => {
  const itemToValue = config.itemToValue
  return {
    items: config.options,
    maybeSelectedValue: config.maybeSelectedValue,
    itemToValue,
    itemToSearchText: (item) => config.itemToLabel(item),
    buttonContent: h.span(
      [h.Class('flex w-full items-center justify-between gap-2')],
      [
        h.span(
          [h.Class('min-w-0 flex-1 truncate text-left')],
          [Option.match(config.maybeSelectedValue, {
        onNone: () => config.placeholder ?? 'Select an option',
            onSome: (value) => {
              const item = config.options.find((item) => itemToValue(item) === value)
              return item === undefined ? config.placeholder ?? 'Select an option' : config.itemToLabel(item)
            },
          })],
        ),
        selectChevron(h),
      ],
    ),
    buttonClassName: cn(selectTriggerClass, config.triggerClass),
    itemsClassName: cn(selectItemsClass, config.itemsClass),
    itemToConfig: (item, context) => ({
      className: cn(selectItemClass, config.itemClass),
      content: h.span(
        [h.Class('flex w-full items-center')],
        [
          h.span([h.Class('flex-1')], [config.itemToLabel(item)]),
          context.isSelected ? h.span([h.Class('absolute right-2 flex size-4 items-center justify-center')], [icon(h, Check)]) : h.empty,
        ],
      ),
    }),
    backdropClassName: cn(selectBackdropClass),
    className: cn(selectWrapperClass, config.wrapperClass),
    anchor: config.anchor ?? SELECT_ANCHOR,
    isButtonDisabled: config.isDisabled,
    isInvalid: config.isInvalid,
    name: config.name,
  }
}

export const selectLabel = <M>(label: string, h: HtmlBuilder<M>, className?: string): Html =>
  h.label([h.Class(cn(selectLabelClass, className))], [label])

export const selectDescription = <M>(description: string, h: HtmlBuilder<M>, className?: string): Html =>
  h.span([h.Class(cn(selectDescriptionClass, className))], [description])

export const selectChevron = <M>(h: HtmlBuilder<M>): Html =>
  h.span([h.Class('shrink-0 text-muted-foreground')], [icon(h, ChevronDown, 'size-4')])

export const select = <M>(config: Readonly<{
  id: string
  label: string
  value?: string
  onChange?: (value: string) => M
  options: ReadonlyArray<Html | string>
  className?: string
}>, h: HtmlBuilder<M>): Html =>
  FoldkitSelect.view<M>(
    {
      id: config.id,
      value: config.value,
      onChange: config.onChange,
      toView: (attributes) =>
        h.div(
          [h.Class(selectWrapperClass)],
          [
            h.label([...attributes.label, h.Class(selectLabelClass)], [config.label]),
            h.div(
              [h.Class('relative w-full')],
              [
                h.select(
                  [...attributes.select, h.Class(cn(selectTriggerClass, 'appearance-none', config.className))],
                  config.options,
                ),
                selectChevron(h),
              ],
            ),
          ],
        ),
    },
    h,
  )
