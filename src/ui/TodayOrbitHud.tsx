import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Compass, Flame, Orbit, Sparkles, Star } from 'lucide-react'
import { isLit } from '../core/graph'
import type { GraphIndex, KnowledgeNode, PackDocument, PackProgress } from '../core/types'

interface TodayOrbitHudProps {
  pack: PackDocument | null
  index: GraphIndex | null
  progress: PackProgress | null
  litLeaves: ReadonlySet<string>
  dueReviewIds: readonly string[]
  activeStreak: number
  activeRouteId: string | null
  onSetActiveRoute: (routeId: string | null) => void
  onContinueOrbit: () => void
  onStartReview: () => void
  onSelectAndFly: (nodeId: string) => void
}

export function TodayOrbitHud({
  pack,
  index,
  progress,
  litLeaves,
  dueReviewIds,
  activeStreak,
  activeRouteId,
  onSetActiveRoute,
  onContinueOrbit,
  onStartReview,
  onSelectAndFly
}: TodayOrbitHudProps) {
  const [collapsed, setCollapsed] = useState(false)

  const queueItems = useMemo(() => {
    if (!pack || !progress) return [] as Array<{ node: KnowledgeNode; label: string }>
    const items: Array<{ node: KnowledgeNode; label: string; priority: number }> = []
    for (const node of pack.nodes) {
      const entry = progress.nodes[node.id]
      if (!entry) continue
      if (entry.status === 'learning') {
        items.push({ node, label: '学习中', priority: 0 })
      } else if (entry.status === 'queued') {
        items.push({ node, label: '队列', priority: 1 })
      } else if (entry.pinned) {
        items.push({ node, label: '置顶', priority: 2 })
      }
    }
    items.sort((a, b) => a.priority - b.priority)
    return items.slice(0, 12).map(({ node, label }) => ({ node, label }))
  }, [pack, progress])

  const activeRoute = useMemo(() => {
    if (!pack || pack.routes.length === 0) return null
    if (activeRouteId) {
      return pack.routes.find((r) => r.id === activeRouteId) ?? pack.routes[0] ?? null
    }
    return pack.routes[0] ?? null
  }, [pack, activeRouteId])

  const routeProgress = useMemo(() => {
    if (!activeRoute || !index) return { lit: 0, total: 0, pct: 0 }
    const total = activeRoute.ids.length
    if (total === 0) return { lit: 0, total: 0, pct: 0 }
    let lit = 0
    for (const id of activeRoute.ids) {
      if (isLit(id, index, litLeaves)) lit++
    }
    return { lit, total, pct: Math.round((lit / total) * 100) }
  }, [activeRoute, index, litLeaves])

  const xp = progress?.xp ?? 0

  return (
    <aside
      className={`today-orbit-hud hud-panel ${collapsed ? 'collapsed' : 'expanded'}`}
      data-testid="today-orbit-hud"
    >
      <div className="today-orbit-header">
        <span className="today-orbit-title">
          <Orbit size={14} />
          <span>今日轨道</span>
        </span>

        <div className="today-orbit-badges">
          <span className="stat-badge" title="连续学习天数">
            <Flame size={11} />
            <span data-testid="streak-badge">{activeStreak}</span>
          </span>
          <span className="stat-badge" title="累计经验 XP">
            <Star size={11} />
            <span data-testid="xp-badge">{xp}</span>
          </span>
          <button
            type="button"
            className="hud-btn"
            data-testid="today-orbit-toggle"
            aria-expanded={!collapsed}
            aria-label={collapsed ? '展开今日轨道' : '收起今日轨道'}
            onClick={() => setCollapsed((c) => !c)}
            style={{ height: 24, padding: '0 6px' }}
          >
            {collapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="today-orbit-body">
          <div className="orbit-actions-row">
            <button
              type="button"
              className="hud-btn hud-btn-primary"
              data-testid="continue-orbit-btn"
              onClick={onContinueOrbit}
            >
              <Compass size={13} />
              <span>继续轨道巡航</span>
            </button>

            <button
              type="button"
              className="hud-btn"
              data-testid="start-review-btn"
              onClick={onStartReview}
            >
              <Sparkles size={13} />
              <span>复习</span>
              <span className="stat-badge" data-testid="due-review-count">
                {dueReviewIds.length}
              </span>
            </button>
          </div>

          {pack && pack.routes.length > 0 && activeRoute && (
            <div className="route-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <select
                  aria-label="当前学习路线"
                  className="hud-select"
                  style={{ height: 22, fontSize: 11, flex: 1, minWidth: 0 }}
                  value={activeRoute.id}
                  onChange={(e) => onSetActiveRoute(e.target.value)}
                >
                  {pack.routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      路线：{r.name}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {routeProgress.lit}/{routeProgress.total} ({routeProgress.pct}%)
                </span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${routeProgress.pct}%` }} />
              </div>
            </div>
          )}

          <div className="queue-list">
            {queueItems.length === 0 ? (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '2px 0' }}>
                暂无队列节点 — 点击节点加入学习队列或开启引导巡航
              </div>
            ) : (
              queueItems.map(({ node, label }) => (
                <button
                  key={node.id}
                  type="button"
                  className="queue-item-btn"
                  onClick={() => onSelectAndFly(node.id)}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {node.title.zh}
                  </span>
                  <span className="status-tag">{label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
