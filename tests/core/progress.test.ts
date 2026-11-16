import { describe, expect, it } from 'vitest'
import { buildGraphIndex } from '../../src/core/graph'
import {
  addCustomResource,
  diffDays,
  emptyPackProgress,
  getActiveStreak,
  getDueReviewNodeIds,
  gradeReviewProgress,
  isReviewDue,
  isValidDateKey,
  lightNodeProgress,
  logStudySession,
  orphanedNodeIds,
  recomputeStreak,
  recordDailyActivity,
  removeCustomResource,
  setNodeStatusProgress,
  toggleNodeExercise,
  toggleNodePin,
  toggleNodeTag,
  unlightNodeProgress,
  updateNodeNote,
  XP_PER_FOCUS_SESSION,
  XP_PER_LEAF,
  XP_PER_REVIEW
} from '../../src/core/progress'
import type { PackDocument } from '../../src/core/types'

function makePack(): PackDocument {
  return {
    schema: 'litree/pack-v2',
    id: 'prog-pack',
    version: 1,
    title: { zh: '进度测试' },
    source: 'builtin',
    domains: [{ id: 'D1', name: '域一', color: '#3DD6C3' }],
    nodes: [
      { id: 'b1', parentId: null, kind: 'branch', title: { zh: '分支' }, domainId: 'D1' },
      { id: 'u1', parentId: 'b1', kind: 'unit', title: { zh: '单元一' }, domainId: 'D1' },
      { id: 'u1.k1', parentId: 'u1', kind: 'leaf', title: { zh: '点一' }, domainId: 'D1' },
      { id: 'u1.k2', parentId: 'u1', kind: 'leaf', title: { zh: '点二' }, domainId: 'D1' },
      { id: 'u2', parentId: 'b1', kind: 'unit', title: { zh: '单元二' }, domainId: 'D1' },
      { id: 'u2.k1', parentId: 'u2', kind: 'leaf', title: { zh: '点三' }, domainId: 'D1' }
    ],
    edges: [{ id: 'e1', from: 'u1', to: 'u2', type: 'hard' }],
    routes: []
  }
}

