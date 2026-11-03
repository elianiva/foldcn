/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as Select from '@/components/ui/select'`
 */
import { Listbox as FoldkitListbox } from '@foldkit/ui'
import type { AnchorConfig } from '@foldkit/ui/listbox'
import { Option } from 'effect'
import { childAttributes, type Html, type HtmlBuilder } from 'foldkit/html'

import { icon } from '@/lib/icons'
import { Check, ChevronDown } from 'lucide'
import { cn } from '@/lib/utils'

/** Themed custom dropdown select backed by the @foldkit/ui Listbox submodel.
 *
 *  Usage: `import * as Select from '@/components/ui/select'`
 *
 *  1. Create a typed bundle once (module scope):
 *       export const LanguageSelect = Select.create<{ value: string; label: string }, string>()
 *  2. Embed its Model in your app Model (`languageSelect: Select.Model`),
 *     init it (`Select.init({ id: 'language' })`), route its Message through
 *     your update, and render via `h.submodel({ ..., view: LanguageSelect.view,
 *     viewInputs: Select.styledViewInputs({ ... }, h) })`.
 *
 *  For a plain native `<select>` helper, see `@/components/ui/native-select`.
 */

export const create = FoldkitListbox.create
export const init = (config: InitConfig): Model =>
  FoldkitListbox.init({ isAnimated: true, ...config })
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

export const selectSizeKeys = ['default', 'sm'] as const
export type SelectSize = (typeof selectSizeKeys)[number]

/** Upstream SelectTrigger string. */
export const selectTriggerClass =
  'cn-select-trigger flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const selectTriggerIconClass = 'cn-select-trigger-icon pointer-events-none'

export const selectValueClass = 'cn-select-value'

/** Upstream SelectContent popup string. */
export const selectContentClass =
  'cn-select-content cn-select-content-logical cn-menu-target cn-menu-translucent relative isolate z-50 max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto data-[align-trigger=true]:animate-none'

/** Backwards compat alias: prefer `selectContentClass`. */
export const selectItemsClass = selectContentClass

export const selectGroupClass = 'cn-select-group'

export const selectLabelClass = 'cn-select-label'

export const selectItemClass =
  'cn-select-item relative flex w-full cursor-default items-center outline-hidden select-none data-active:bg-accent data-active:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const selectItemTextClass = 'cn-select-item-text shrink-0 whitespace-nowrap'

export const selectItemIndicatorClass = 'cn-select-item-indicator'

export const selectItemIndicatorIconClass = 'cn-select-item-indicator-icon pointer-events-none'

export const selectSeparatorClass = 'cn-select-separator pointer-events-none'

export const selectScrollUpClass = 'cn-select-scroll-up-button top-0 w-full'

export const selectScrollDownClass = 'cn-select-scroll-down-button bottom-0 w-full'

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
  size?: SelectSize
  isDisabled?: boolean
  isReadOnly?: boolean
  isInvalid?: boolean
  /** Disable individual options (upstream `SelectItem disabled`). */
  isItemDisabled?: (item: Item, index: number) => boolean
  /** Split the options into several labelled groups with separators between
   *  them (upstream multiple `SelectGroup`s). `groupToLabel` returns the group's
   *  label, or `undefined` for an unlabelled group. Without `itemGroupKey`, all
   *  options form one group labelled by `label`. */
  itemGroupKey?: (item: Item, index: number) => string
  groupToLabel?: (groupKey: string) => string | undefined
  name?: string
  form?: string
  ariaLabel?: string
  triggerClass?: string
  itemsClass?: string
  itemClass?: string
  wrapperClass?: string
}>

/** Build a themed custom select view from the @foldkit/ui Listbox submodel.
 *  Mirrors the shadcn v4 `select.tsx` trigger/content/item behavior: chevron
 *  trigger with muted placeholder, check indicator on the selected item, and
 *  disabled/invalid/read-only states. */
export const styledViewInputs = <M, Item, Value extends string = string>(
  config: SelectViewInputsConfig<Item, Value>,
  h: HtmlBuilder<M>,
): ViewInputs<Item, Value> => {
  const itemToValue = config.itemToValue
  const maybeFound = Option.flatMap(config.maybeSelectedValue, (value) => {
    const found = config.options.find((item) => itemToValue(item) === value)
    return found === undefined ? Option.none<Item>() : Option.some(found)
  })
  const label = config.label
  const hasLabel = label.trim().length > 0
  return {
    items: config.options,
    maybeSelectedValue: config.maybeSelectedValue,
    itemToValue,
    itemToSearchText: (item) => config.itemToLabel(item),
    isItemDisabled: config.isItemDisabled,
    itemGroupKey: config.itemGroupKey ?? (hasLabel ? () => label : undefined),
    groupToHeading:
      config.itemGroupKey !== undefined
        ? (groupKey) => {
            const groupLabel = config.groupToLabel?.(groupKey)
            return groupLabel === undefined
              ? undefined
              : { content: h.span([], [groupLabel]), className: selectLabelClass }
          }
        : hasLabel
          ? () => ({ content: h.span([], [label]), className: selectLabelClass })
          : undefined,
    buttonContent: h.span(
      [h.Class('flex w-full items-center justify-between gap-2')],
      [
        h.span(
          [
            h.DataAttribute('slot', 'select-value'),
            h.Class(cn(selectValueClass, Option.isNone(maybeFound) && 'text-muted-foreground')),
          ],
          [
            Option.match(maybeFound, {
              onNone: () => config.placeholder ?? 'Select an option',
              onSome: (item) => config.itemToLabel(item),
            }),
          ],
        ),
        selectChevron(h),
      ],
    ),
    buttonAttributes: childAttributes([
      h.DataAttribute('slot', 'select-trigger'),
      h.DataAttribute('size', config.size ?? 'default'),
    ]),
    buttonClassName: cn(selectTriggerClass, config.triggerClass),
    itemsAttributes: childAttributes([
      h.DataAttribute('slot', 'select-content'),
      h.DataAttribute('align-trigger', 'true'),
    ]),
    itemsClassName: cn(selectContentClass, config.itemsClass),
    groupAttributes: childAttributes([h.DataAttribute('slot', 'select-group')]),
    groupClassName: selectGroupClass,
    separatorAttributes: childAttributes([h.DataAttribute('slot', 'select-separator')]),
    separatorClassName: selectSeparatorClass,
    itemToConfig: (item, context) => ({
      className: cn(selectItemClass, config.itemClass),
      content: h.span(
        [h.Class('flex w-full items-center')],
        [
          h.span(
            [h.DataAttribute('slot', 'select-item-text'), h.Class(selectItemTextClass)],
            [config.itemToLabel(item)],
          ),
          context.isSelected
            ? h.span(
                [
                  h.DataAttribute('slot', 'select-item-indicator'),
                  h.Class(selectItemIndicatorClass),
                ],
                [icon(h, Check, selectItemIndicatorIconClass)],
              )
            : h.empty,
        ],
      ),
    }),
    backdropClassName: cn(selectBackdropClass),
    className: cn(selectWrapperClass, config.wrapperClass),
    attributes: childAttributes([h.DataAttribute('slot', 'select')]),
    anchor: config.anchor ?? SELECT_ANCHOR,
    isButtonDisabled: config.isDisabled,
    isReadOnly: config.isReadOnly,
    isInvalid: config.isInvalid,
    name: config.name,
    form: config.form,
    ariaLabel: config.ariaLabel,
  }
}

export const selectLabel = <M>(label: string, h: HtmlBuilder<M>, className?: string): Html =>
  h.label([h.Class(cn(selectLabelClass, className))], [label])

export const selectDescription = <M>(
  description: string,
  h: HtmlBuilder<M>,
  className?: string,
): Html => h.span([h.Class(cn(selectDescriptionClass, className))], [description])

export const selectChevron = <M>(h: HtmlBuilder<M>): Html =>
  icon(h, ChevronDown, selectTriggerIconClass)
