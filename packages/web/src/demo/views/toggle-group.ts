import type { Html, HtmlBuilder } from 'foldkit/html'

import { toggleGroup } from '@foldcn/registry/styles/default/ui/toggle-group'
import { icon } from '@foldcn/registry/styles/default/lib/icons'
import { Bold, Italic, Underline } from 'lucide'

import { SelectedToggleGroup, type Message } from '../message'
import type { Model } from '../model'

export const toggleGroupView = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex w-full max-w-sm flex-col gap-4')],
    [
      toggleGroup<Message>(
        { value: model.toggleGroupValue, onValueChange: (value) => SelectedToggleGroup({ value }) },
        [
          { value: 'bold', label: 'Bold', icon: Bold },
          { value: 'italic', label: 'Italic', icon: Italic },
          { value: 'underline', label: 'Underline', icon: Underline },
        ],
        h,
      ),
      toggleGroup<Message>(
        {
          type: 'multiple',
          value: model.toggleGroupValue,
          onValueChange: (value) => SelectedToggleGroup({ value }),
        },
        [
          { value: 'bold', label: 'Bold', icon: Bold },
          { value: 'italic', label: 'Italic', icon: Italic },
        ],
        h,
      ),
    ],
  )
