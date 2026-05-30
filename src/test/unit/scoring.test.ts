import { describe, expect, test } from 'vitest'

import { calcPoints, getResult } from '~/server/scoring'

describe('getResult', () => {
  test('home win', () => {
    expect(getResult(2, 0)).toBe('home')
  })
  test('away win', () => {
    expect(getResult(0, 3)).toBe('away')
  })
  test('draw', () => {
    expect(getResult(1, 1)).toBe('draw')
  })
  test('0-0 draw', () => {
    expect(getResult(0, 0)).toBe('draw')
  })
})

describe('calcPoints', () => {
  test('exact score returns 3 points', () => {
    expect(calcPoints({ home: 2, away: 1 }, { home: 2, away: 1 })).toBe(3)
  })
  test('correct result (home win different score) returns 1 point', () => {
    expect(calcPoints({ home: 1, away: 0 }, { home: 3, away: 1 })).toBe(1)
  })
  test('correct result (draw different score) returns 1 point', () => {
    expect(calcPoints({ home: 1, away: 1 }, { home: 0, away: 0 })).toBe(1)
  })
  test('correct result (away win different score) returns 1 point', () => {
    expect(calcPoints({ home: 0, away: 1 }, { home: 1, away: 3 })).toBe(1)
  })
  test('wrong result (predicted win, actual draw) returns 0 points', () => {
    expect(calcPoints({ home: 2, away: 0 }, { home: 1, away: 1 })).toBe(0)
  })
  test('wrong result (predicted draw, actual win) returns 0 points', () => {
    expect(calcPoints({ home: 1, away: 1 }, { home: 2, away: 0 })).toBe(0)
  })
  test('wrong result (predicted home win, actual away win) returns 0 points', () => {
    expect(calcPoints({ home: 2, away: 0 }, { home: 0, away: 1 })).toBe(0)
  })
})
