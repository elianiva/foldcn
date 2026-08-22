import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { cn } from '@/lib/utils'

/**
 * Derived from the shadcn v4 BASE registry: apps/v4/registry/bases/base/ui/kbd.tsx.
 * Keep the class strings identical to upstream — visual styling lives in the central foldcn style definition. See docs/deriving-from-base.md.
 */
export const kbdClass = 'cn-kbd pointer-events-none inline-flex items-center justify-center select-none'

export const kbdGroupClass = 'cn-kbd-group inline-flex items-center'

type StyleConfig = Readonly<{ className?: string }>

const kbdContainer = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.kbd(
    [h.Class(cn(kbdClass, config.className)), h.DataAttribute('slot', 'kbd')],
    children,
  )

const kbdGroup = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.kbd(
    [h.Class(cn(kbdGroupClass, config.className)), h.DataAttribute('slot', 'kbd-group')],
    children,
  )

/** Styled keyboard key(s). `Kbd.group` clusters several keys. Mirrors the
 *  shadcn v4 `kbd.tsx`. */
export const Kbd = Object.assign(kbdContainer, { group: kbdGroup })