describe('progress: XP、不丢帧 dailyActivity、Leitner 间隔重复、笔记/资源/会话', () => {
  const pack = makePack()
  const index = buildGraphIndex(pack)

  it('light / unlight 幂等性、XP 与笔记/资源/标签保留', () => {
    let p = emptyPackProgress(pack.id)
    // Always-on notes/resources/tags/pin/exercises even before lighting (locked u2.k1)
    p = updateNodeNote(p, 'u2.k1', '# 提前预习笔记')
    const rAdd = addCustomResource(p, 'u2.k1', { title: 'MIT', url: 'https://mit.edu' }, '2026-06-01T10:00:00Z')
    expect(rAdd.ok).toBe(true)
    if (!rAdd.ok) return
    p = rAdd.progress
    p = toggleNodeTag(p, 'u2.k1', '重点')
    p = toggleNodePin(p, 'u2.k1')
    p = toggleNodeExercise(p, 'u2.k1', 2)
    p = toggleNodeExercise(p, 'u2.k1', 0)
    expect(p.nodes['u2.k1']?.completedExercises).toEqual([0, 2])

    // Reject dangerous URL protocol
    const badRes = addCustomResource(p, 'u2.k1', { title: 'XSS', url: 'javascript:alert(1)' })
    expect(badRes.ok).toBe(false)

    // Remove resource
    p = removeCustomResource(p, 'u2.k1', rAdd.resource.id)
    expect(p.nodes['u2.k1']?.customResources).toEqual([])

    // Light & idempotent re-light
    p = lightNodeProgress(p, 'u1.k1', index, { at: '2026-06-01T10:00:00.000Z', mode: 'gated' })
    p = lightNodeProgress(p, 'u1.k1', index, { at: '2026-06-01T11:00:00.000Z', mode: 'gated' })
    expect(p.xp).toBe(XP_PER_LEAF)

    // Unknown or branch node is no-op
    expect(lightNodeProgress(p, 'missing', index, { at: '2026-06-01T10:00:00.000Z', mode: 'gated' })).toBe(p)
    expect(lightNodeProgress(p, 'b1', index, { at: '2026-06-01T10:00:00.000Z', mode: 'gated' })).toBe(p)

    // Note survives unlight
    p = updateNodeNote(p, 'u1.k1', '点亮后笔记')
    p = unlightNodeProgress(p, 'u1.k1', '2026-06-01T12:00:00.000Z')
    expect(p.xp).toBe(0)
    expect(p.nodes['u1.k1']?.status).toBe('unstarted')
    expect(p.nodes['u1.k1']?.noteMarkdown).toBe('点亮后笔记')
  })

  it('dailyActivity 跨 600 天不截断，streakDays 连续/断签/回填准确', () => {
    let p = emptyPackProgress(pack.id)
    const start = Date.UTC(2025, 0, 1)
    for (let i = 0; i < 600; i++) {
      const dateKey = new Date(start + i * 86_400_000).toISOString().slice(0, 10)
      p = recordDailyActivity(p, dateKey, { lit: 1, xp: 2 })
    }
    expect(Object.keys(p.dailyActivity).length).toBe(600)
    expect(p.streakDays).toBe(600)
    expect(getActiveStreak(p, p.lastStudyDate!)).toBe(600)
    expect(getActiveStreak(p, '2028-01-01')).toBe(0)
  })

  it('Leitner 间隔重复调度: 1d -> 3d -> 7d -> 14d -> 30d 与遗忘重置 1d', () => {
    let p = emptyPackProgress(pack.id)
    const t0 = '2026-06-01T00:00:00.000Z'
    p = lightNodeProgress(p, 'u1.k1', index, { at: t0, mode: 'gated' })
    expect(p.nodes['u1.k1']?.leitnerBox).toBe(1)
    expect(p.nodes['u1.k1']?.nextReviewAt).toBe('2026-06-02T00:00:00.000Z')
    expect(isReviewDue(p.nodes['u1.k1'], Date.parse('2026-06-01T23:59:59Z'))).toBe(false)
    expect(isReviewDue(p.nodes['u1.k1'], Date.parse('2026-06-02T00:00:00Z'))).toBe(true)
    expect(getDueReviewNodeIds(p, index, Date.parse('2026-06-02T00:00:00Z'))).toEqual(['u1.k1'])

    // Box 2 -> +3d
    p = gradeReviewProgress(p, 'u1.k1', true, '2026-06-02T00:00:00.000Z')
    expect(p.nodes['u1.k1']?.leitnerBox).toBe(2)
    expect(p.nodes['u1.k1']?.nextReviewAt).toBe('2026-06-05T00:00:00.000Z')
    expect(p.xp).toBe(XP_PER_LEAF + XP_PER_REVIEW)

    // Box 3 -> +7d
    p = gradeReviewProgress(p, 'u1.k1', true, '2026-06-05T00:00:00.000Z')
    expect(p.nodes['u1.k1']?.leitnerBox).toBe(3)
    expect(p.nodes['u1.k1']?.nextReviewAt).toBe('2026-06-12T00:00:00.000Z')

    // Box 4 -> +14d
    p = gradeReviewProgress(p, 'u1.k1', true, '2026-06-12T00:00:00.000Z')
    expect(p.nodes['u1.k1']?.leitnerBox).toBe(4)
    expect(p.nodes['u1.k1']?.nextReviewAt).toBe('2026-06-26T00:00:00.000Z')

    // Box 5 -> +30d
    p = gradeReviewProgress(p, 'u1.k1', true, '2026-06-26T00:00:00.000Z')
    expect(p.nodes['u1.k1']?.leitnerBox).toBe(5)
    expect(p.nodes['u1.k1']?.nextReviewAt).toBe('2026-07-26T00:00:00.000Z')

    // Forgot -> reset to Box 1 (+1d)
    p = gradeReviewProgress(p, 'u1.k1', false, '2026-07-26T00:00:00.000Z')
    expect(p.nodes['u1.k1']?.leitnerBox).toBe(1)
    expect(p.nodes['u1.k1']?.mastery).toBe(0)
    expect(p.nodes['u1.k1']?.nextReviewAt).toBe('2026-07-27T00:00:00.000Z')
  })

  it('setNodeStatusProgress、logStudySession 与 orphanedNodeIds 正常生效', () => {
    let p = emptyPackProgress(pack.id)
    p = setNodeStatusProgress(p, 'u1.k1', 'queued', '2026-06-01T08:00:00Z', index)
    expect(p.nodes['u1.k1']?.status).toBe('queued')

    p = logStudySession(p, {
      id: 's1',
      nodeId: 'u1.k1',
      startedAt: '2026-06-01T09:00:00Z',
      durationMinutes: 25,
      mode: 'focus'
    })
    expect(p.sessions.length).toBe(1)
    expect(p.dailyActivity['2026-06-01']?.focusMinutes).toBe(25)
    expect(p.xp).toBe(XP_PER_FOCUS_SESSION)

    p = updateNodeNote(p, 'stale.id', 'orphan')
    expect(orphanedNodeIds(p, index)).toEqual(['stale.id'])
  })

  it('isValidDateKey 与 recomputeStreak / getActiveStreak / recordDailyActivity 安全拒绝非法日期键且不抛 RangeError', () => {
    expect(isValidDateKey('2026-06-01')).toBe(true)
    expect(isValidDateKey('2024-02-29')).toBe(true)
    expect(isValidDateKey('2026-02-29')).toBe(false)
    expect(isValidDateKey('2026-02-30')).toBe(false)
    expect(isValidDateKey('2026-13-01')).toBe(false)
    expect(isValidDateKey('bad-key')).toBe(false)
    expect(isValidDateKey('2026-06-01T00:00:00Z')).toBe(false)

    expect(
      recomputeStreak(
        { 'bad-key': { lit: 1, reviewed: 0, focusMinutes: 0, xp: 2 } },
        'bad-key'
      )
    ).toBe(0)
    expect(
      recomputeStreak(
        { '2026-02-30': { lit: 1, reviewed: 0, focusMinutes: 0, xp: 2 } },
        '2026-02-30'
      )
    ).toBe(0)
    expect(diffDays('bad-key', '2026-06-01')).toBe(0)

    const p = emptyPackProgress(pack.id)
    expect(recordDailyActivity(p, '2026-02-30', { lit: 1 })).toBe(p)
    expect(
      getActiveStreak({ ...p, lastStudyDate: 'bad-key', streakDays: 5 }, '2026-06-01')
    ).toBe(0)
  })
})
