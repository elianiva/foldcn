import { Fieldset as FoldkitFieldset } from '@foldkit/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

// Stateless field helpers mirroring shadcn's `field.tsx` (FieldSet,
// FieldLegend, FieldGroup, Field, FieldContent, FieldLabel, FieldTitle,
// FieldDescription, FieldSeparator, FieldError) plus the accessible
// `fieldset` compound built on the @foldkit/ui Fieldset helper, which wires
// the native fieldset/legend semantics (id, aria-describedby, disabled) that
// the reference relies on at the call site.
//
// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/field.tsx. Class strings are identical to
// upstream; visual styling lives in the central foldcn style definition.

// --- FieldSet ---

export const fieldsetClass =
  'cn-field-set flex flex-col has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3'

// --- FieldLegend ---

export const fieldsetLegendClass = 'cn-field-legend mb-1.5 font-medium data-[variant=legend]:text-base data-[variant=label]:text-sm'

// --- FieldGroup ---

export const fieldGroupClass =
  'cn-field-group group/field-group @container/field-group flex w-full flex-col data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4'

// --- Field ---

/** Upstream cva base + per-orientation variant strings. */
export const fieldBaseClass = 'cn-field group/field flex w-full'

export const fieldOrientationClasses = {
  vertical: 'cn-field-orientation-vertical flex-col *:w-full [&>.sr-only]:w-auto',
  horizontal:
    'cn-field-orientation-horizontal flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
  responsive:
    'cn-field-orientation-responsive flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
} as const

export type FieldOrientation = keyof typeof fieldOrientationClasses

// --- FieldContent ---

export const fieldContentClass =
  'cn-field-content group/field-content flex flex-1 flex-col leading-snug gap-0.5'

// --- Label (base, from label.tsx) + FieldLabel ---

export const labelClass =
  'cn-label flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed'

export const fieldLabelClass =
  'cn-field-label group/field-label peer/field-label flex w-fit has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col'

// --- FieldTitle ---

export const fieldTitleClass = 'cn-field-title flex w-fit items-center'

// --- FieldDescription ---

export const fieldDescriptionClass =
  'cn-field-description leading-normal font-normal group-has-data-horizontal/field:text-balance last:mt-0 nth-last-2:-mt-1 [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary'

// --- FieldSeparator ---

export const fieldSeparatorClass = 'cn-field-separator relative'

export const fieldSeparatorLineClass =
  'shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch absolute inset-0 top-1/2'

export const fieldSeparatorContentClass =
  'cn-field-separator-content relative mx-auto block w-fit bg-background'

// --- FieldError ---

export const fieldErrorClass = 'cn-field-error font-normal'

// --- Primitives ---

type StyleConfig = Readonly<{ className?: string }>

/** Outermost fieldset wrapper. */
export const fieldSet = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.fieldset(
    [h.DataAttribute('slot', 'field-set'), h.Class(cn(fieldsetClass, config.className))],
    children,
  )

/** Legend naming the fieldset. `variant` toggles legend vs label sizing. */
export const fieldLegend = <M>(
  config: StyleConfig & Readonly<{ variant?: 'legend' | 'label' }>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.legend(
    [
      h.DataAttribute('slot', 'field-legend'),
      h.DataAttribute('variant', config.variant ?? 'legend'),
      h.Class(cn(fieldsetLegendClass, config.className)),
    ],
    children,
  )

/** Groups a set of fields; provides the container context the responsive
 *  field orientation reacts to. */
export const fieldGroup = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'field-group'), h.Class(cn(fieldGroupClass, config.className))],
    children,
  )

/** A single field row: label + content + description + error. */
export const field = <M>(
  config: StyleConfig &
    Readonly<{ orientation?: FieldOrientation; isInvalid?: boolean }>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html => {
  const orientation = config.orientation ?? 'vertical'
  return h.div(
    [
      h.Role('group'),
      h.DataAttribute('slot', 'field'),
      h.DataAttribute('orientation', orientation),
      ...(config.isInvalid === true ? [h.DataAttribute('invalid', 'true')] : []),
      h.Class(
        cn(fieldBaseClass, fieldOrientationClasses[orientation], config.className),
      ),
    ],
    children,
  )
}

/** Content column of a field (the control plus its description/error). */
export const fieldContent = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'field-content'), h.Class(cn(fieldContentClass, config.className))],
    children,
  )

/** Standalone label (drop-in for `label.tsx`'s `Label`). */
export const label = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html => h.label([h.DataAttribute('slot', 'label'), h.Class(cn(labelClass, config.className))], children)

