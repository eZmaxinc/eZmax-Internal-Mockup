import type { EzInfoItem, IInfoCategoryItems, TInfoCol } from '@ez'
import type { Flag, Stat } from '../mocks'

/** The data of the version, as items of ez-info: tiles, on/off facts, counts */

/** Plain facts: one grey tile each */
export function tilesOf(prefix: string, items: EzInfoItem[], col?: TInfoCol): IInfoCategoryItems[] {
   return items.map((item, index) => ({ key: `${prefix}-${index}`, label: item.label, value: item.value ?? '—', col }))
}

/** On/off facts, already worded for their state: one row each, green with a check when on */
export function flagsOf(key: string, flags: Flag[], col?: TInfoCol): IInfoCategoryItems {
   return { key, variant: 'list', value: flags.map((flag) => ({ label: flag.label, value: flag.on })), col }
}

/** A label and its figure boxed on the right; a link when it opens a list */
export function statsOf(prefix: string, stats: Stat[], options: { col?: TInfoCol, isLink?: boolean } = {}): IInfoCategoryItems[] {
   return stats.map((stat, index) => ({
      key: `${prefix}-${index}`,
      label: stat.label,
      value: { amount: stat.value },
      col: options.col,
      onClick: options.isLink ? onOpenList : undefined,
   }))
}

/** A mockup link: the list it opens is not built */
function onOpenList() {}
