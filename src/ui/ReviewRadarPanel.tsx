import { useEffect } from 'react'
import { Brain, Check, RotateCcw, X } from 'lucide-react'
import type { GraphIndex, PackProgress } from '../core/types'

interface ReviewRadarPanelProps {
  dueIds: readonly string[]
  index: GraphIndex | null
  progress: PackProgress | null
  drawerOpen?: boolean
  onGradeReview: (nodeId: string, remembered: boolean) => void
  onSelectAndFly: (nodeId: string) => void
  onClose: () => void
}

export function ReviewRadarPanel({
  dueIds,
  index,
  progress,
  drawerOpen = false,
  onGradeReview,
  onSelectAndFly,
  onClose
}: ReviewRadarPanelProps) {
  const currentId = dueIds[0] ?? null
  const currentNode = currentId && index ? index.nodesById.get(currentId) ?? null : null
  const entry = currentId && progress ? progress.nodes[currentId] : undefined

  useEffect(() => {
    if (currentId) {
      onSelectAndFly(currentId)
    }
  }, [currentId, onSelectAndFly])

  return (
    <aside
      className={`side-panel hud-panel review-radar-panel${drawerOpen ? ' with-drawer' : ''}`}
      data-testid="review-radar-panel"
    >
      <div className="side-panel-header">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Brain size={15} />
          <span>间隔复习雷达 ({dueIds.length})</span>
        </span>
        <button type="button" className="hud-btn" onClick={onClose} aria-label="关闭复习雷达">
          <X size={13} />
        </button>
      </div>

      <div className="side-panel-body">
        {!currentNode || !currentId ? (
          <div style={{ padding: '14px 4px', textAlign: 'center', color: 'var(--text-muted)' }}>
            当前没有到期的待复习节点，继续点亮新知识吧！
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{currentNode.title.zh}</div>
              {currentNode.title.en && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {currentNode.title.en}
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                <span className="meta-pill">Leitner Box {entry?.leitnerBox ?? 1}</span>
                <span className="meta-pill">熟练度 {entry?.mastery ?? 0}/3</span>
                <span className="meta-pill">已复习 {entry?.reviewCount ?? 0} 次</span>
              </div>
            </div>

            {currentNode.summary && (
              <div className="reason-item">{currentNode.summary}</div>
            )}

            {entry?.noteMarkdown && (
              <div className="reason-item soft">
                <strong>我的笔记：</strong>
                <div>{entry.noteMarkdown}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="hud-btn hud-btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                data-testid="btn-review-remembered"
                onClick={() => onGradeReview(currentId, true)}
              >
                <Check size={14} />
                <span>记住了 (+1 XP)</span>
              </button>

              <button
                type="button"
                className="hud-btn hud-btn-danger"
                style={{ flex: 1, justifyContent: 'center' }}
                data-testid="btn-review-forgot"
                onClick={() => onGradeReview(currentId, false)}
              >
                <RotateCcw size={14} />
                <span>忘记了</span>
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
