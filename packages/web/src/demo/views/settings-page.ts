import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { settingsPage } from '../../generated/registry/blocks/settings-page/settings-page'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  UpdatedSettingsName: { value: S.String },
  UpdatedSettingsEmail: { value: S.String },
  UpdatedSettingsBio: { value: S.String },
  UpdatedSettingsLanguage: { value: S.String },
  ToggledSettingsEmailNotifs: { isChecked: S.Boolean },
  ToggledSettingsTfa: { isChecked: S.Boolean },
  ClickedSaveSettings: {},
})

export const settingsPageView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('w-full overflow-hidden rounded-xl border border-border')],
    [
      settingsPage<AppMessage>(
        {
          name: model.settingsName,
          onNameInput: (value) => Message.UpdatedSettingsName({ value }),
          email: model.settingsEmail,
          onEmailInput: (value) => Message.UpdatedSettingsEmail({ value }),
          bio: model.settingsBio,
          onBioInput: (value) => Message.UpdatedSettingsBio({ value }),
          language: model.settingsLanguage,
          onLanguageChange: (value) => Message.UpdatedSettingsLanguage({ value }),
          isEmailNotificationsEnabled: model.settingsEmailNotifs,
          onToggleEmailNotifications: (isChecked) =>
            Message.ToggledSettingsEmailNotifs({ isChecked }),
          isTwoFactorEnabled: model.settingsTfa,
          onToggleTwoFactor: (isChecked) => Message.ToggledSettingsTfa({ isChecked }),
          onSave: Message.ClickedSaveSettings(),
        },
        h,
      ),
      ...(model.settingsSaved
        ? [
            h.p(
              [
                h.Class(
                  'mx-auto max-w-2xl px-6 pb-6 text-sm text-emerald-600 dark:text-emerald-400',
                ),
              ],
              ['Settings saved (demo).'],
            ),
          ]
        : []),
    ],
  )

const fields = {
  settingsName: S.String,
  settingsEmail: S.String,
  settingsBio: S.String,
  settingsLanguage: S.String,
  settingsEmailNotifs: S.Boolean,
  settingsTfa: S.Boolean,
  settingsSaved: S.Boolean,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    settingsName: '',
    settingsEmail: '',
    settingsBio: '',
    settingsLanguage: 'en',
    settingsEmailNotifs: true,
    settingsTfa: false,
    settingsSaved: false,
  },
  messages: [
    Message.UpdatedSettingsName,
    Message.UpdatedSettingsEmail,
    Message.UpdatedSettingsBio,
    Message.UpdatedSettingsLanguage,
    Message.ToggledSettingsEmailNotifs,
    Message.ToggledSettingsTfa,
    Message.ClickedSaveSettings,
  ],
  handlers: (model: State) => ({
    UpdatedSettingsName: ({ value }: typeof Message.UpdatedSettingsName.Type): UpdateReturn => ({
      model: evo(model, { settingsName: () => value }),
    }),
    UpdatedSettingsEmail: ({ value }: typeof Message.UpdatedSettingsEmail.Type): UpdateReturn => ({
      model: evo(model, { settingsEmail: () => value }),
    }),
    UpdatedSettingsBio: ({ value }: typeof Message.UpdatedSettingsBio.Type): UpdateReturn => ({
      model: evo(model, { settingsBio: () => value }),
    }),
    UpdatedSettingsLanguage: ({
      value,
    }: typeof Message.UpdatedSettingsLanguage.Type): UpdateReturn => ({
      model: evo(model, { settingsLanguage: () => value }),
    }),
    ToggledSettingsEmailNotifs: ({
      isChecked,
    }: typeof Message.ToggledSettingsEmailNotifs.Type): UpdateReturn => ({
      model: evo(model, { settingsEmailNotifs: () => isChecked }),
    }),
    ToggledSettingsTfa: ({ isChecked }: typeof Message.ToggledSettingsTfa.Type): UpdateReturn => ({
      model: evo(model, { settingsTfa: () => isChecked }),
    }),
    ClickedSaveSettings: (): UpdateReturn => ({ model: evo(model, { settingsSaved: () => true }) }),
  }),
  samples: [
    Message.UpdatedSettingsName({ value: 'Ada' }),
    Message.ToggledSettingsTfa({ isChecked: true }),
    Message.ClickedSaveSettings(),
  ],
})