/** Label for a field; optionally associates with its control via `for`. */
export const fieldLabel = <M>(
  config: StyleConfig & Readonly<{ for?: string }>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.label(
    [
      ...(config.for === undefined ? [] : [h.For(config.for)]),
      h.DataAttribute('slot', 'field-label'),
      h.Class(cn(labelClass, fieldLabelClass, config.className)),
    ],
    children,
  )

/** Non-interactive title for a field group. */
export const fieldTitle = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'field-label'), h.Class(cn(fieldTitleClass, config.className))],
    children,
  )

/** Field description / helper text. */
export const fieldDescription = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.p(
    [
      h.DataAttribute('slot', 'field-description'),
      h.Class(cn(fieldDescriptionClass, config.className)),
    ],
    children,
  )

/** Divider between fields, with optional centered content. */
export const fieldSeparator = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html => {
  const hasContent = children.length > 0
  return h.div(
    [
      h.DataAttribute('slot', 'field-separator'),
      h.DataAttribute('content', hasContent ? 'true' : 'false'),
      h.Class(cn(fieldSeparatorClass, config.className)),
    ],
    [
      h.div([h.Role('separator'), h.DataAttribute('horizontal', ''), h.Class(cn(fieldSeparatorLineClass))]),
      ...(hasContent
        ? [
            h.span(
              [
                h.DataAttribute('slot', 'field-separator-content'),
                h.Class(cn(fieldSeparatorContentClass)),
              ],
              children,
            ),
          ]
        : []),
    ],
  )
}

/** Field error, alerting for explicit children or a list of unique error
 *  messages. Renders nothing when there is no content. */
export const fieldError = <M>(
  config: StyleConfig &
    Readonly<{
      children?: ReadonlyArray<Child>
      errors?: ReadonlyArray<{ message?: string } | undefined>
    }>,
  h: HtmlBuilder<M>,
): Html => {
  const hasChildren = config.children !== undefined && config.children.length > 0
  const uniqueErrors =
    config.errors === undefined
      ? []
      : [...new Map(config.errors.map((error) => [error?.message, error])).values()].filter(
          (error) => error?.message !== undefined,
        )

  let content: ReadonlyArray<Child> | undefined
  if (hasChildren) {
    content = config.children
  } else if (uniqueErrors.length === 1) {
    content = [uniqueErrors[0]!.message!]
  } else if (uniqueErrors.length > 1) {
    content = [
      h.ul(
        [h.Class('ml-4 flex list-disc flex-col gap-1')],
        uniqueErrors.map((error) => h.li([], [error!.message!])),
      ),
    ]
  }

  if (content === undefined) {
    return h.empty
  }

  return h.div(
    [
      h.Role('alert'),
      h.DataAttribute('slot', 'field-error'),
      h.Class(cn(fieldErrorClass, config.className)),
    ],
    content,
  )
}

// --- Compound ---

export type FieldsetConfig = Readonly<{
  id: string
  legend: string
  maybeDescription?: string
  isDisabled?: boolean
  className?: string
  legendClass?: string
  descriptionClass?: string
  contentClass?: string
  children: ReadonlyArray<Child>
}>

/** Styled fieldset with legend, optional description and grouped fields,
 *  built on the @foldkit/ui Fieldset helper for native fieldset/legend
 *  semantics plus id / aria-describedby / disabled wiring. */
export const fieldset = <M>(config: FieldsetConfig, h: HtmlBuilder<M>): Html =>
  FoldkitFieldset.view<M>(
    {
      id: config.id,
      isDisabled: config.isDisabled,
      toView: (attributes) =>
        h.fieldset(
          [
            ...attributes.fieldset,
            h.DataAttribute('slot', 'field-set'),
            h.Class(cn(fieldsetClass, config.className)),
          ],
          [
            h.legend(
              [
                ...attributes.legend,
                h.DataAttribute('slot', 'field-legend'),
                h.DataAttribute('variant', 'legend'),
                h.Class(cn(fieldsetLegendClass, config.legendClass)),
              ],
              [config.legend],
            ),
            config.maybeDescription === undefined
              ? h.empty
              : h.p(
                  [
                    ...attributes.description,
                    h.DataAttribute('slot', 'field-description'),
                    h.Class(cn(fieldDescriptionClass, config.descriptionClass)),
                  ],
                  [config.maybeDescription],
                ),
            h.div(
              [
                h.DataAttribute('slot', 'field-group'),
                h.Class(cn(fieldGroupClass, config.contentClass)),
              ],
              config.children,
            ),
          ],
        ),
    },
    h,
  )
