import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as questionnaire from '../../generated/registry/ui/questionnaire'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotQuestionnaireStandaloneMessage: { message: questionnaire.Message },
  GotQuestionnairePlansMessage: { message: questionnaire.Message },
  GotQuestionnaireTaskMessage: { message: questionnaire.Message },
})

const STANDALONE_ITEMS = [
  {
    name: 'direction',
    title: 'What should we prototype next?',
    description: 'Choose one direction or write another answer.',
    isRequired: true,
    choices: [
      {
        value: 'delegation',
        label: 'Sub-agent delegation',
        description: 'Show when work is delegated and what comes back.',
      },
      {
        value: 'questions',
        label: 'Question prompts',
        description: 'Show choices while the agent waits for input.',
      },
      {
        value: 'both',
        label: 'Both together',
        description: 'Explore one unified interaction pattern.',
      },
    ],
    input: { ariaLabel: 'Another direction', placeholder: 'Type another direction…' },
  },
  {
    name: 'signals',
    title: 'What should every progress update include?',
    description: 'Select all that apply, or skip this question.',
    isMultiple: true,
    choices: [
      { value: 'progress', label: 'Progress' },
      { value: 'decisions', label: 'Decisions' },
      { value: 'risks', label: 'Risks' },
    ],
  },
  {
    name: 'timing',
    title: 'When should this be revisited?',
    description: 'Choose when this should be revisited.',
    isRequired: true,
    choices: [
      { value: 'week', label: 'This week' },
      { value: 'cycle', label: 'Next cycle' },
      { value: 'later', label: 'Revisit later' },
    ],
  },
] as const

const PLAN_ITEMS = [
  {
    name: 'plan',
    title: 'Choose a plan',
    description: 'Enterprise is not available on your account.',
    isRequired: true,
    choices: [
      {
        value: 'plus',
        label: 'Plus',
        description: 'For individuals and small teams',
      },
      {
        value: 'pro',
        label: 'Pro',
        description: 'For growing businesses',
      },
      {
        value: 'enterprise',
        label: 'Enterprise',
        description: 'For large teams and enterprises',
        isDisabled: true,
      },
    ],
  },
] as const

const TASK_ITEMS = [
  {
    name: 'task',
    title: 'What should the agent do next?',
    isRequired: true,
    choices: [
      { value: 'inspect', label: 'Inspect the codebase' },
      { value: 'implement', label: 'Implement the change' },
      { value: 'review', label: 'Review the result' },
    ],
  },
] as const

const section = (label: string, content: Html, h: HtmlBuilder<AppMessage>, extra?: Html): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-2')],
    [
      h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], [label]),
      content,
      ...(extra === undefined ? [] : [extra]),
    ],
  )

const submissionLine = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  Option.match(model.maybeQuestionnaireSubmission, {
    onNone: () => h.div([], []),
    onSome: (summary) =>
      h.p(
        [h.Class('px-1 text-sm text-emerald-600 dark:text-emerald-400')],
        [`Submitted: ${summary}`],
      ),
  })

export const questionnaireView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      section(
        'Standalone',
        h.submodel({
          slotId: model.questionnaireStandalone.id,
          model: model.questionnaireStandalone,
          view: questionnaire.view,
          viewInputs: { className: 'mx-auto max-w-lg' },
          toParentMessage: (message) => Message.GotQuestionnaireStandaloneMessage({ message }),
        }),
        h,
        submissionLine(model, h),
      ),
      section(
        'With Disabled Choice',
        h.submodel({
          slotId: model.questionnairePlans.id,
          model: model.questionnairePlans,
          view: questionnaire.view,
          viewInputs: { className: 'mx-auto max-w-lg' },
          toParentMessage: (message) => Message.GotQuestionnairePlansMessage({ message }),
        }),
        h,
      ),
      section(
        'No Description',
        h.submodel({
          slotId: model.questionnaireTask.id,
          model: model.questionnaireTask,
          view: questionnaire.view,
          viewInputs: { className: 'mx-auto max-w-lg' },
          toParentMessage: (message) => Message.GotQuestionnaireTaskMessage({ message }),
        }),
        h,
      ),
    ],
  )

