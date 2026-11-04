export type Start = {
  readonly id: 'corner' | 'edge' | 'side' | 'center'
  readonly name: string
  readonly detail: string
  readonly pattern: string
}

export const STARTS: readonly Start[] = [
  {
    id: 'corner',
    name: 'Corner',
    detail: 'The usual game. One corner is empty.',
    pattern: '011111111111111',
  },
  {
    id: 'edge',
    name: 'Beside a corner',
    detail: 'An edge hole, one step from a corner.',
    pattern: '101111111111111',
  },
  {
    id: 'side',
    name: 'Middle of a side',
    detail: 'The center hole of one side.',
    pattern: '111011111111111',
  },
  {
    id: 'center',
    name: 'Center',
    detail: 'The hole in the middle of the triangle.',
    pattern: '111101111111111',
  },
]
