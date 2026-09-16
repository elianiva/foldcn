/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as Questionnaire from '@/components/ui/questionnaire'`
 */
import { Effect, Option, Schema as S, pipe } from 'effect'
import * as Command from 'foldkit/command'
import * as Dom from 'foldkit/dom'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineView } from 'foldkit/submodel'
import { evo } from 'foldkit/struct'
import * as Update from 'foldkit/update'

import { buttonVariants } from './button'
import { icon } from '@/lib/icons'
import { Check } from 'lucide'
import { cn } from '@/lib/utils'

// A questionnaire is a step-by-step form: one question visible at a time,
// navigation with validation, skip for optional questions, and a submit that
// validates every question before emitting `SubmittedAnswers` to the parent.
// Owned by this Submodel: embed it with `h.submodel` and listen for
// `SubmittedAnswers` (and `ChangedActiveItem` for controlled navigation).
//
// Upstream derives from the `@shadcn/react/questionnaire` primitive. foldcn
// has no `@foldkit/ui` questionnaire primitive yet, so the state machine is
// authored in place here — see catalog/gaps.ts for the behavioral deltas
// (no native form reset, no arrow-key answer traversal, no focus move to the
// newly active question).
//
// Data-driven Foldkit API: questions are declared as an items array on
// `init` — no React children anatomy.

export const questionnaireClass = 'cn-questionnaire flex w-full min-w-0 flex-col'

export const questionnaireProgressClass =
  'cn-questionnaire-progress min-h-[1lh] w-fit min-w-[14ch] font-medium text-muted-foreground tabular-nums'

export const questionnaireItemClass = 'cn-questionnaire-item min-w-0 border-0 p-0 outline-none'

export const questionnaireTitleClass = 'cn-questionnaire-title cn-font-heading text-pretty'

export const questionnaireDescriptionClass =
  'cn-questionnaire-description text-pretty text-muted-foreground'

export const questionnaireChoicesClass =
  'cn-questionnaire-choices group/questionnaire-choices grid min-w-0'

export const questionnaireChoiceClass = `cn-questionnaire-choice group/questionnaire-choice relative flex min-h-11 cursor-pointer items-start text-start transition-colors outline-none select-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50`

export const questionnaireChoiceInputClass =
  'cn-questionnaire-choice-input absolute inset-0 z-10 size-full cursor-pointer opacity-0'

export const questionnaireChoiceIndicatorClass =
  'cn-questionnaire-choice-indicator pointer-events-none relative flex shrink-0 items-center justify-center border group-data-[type=radio]/questionnaire-choice:rounded-full'

export const questionnaireChoiceIndicatorDotClass =
  'cn-questionnaire-choice-indicator-dot hidden rounded-full group-data-[type=checkbox]/questionnaire-choice:hidden group-data-checked/questionnaire-choice:block'

/** The check icon svg itself is the indicator-check element upstream (the
 *  class carries its visibility), so the string rides on the svg here. */
export const questionnaireChoiceIndicatorCheckClass =
  'cn-questionnaire-choice-indicator-check hidden group-data-[type=radio]/questionnaire-choice:hidden group-data-checked/questionnaire-choice:block'

export const questionnaireChoiceLabelClass =
  'cn-questionnaire-choice-label cn-questionnaire-choice-content flex min-w-0 flex-1 flex-col leading-snug'

export const questionnaireChoiceShortcutClass =
  'cn-questionnaire-choice-shortcut cn-questionnaire-shortcut pointer-events-none ms-auto hidden shrink-0 group-data-[shortcut]/questionnaire-choice:inline-flex'

export const questionnaireChoiceDescriptionClass = 'cn-questionnaire-choice-description'

export const questionnaireInputWrapperClass =
  'cn-questionnaire-input-wrapper group/questionnaire-input relative min-w-0'

export const questionnaireInputClass = `cn-questionnaire-input min-h-11 w-full min-w-0 transition-[color,box-shadow,background-color] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground`

export const questionnaireErrorClass = 'cn-questionnaire-error text-destructive'

export const questionnaireActionsClass =
  'cn-questionnaire-actions grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center'

// MODEL

const ChoiceDef = S.Struct({
  value: S.String,
  label: S.String,
  description: S.optional(S.String),
  isDisabled: S.optional(S.Boolean),
  defaultChecked: S.optional(S.Boolean),
})

const InputDef = S.Struct({
  ariaLabel: S.String,
  placeholder: S.optional(S.String),
  type: S.optional(S.String),
  isDisabled: S.optional(S.Boolean),
})

const ItemDef = S.Struct({
  name: S.String,
  title: S.String,
  description: S.optional(S.String),
  isRequired: S.optional(S.Boolean),
  isMultiple: S.optional(S.Boolean),
  choices: S.Array(ChoiceDef),
  input: S.optional(InputDef),
})

export const Status = S.Literals(['answered', 'skipped', 'unanswered'])
export type Status = typeof Status.Type

const Answer = S.Struct({
  values: S.Array(S.String),
  text: S.String,
  isSkipped: S.Boolean,
  isInvalid: S.Boolean,
})

export const Model = S.Struct({
  id: S.String,
  items: S.Array(ItemDef),
  activeIndex: S.Number,
  answers: S.Array(Answer),
  shortcuts: S.optional(S.Literals(['letters', 'numbers'])),
})
export type Model = typeof Model.Type

// MESSAGES

/** The user toggled a choice (click, or a letter/number shortcut key). */
export const Message = defineMessageUnion({
  ToggledChoice: { itemIndex: S.Number, value: S.String, isChecked: S.Boolean },
  ChangedInput: { itemIndex: S.Number, value: S.String },
  /** Enter was pressed on an answer control with a filled answer. */
  ConfirmedAnswer: { itemIndex: S.Number },
  GonePrevious: {},
  GoneNext: {},
  SkippedCurrent: {},
  Submitted: {},
  /** No-op emitted by the FocusAnswer command after it moved DOM focus. */
  FocusedAnswer: {},
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  ChangedActiveItem: { name: S.String, index: S.Number },
  SubmittedAnswers: {
    answers: S.Array(
      S.Struct({ name: S.String, status: Status, values: S.Array(S.String), text: S.String }),
    ),
  },
})
export type OutMessage = typeof OutMessage.Type

// INIT / UPDATE

export type ChoiceInit = Readonly<{
  value: string
  label: string
  description?: string
  isDisabled?: boolean
  defaultChecked?: boolean
}>

export type InputInit = Readonly<{
  ariaLabel: string
  placeholder?: string
  type?: string
  isDisabled?: boolean
}>

export type ItemInit = Readonly<{
  name: string
  title: string
  description?: string
  isRequired?: boolean
  isMultiple?: boolean
  choices?: ReadonlyArray<ChoiceInit>
  input?: InputInit
}>

export type ShortcutMode = 'letters' | 'numbers'

export type InitConfig = Readonly<{
  id: string
  items: ReadonlyArray<ItemInit>
  defaultItem?: string
  shortcuts?: ShortcutMode
}>

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

type Item = typeof ItemDef.Type
type Answer = typeof Answer.Type

/** Letters map to A…Z in choice order, numbers to 1…9 — matching the
 *  upstream `shortcuts` modes. */
const shortcutForChoice = (
  mode: ShortcutMode | undefined,
  choiceIndex: number,
): string | undefined => {
  if (mode === 'letters') return String.fromCharCode(65 + choiceIndex)
  if (mode === 'numbers') return choiceIndex < 9 ? String(choiceIndex + 1) : undefined
  return undefined
}

const hasText = (answer: Answer | undefined): boolean => (answer?.text.trim().length ?? 0) > 0

const isAnswered = (answer: Answer | undefined): boolean =>
  answer !== undefined && (answer.values.length > 0 || hasText(answer))

const statusOf = (answer: Answer | undefined): Status => {
  if (answer?.isSkipped === true) return 'skipped'
  if (isAnswered(answer)) return 'answered'
  return 'unanswered'
}

const isValidItem = (item: Item, answer: Answer | undefined): boolean =>
  item.isRequired !== true || answer?.isSkipped === true || isAnswered(answer)

const itemId = (rootId: string, itemName: string): string => `${rootId}-item-${itemName}`
const descriptionId = (rootId: string, itemName: string): string =>
  `${rootId}-description-${itemName}`
const errorId = (rootId: string, itemName: string): string => `${rootId}-error-${itemName}`
const choiceInputId = (rootId: string, itemName: string, value: string): string =>
  `${rootId}-choice-${itemName}-${value}`
const textInputId = (rootId: string, itemName: string): string => `${rootId}-input-${itemName}`

/** Creates an initial questionnaire model. `defaultItem` selects the first
 *  active question by name; single-choice questions adopt only the first
 *  `defaultChecked` choice (a radio group's semantics). */
export const init = (config: InitConfig): Model => {
  const answers = config.items.map((item) => {
    const defaultChecked = (item.choices ?? []).filter((choice) => choice.defaultChecked === true)
    const values =
      item.isMultiple === true
        ? defaultChecked.map((choice) => choice.value)
        : defaultChecked.length > 0
          ? [defaultChecked[0]!.value]
          : []
    return { values, text: '', isSkipped: false, isInvalid: false }
  })
  const defaultIndex = config.defaultItem
    ? Math.max(
        0,
        config.items.findIndex((item) => item.name === config.defaultItem),
      )
    : 0
  return {
    id: config.id,
    items: config.items.map((item) => ({ ...item, choices: item.choices ?? [] })),
    activeIndex: defaultIndex,
    answers,
    shortcuts: config.shortcuts,
  }
}

/** Focuses the question's filled answer, falling back to its first enabled
 *  control — mirroring upstream's focusInvalid. */
const FocusAnswer = Command.define('FocusQuestionnaireAnswer', {
  args: { selector: S.String },
  messages: [Message.FocusedAnswer],
  execute: ({ selector }) =>
    pipe(
      Dom.focus(`[id="${selector.replaceAll('"', '\\"')}"]`),
      Effect.ignore,
      Effect.as(Message.FocusedAnswer()),
    ),
})

/** Selector target for focusInvalid: the filled text input, then the first
 *  selected enabled choice, then the first enabled choice, then the text
 *  input. `undefined` when the question has no focusable control. */
const focusTargetId = (model: Model, index: number): string | undefined => {
  const item = model.items[index]
  const answer = model.answers[index]
  if (item === undefined) return undefined
  if (item.input !== undefined && item.input.isDisabled !== true && hasText(answer)) {
    return textInputId(model.id, item.name)
  }
  const selected = (item.choices ?? []).find(
    (choice) => choice.isDisabled !== true && answer?.values.includes(choice.value) === true,
  )
  if (selected !== undefined) return choiceInputId(model.id, item.name, selected.value)
  const firstEnabled = (item.choices ?? []).find((choice) => choice.isDisabled !== true)
  if (firstEnabled !== undefined) return choiceInputId(model.id, item.name, firstEnabled.value)
  if (item.input !== undefined && item.input.isDisabled !== true) {
    return textInputId(model.id, item.name)
  }
  return undefined
}

/** Marks the question invalid and focuses its answer, mirroring upstream's
 *  validate-failure path. */
const rejectCurrent = (model: Model, index: number): UpdateReturn => {
  const answers = model.answers.map((answer, answerIndex) =>
    answerIndex === index ? { ...answer, isInvalid: true } : answer,
  )
  const selector = focusTargetId(model, index)
  return {
    model: evo(model, { answers: () => answers }),
    commands: selector === undefined ? [] : [FocusAnswer({ selector })],
  }
}

const goToItem = (model: Model, index: number): UpdateReturn => ({
  model: evo(model, { activeIndex: () => index }),
  outMessage: OutMessage.ChangedActiveItem({ name: model.items[index]?.name ?? '', index }),
})

/** Validates every question. The first invalid one becomes active (focused);
 *  when all pass the answers flow out via `SubmittedAnswers`. */
const submitAll = (model: Model): UpdateReturn => {
  const firstInvalid = model.items.findIndex(
    (item, index) => !isValidItem(item, model.answers[index]),
  )
  if (firstInvalid >= 0) return rejectCurrent({ ...model, activeIndex: firstInvalid }, firstInvalid)
  const answers = model.items.map((item, index) => ({
    name: item.name,
    status: statusOf(model.answers[index]),
    values: model.answers[index]?.values ?? [],
    text: model.answers[index]?.text ?? '',
  }))
  return Update.withOutMessage({ model }, OutMessage.SubmittedAnswers({ answers }))
}

/** Validates the active question: failure marks it invalid and focuses its
 *  answer; success advances — or submits when this is the last question. */
const confirmCurrent = (model: Model): UpdateReturn => {
  const item = model.items[model.activeIndex]
  if (item === undefined) return { model }
  if (!isValidItem(item, model.answers[model.activeIndex])) {
    return rejectCurrent(model, model.activeIndex)
  }
  if (model.activeIndex >= model.items.length - 1) return submitAll(model)
  return goToItem(model, model.activeIndex + 1)
}

/** Processes a questionnaire message and returns the next model, commands,
 *  and an optional out-message for the parent. */
export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'ToggledChoice': {
      const item = model.items[message.itemIndex]
      const answer = model.answers[message.itemIndex]
      const choice = (item?.choices ?? []).find((candidate) => candidate.value === message.value)
      if (item === undefined || answer === undefined || choice === undefined) return { model }
      if (choice.isDisabled === true) return { model }
      const values =
        item.isMultiple === true
          ? message.isChecked
            ? [...answer.values, message.value]
            : answer.values.filter((value) => value !== message.value)
          : message.isChecked
            ? [message.value]
            : answer.values
      const answers = model.answers.map((current, answerIndex) =>
        answerIndex === message.itemIndex
          ? { ...current, values, isSkipped: false, isInvalid: false }
          : current,
      )
      return { model: evo(model, { answers: () => answers }) }
    }
    case 'ChangedInput': {
      const answers = model.answers.map((current, answerIndex) =>
        answerIndex === message.itemIndex
          ? { ...current, text: message.value, isSkipped: false, isInvalid: false }
          : current,
      )
      return { model: evo(model, { answers: () => answers }) }
    }
    case 'ConfirmedAnswer':
      return confirmCurrent(model)
    case 'GonePrevious':
      return model.activeIndex <= 0 ? { model } : goToItem(model, model.activeIndex - 1)
    case 'GoneNext':
      return confirmCurrent(model)
    case 'SkippedCurrent': {
      const item = model.items[model.activeIndex]
      if (item === undefined || item.isRequired === true) return { model }
      const answers = model.answers.map((current, answerIndex) =>
        answerIndex === model.activeIndex
          ? { values: [], text: '', isSkipped: true, isInvalid: false }
          : current,
      )
      const skipped = evo(model, { answers: () => answers })
      return model.activeIndex >= model.items.length - 1
        ? submitAll(skipped)
        : goToItem(skipped, model.activeIndex + 1)
    }
    case 'Submitted':
      return submitAll(model)
    case 'FocusedAnswer':
      return { model }
  }
}

// VIEW

export type ViewInputs = Readonly<{
  className?: string
}>

type Choice = typeof ChoiceDef.Type

const navigationButton = <M>(
  config: Readonly<{
    slot:
      | 'questionnaire-previous'
      | 'questionnaire-skip'
      | 'questionnaire-next'
      | 'questionnaire-submit'
    extension: string
    variant: 'default' | 'outline'
    label: string
    isVisible: boolean
    hasEnterShortcut: boolean
    status: Status
    onClick: M
  }>,
  h: HtmlBuilder<M>,
): Html =>
  h.button(
    [
      h.Class(
        cn('cn-button', buttonVariants[config.variant], 'cn-button-size-default', config.extension),
      ),
      h.DataAttribute('slot', config.slot),
      h.DataAttribute('size', 'default'),
      h.DataAttribute('variant', config.variant),
      h.DataAttribute('status', config.status),
      h.Type('button'),
      h.OnClick(config.onClick),
      ...(config.isVisible
        ? [h.DataAttribute('visible', '')]
        : [h.DataAttribute('hidden', ''), h.Hidden(true), h.Inert(true), h.Tabindex(-1)]),
      ...(config.hasEnterShortcut
        ? [h.DataAttribute('shortcut', 'Enter'), h.AriaKeyshortcuts('Enter')]
        : []),
    ],
    [config.label],
  )

/** Renders the controlled questionnaire. Embedded via `h.submodel`. */
export const view = defineView<Model, Message, ViewInputs>((model, viewInputs, h) => {
  const total = model.items.length
  const current = Math.min(model.activeIndex + 1, Math.max(total, 1))
  const isFirst = total > 0 && model.activeIndex === 0
  const isLast = total > 0 && model.activeIndex === total - 1
  const progressLabel = total > 0 ? `Question ${current} of ${total}` : ''
  const activeItemStatus = statusOf(model.answers[model.activeIndex])

  const rootStateAttributes = [
    h.DataAttribute('current', String(current)),
    h.DataAttribute('total', String(total)),
    ...(isFirst ? [h.DataAttribute('first', '')] : []),
    ...(isLast ? [h.DataAttribute('last', '')] : []),
  ]

  const progress = h.div(
    [
      h.Class(questionnaireProgressClass),
      h.DataAttribute('slot', 'questionnaire-progress'),
      h.Role('progressbar'),
      h.AriaLabel('Questionnaire progress'),
      h.AriaLive('polite'),
      ...(total > 0
        ? [
            h.AriaValuemin(1),
            h.AriaValuemax(total),
            h.AriaValuenow(current),
            h.AriaValuetext(progressLabel),
          ]
        : []),
      ...rootStateAttributes,
    ],
    [progressLabel],
  )

  const itemNodes = model.items.map((item, itemIndex) => {
    const answer = model.answers[itemIndex]
    const isActive = itemIndex === model.activeIndex
    const isInvalid = answer?.isInvalid === true
    const isMultiple = item.isMultiple === true
    const isRequired = item.isRequired === true
    const type = isMultiple ? 'checkbox' : 'radio'
    const status = statusOf(answer)

    const describedBy = [
      ...(item.description === undefined ? [] : [descriptionId(model.id, item.name)]),
      ...(isInvalid ? [errorId(model.id, item.name)] : []),
    ].join(' ')

    const choiceNodes = (item.choices ?? []).map((choice: Choice, choiceIndex) => {
      const isChecked =
        answer?.isSkipped !== true && (answer?.values.includes(choice.value) ?? false)
      const isDisabled = choice.isDisabled === true
      const shortcut = shortcutForChoice(model.shortcuts, choiceIndex)
      return h.label(
        [
          h.Class(questionnaireChoiceClass),
          h.DataAttribute('slot', 'questionnaire-choice'),
          h.DataAttribute('type', type),
          h.DataAttribute(isChecked ? 'checked' : 'unchecked', ''),
          ...(isDisabled ? [h.DataAttribute('disabled', '')] : []),
          ...(isInvalid ? [h.DataAttribute('invalid', '')] : []),
          ...(shortcut === undefined ? [] : [h.DataAttribute('shortcut', '')]),
        ],
        [
          h.input([
            h.Id(choiceInputId(model.id, item.name, choice.value)),
            h.Class(questionnaireChoiceInputClass),
            h.DataAttribute('slot', 'questionnaire-choice-input'),
            h.Type(type),
            ...(answer?.isSkipped === true ? [] : [h.Name(item.name)]),
            h.Value(choice.value),
            h.Checked(isChecked),
            ...(isInvalid ? [h.AriaInvalid(true)] : []),
            ...(shortcut === undefined
              ? []
              : [h.AriaKeyshortcuts(isChecked ? `${shortcut} Enter` : shortcut)]),
            h.OnChange(() =>
              Message.ToggledChoice({ itemIndex, value: choice.value, isChecked: !isChecked }),
            ),
            h.OnKeyDownPreventDefault((key) => {
              if (key === 'Enter' && isChecked) {
                return Option.some(Message.ConfirmedAnswer({ itemIndex }))
              }
              if (shortcut !== undefined && key.toUpperCase() === shortcut) {
                return Option.some(
                  Message.ToggledChoice({ itemIndex, value: choice.value, isChecked: !isChecked }),
                )
              }
              return Option.none()
            }),
            ...(isDisabled ? [h.DataAttribute('disabled', ''), h.AriaDisabled(true)] : []),
          ]),
          h.span(
            [
              h.AriaHidden(true),
              h.DataAttribute('slot', 'questionnaire-choice-indicator'),
              h.Class(questionnaireChoiceIndicatorClass),
            ],
            [
              h.span(
                [
                  h.DataAttribute('slot', 'questionnaire-choice-indicator-dot'),
                  h.Class(questionnaireChoiceIndicatorDotClass),
                ],
                [],
              ),
              icon(h, Check, questionnaireChoiceIndicatorCheckClass),
            ],
          ),
          h.span(
            [
              h.DataAttribute('slot', 'questionnaire-choice-label'),
              h.Class(questionnaireChoiceLabelClass),
            ],
            [
              choice.label,
              ...(choice.description === undefined
                ? []
                : [
                    h.span(
                      [
                        h.DataAttribute('slot', 'questionnaire-choice-description'),
                        h.Class(questionnaireChoiceDescriptionClass),
                      ],
                      [choice.description],
                    ),
                  ]),
            ],
          ),
          h.span(
            [
              h.DataAttribute('slot', 'questionnaire-choice-shortcut'),
              h.Class(questionnaireChoiceShortcutClass),
              h.AriaHidden(true),
              ...(shortcut === undefined ? [h.Hidden(true)] : []),
            ],
            shortcut === undefined ? [] : [shortcut],
          ),
        ],
      )
    })

    const inputNode =
      item.input === undefined
        ? undefined
        : h.div(
            [
              h.DataAttribute('slot', 'questionnaire-input-wrapper'),
              h.Class(questionnaireInputWrapperClass),
            ],
            [
              h.input([
                h.Id(textInputId(model.id, item.name)),
                h.Class(questionnaireInputClass),
                h.DataAttribute('slot', 'questionnaire-input'),
                h.Type(item.input.type ?? 'text'),
                ...(answer?.isSkipped === true ? [] : [h.Name(item.name)]),
                h.Value(answer?.text ?? ''),
                ...(item.input.placeholder === undefined
                  ? []
                  : [h.Placeholder(item.input.placeholder)]),
                h.AriaLabel(item.input.ariaLabel),
                ...(isInvalid ? [h.AriaInvalid(true)] : []),
                h.DataAttribute(hasText(answer) ? 'filled' : 'empty', ''),
                h.OnInput((value) => Message.ChangedInput({ itemIndex, value })),
                h.OnKeyDownPreventDefault((key) =>
                  key === 'Enter' && hasText(answer)
                    ? Option.some(Message.ConfirmedAnswer({ itemIndex }))
                    : Option.none(),
                ),
                ...(item.input.isDisabled === true
                  ? [h.DataAttribute('disabled', ''), h.AriaDisabled(true)]
                  : []),
              ]),
            ],
          )

    const errorNode = h.p(
      [
        h.Id(errorId(model.id, item.name)),
        h.Class(questionnaireErrorClass),
        h.DataAttribute('slot', 'questionnaire-error'),
        h.Hidden(!isInvalid),
        ...(isInvalid ? [h.Role('alert')] : []),
      ],
      [isRequired ? 'Choose an answer to continue.' : 'Choose an answer or skip this question.'],
    )

    return h.fieldset(
      [
        h.Class(questionnaireItemClass),
        h.DataAttribute('slot', 'questionnaire-item'),
        h.Id(itemId(model.id, item.name)),
        h.Tabindex(-1),
        h.Hidden(!isActive),
        h.Inert(!isActive),
        ...(isInvalid ? [h.AriaInvalid(true)] : []),
        ...(describedBy === '' ? [] : [h.AriaDescribedBy(describedBy)]),
        h.DataAttribute('status', status),
        ...(isActive ? [h.DataAttribute('active', '')] : []),
        ...(isInvalid ? [h.DataAttribute('invalid', '')] : []),
        ...(isMultiple ? [h.DataAttribute('multiple', '')] : []),
        ...(isRequired ? [h.DataAttribute('required', '')] : []),
      ],
      [
        h.legend(
          [h.DataAttribute('slot', 'questionnaire-title'), h.Class(questionnaireTitleClass)],
          [item.title],
        ),
        ...(item.description === undefined
          ? []
          : [
              h.p(
                [
                  h.Id(descriptionId(model.id, item.name)),
                  h.DataAttribute('slot', 'questionnaire-description'),
                  h.Class(questionnaireDescriptionClass),
                ],
                [item.description],
              ),
            ]),
        h.div(
          [
            h.Class(questionnaireChoicesClass),
            h.DataAttribute('slot', 'questionnaire-choices'),
            ...(model.shortcuts === undefined
              ? []
              : [h.DataAttribute('shortcuts', model.shortcuts)]),
          ],
          [...choiceNodes, ...(inputNode === undefined ? [] : [inputNode])],
        ),
        errorNode,
      ],
    )
  })

  const actions = h.div(
    [h.Class(questionnaireActionsClass), h.DataAttribute('slot', 'questionnaire-actions')],
    [
      navigationButton(
        {
          slot: 'questionnaire-previous',
          extension:
            'cn-questionnaire-previous col-start-1 row-start-1 min-h-11 justify-self-start sm:min-h-0',
          variant: 'outline',
          label: 'Previous',
          isVisible: total > 1 && !isFirst,
          hasEnterShortcut: false,
          status: activeItemStatus,
          onClick: Message.GonePrevious(),
        },
        h,
      ),
      navigationButton(
        {
          slot: 'questionnaire-skip',
          extension:
            'cn-questionnaire-skip col-start-2 row-start-1 min-h-11 justify-self-end sm:min-h-0',
          variant: 'outline',
          label: 'Skip',
          isVisible: model.items[model.activeIndex]?.isRequired !== true,
          hasEnterShortcut: false,
          status: activeItemStatus,
          onClick: Message.SkippedCurrent(),
        },
        h,
      ),
      navigationButton(
        {
          slot: 'questionnaire-next',
          extension:
            'cn-questionnaire-next col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0',
          variant: 'default',
          label: 'Next',
          isVisible: total > 1 && !isLast,
          hasEnterShortcut: true,
          status: activeItemStatus,
          onClick: Message.GoneNext(),
        },
        h,
      ),
      navigationButton(
        {
          slot: 'questionnaire-submit',
          extension:
            'cn-questionnaire-submit col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0',
          variant: 'default',
          label: 'Submit',
          isVisible: total > 0 && isLast,
          hasEnterShortcut: true,
          status: activeItemStatus,
          onClick: Message.Submitted(),
        },
        h,
      ),
    ],
  )

  return h.form(
    [
      h.Class(cn(questionnaireClass, viewInputs.className)),
      h.DataAttribute('slot', 'questionnaire'),
      h.Novalidate(true),
      ...rootStateAttributes,
    ],
    [progress, ...itemNodes, actions],
  )
})