const summarizeAnswers = (
  answers: ReadonlyArray<
    (typeof questionnaire.OutMessage.SubmittedAnswers.Type)['answers'][number]
  >,
): string =>
  answers
    .map((answer) =>
      answer.values.length > 0
        ? `${answer.name}=${answer.values.join(', ')}`
        : `${answer.name}=${answer.text === '' ? answer.status : answer.text}`,
    )
    .join(' · ')

const foldNoOp =
  <Out>(): ((out: Out) => Update.Step<State, unknown>) =>
  () =>
  (model) => ({ model })

const foldStandalone = M.type<questionnaire.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    ChangedActiveItem: foldNoOp(),
    SubmittedAnswers:
      ({ answers }) =>
      (model) => ({
        model: evo(model, {
          maybeQuestionnaireSubmission: () => Option.some(summarizeAnswers(answers)),
        }),
      }),
  }),
)

const foldPlain = M.type<questionnaire.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    ChangedActiveItem: foldNoOp(),
    SubmittedAnswers: foldNoOp(),
  }),
)

const makeFold = (
  read: (m: State) => Option.Option<questionnaire.Model>,
  write: (m: State, n: questionnaire.Model) => State,
  toParent: (m: questionnaire.Message) => AppMessage,
  foldOutMessage: (out: questionnaire.OutMessage) => Update.Step<State, unknown>,
) =>
  Update.foldChild({
    update: questionnaire.update,
    read,
    write,
    toParentMessage: toParent,
    foldOutMessage,
  })

const folds = {
  standalone: makeFold(
    (m) => Option.some(m.questionnaireStandalone),
    (m, n) => evo(m, { questionnaireStandalone: () => n }),
    (msg) => Message.GotQuestionnaireStandaloneMessage({ message: msg }),
    foldStandalone,
  ),
  plans: makeFold(
    (m) => Option.some(m.questionnairePlans),
    (m, n) => evo(m, { questionnairePlans: () => n }),
    (msg) => Message.GotQuestionnairePlansMessage({ message: msg }),
    foldPlain,
  ),
  task: makeFold(
    (m) => Option.some(m.questionnaireTask),
    (m, n) => evo(m, { questionnaireTask: () => n }),
    (msg) => Message.GotQuestionnaireTaskMessage({ message: msg }),
    foldPlain,
  ),
}

const fields = {
  questionnaireStandalone: questionnaire.Model,
  questionnairePlans: questionnaire.Model,
  questionnaireTask: questionnaire.Model,
  maybeQuestionnaireSubmission: S.Option(S.String),
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    questionnaireStandalone: questionnaire.init({
      id: 'questionnaire-standalone',
      items: STANDALONE_ITEMS.map((item) => ({ ...item })),
      defaultItem: 'direction',
      shortcuts: 'letters',
    }),
    questionnairePlans: questionnaire.init({
      id: 'questionnaire-plans',
      items: PLAN_ITEMS.map((item) => ({ ...item })),
      defaultItem: 'plan',
    }),
    questionnaireTask: questionnaire.init({
      id: 'questionnaire-task',
      items: TASK_ITEMS.map((item) => ({ ...item })),
      defaultItem: 'task',
      shortcuts: 'letters',
    }),
    maybeQuestionnaireSubmission: Option.none(),
  },
  messages: [
    Message.GotQuestionnaireStandaloneMessage,
    Message.GotQuestionnairePlansMessage,
    Message.GotQuestionnaireTaskMessage,
  ],
  handlers: (model: State) => ({
    GotQuestionnaireStandaloneMessage: (
      p: typeof Message.GotQuestionnaireStandaloneMessage.Type,
    ): UpdateReturn => folds.standalone(model, p.message),
    GotQuestionnairePlansMessage: (
      p: typeof Message.GotQuestionnairePlansMessage.Type,
    ): UpdateReturn => folds.plans(model, p.message),
    GotQuestionnaireTaskMessage: (
      p: typeof Message.GotQuestionnaireTaskMessage.Type,
    ): UpdateReturn => folds.task(model, p.message),
  }),
  samples: [],
})
