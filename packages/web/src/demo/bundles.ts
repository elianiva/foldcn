import * as Combobox from '@foldcn/registry/styles/default/ui/combobox'
import * as Listbox from '@foldcn/registry/styles/default/ui/listbox'
import * as Menu from '@foldcn/registry/styles/default/ui/menu'
import * as RadioGroup from '@foldcn/registry/styles/default/ui/radio-group'
import * as Select from '@foldcn/registry/styles/default/ui/select'
import * as Tabs from '@foldcn/registry/styles/default/ui/tabs'

import type { City, DemoTab, ListboxItem, Plan } from './model'

// List-style submodels are created once per item type. Kept at module scope —
// these factories must not be re-created per render.
export const DemoMenu = Menu.create<string>()
export const ItemListbox = Listbox.create<ListboxItem>()
export const CityCombobox = Combobox.create<City>()
export const DemoTabs = Tabs.create<DemoTab>()
export const PlanRadioGroup = RadioGroup.create<Plan>()
export const LanguageSelect = Select.create<{ value: string; label: string }, string>()
