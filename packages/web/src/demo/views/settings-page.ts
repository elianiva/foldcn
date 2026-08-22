import type { Html, HtmlBuilder } from 'foldkit/html'

import { settingsPage } from '@foldcn/registry/styles/default/blocks/settings-page/settings-page'

import {
  ClickedSaveSettings,
  ToggledSettingsEmailNotifs,
  ToggledSettingsTfa,
  UpdatedSettingsBio,
  UpdatedSettingsEmail,
  UpdatedSettingsLanguage,
  UpdatedSettingsName,
  type Message,
} from '../message'
import type { Model } from '../model'

export const settingsPageView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('w-full overflow-hidden rounded-xl border border-border')],
    [
      settingsPage<Message>(
        {
          name: model.settingsName,
          onNameInput: (value) => UpdatedSettingsName({ value }),
          email: model.settingsEmail,
          onEmailInput: (value) => UpdatedSettingsEmail({ value }),
          bio: model.settingsBio,
          onBioInput: (value) => UpdatedSettingsBio({ value }),
          language: model.settingsLanguage,
          onLanguageChange: (value) => UpdatedSettingsLanguage({ value }),
          isEmailNotificationsEnabled: model.settingsEmailNotifs,
          onToggleEmailNotifications: (isChecked) => ToggledSettingsEmailNotifs({ isChecked }),
          isTwoFactorEnabled: model.settingsTfa,
          onToggleTwoFactor: (isChecked) => ToggledSettingsTfa({ isChecked }),
          onSave: ClickedSaveSettings(),
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
