export const actions = {
  NOOP: -1,
  CHAR: 0,
  BACK: 1,
  PREV: 2,
  NEXT: 3,
  LEFT: 4,
  RIGHT: 5,
  REVEAL: 6,
  SUBMIT: 7,
  CLEAR: 8,
  SELECT: 9
} as const

export type Action = typeof actions[keyof typeof actions]
