import type { Prompt } from '../data/types'
import { smallTalkPrompts } from '../data/questions.smalltalk'
import { deepTalkPrompts } from '../data/questions.deeptalk'
import { weirdTalkPrompts } from '../data/questions.weirdtalk'
import { storyEmojiPools } from '../data/emojis.story'

export type CategoryId = 'smalltalk' | 'deeptalk' | 'weirdtalk' | 'emoji'

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'smalltalk', label: 'Small Talk' },
  { id: 'deeptalk', label: 'Deep Talk' },
  { id: 'weirdtalk', label: 'Weird Talk' },
  { id: 'emoji', label: 'Emoji Story' },
]

export interface EmojiCombo {
  subject: string
  location: string
  action: string
  object: string
}

export type Content = { kind: 'prompt'; prompt: Prompt } | { kind: 'emoji'; combo: EmojiCombo }

const PROMPTS_BY_CATEGORY: Record<Exclude<CategoryId, 'emoji'>, Prompt[]> = {
  smalltalk: smallTalkPrompts,
  deeptalk: deepTalkPrompts,
  weirdtalk: weirdTalkPrompts,
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function randomCombo(): EmojiCombo {
  return {
    subject: randomItem(storyEmojiPools.subjects),
    location: randomItem(storyEmojiPools.locations),
    action: randomItem(storyEmojiPools.actions),
    object: randomItem(storyEmojiPools.objects),
  }
}

export function generateFor(category: CategoryId): Content {
  if (category === 'emoji') return { kind: 'emoji', combo: randomCombo() }
  return { kind: 'prompt', prompt: randomItem(PROMPTS_BY_CATEGORY[category]) }
}

export function keyOf(content: Content): string {
  return content.kind === 'prompt'
    ? content.prompt.id
    : `${content.combo.subject}|${content.combo.location}|${content.combo.action}|${content.combo.object}`
}

const MAX_RETRIES = 10

export function pickDifferent(category: CategoryId, avoidKey: string): Content {
  let candidate = generateFor(category)
  for (let i = 0; i < MAX_RETRIES && keyOf(candidate) === avoidKey; i++) {
    candidate = generateFor(category)
  }
  return candidate
}
