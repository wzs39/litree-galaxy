import { motion } from 'framer-motion'
import {
  BookOpen,
  CheckCircle2,
  Filter,
  FolderTree,
  Play,
  RotateCcw,
  X
} from 'lucide-react'
import type { GraphIndex, KnowledgeNode, NodeVisualState } from '../core/types'

interface NodeActionMenuProps {
  node: KnowledgeNode
  index: GraphIndex
  visualState: NodeVisualState
  anchor: { x: number; y: number }
  isolateSubgraph: boolean
  drawerOpen: boolean
  onOpenDrawer: () => void
  onDrillDown: (nodeId: string) => void
  onToggleIsolate: () => void
  onLight: (nodeId: string) => void
  onUnlight: (nodeId: string) => void
  onStartFocus: (nodeId: string) => void
  onClose: () => void
}

const STATE_META: Record<NodeVisualState, { label: string; color: string }> = {
  locked: { label: '未解锁', color: '#94a3b8' },
  available: { label: '可点亮', color: '#38bdf8' },
  queued: { label: '队列中', color: '#60a5fa' },
  learning: { label: '学习中', color: '#f59e0b' },
  lit: { label: '已点亮', color: '#fbbf24' },
  review_due: { label: '待复习', color: '#a78bfa' }
}

const KIND_TEXT: Record<KnowledgeNode['kind'], string> = {
  branch: '星域分支',
  unit: '知识单元',
  leaf: '知识点'
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

export function NodeActionMenu({
  node,
  index,
  visualState,
  anchor,
  isolateSubgraph,
  drawerOpen,
  onOpenDrawer,
  onDrillDown,
  onToggleIsolate,
  onLight,
  onUnlight,
  onStartFocus,
  onClose
}: NodeActionMenuProps) {
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1280
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800
  const isMobile = viewportW <= 768
  const menuW = 286
  const menuH = 220

  const rightSafeMargin = !isMobile && drawerOpen ? 426 : 16
  const left = clamp(
    anchor.x + 18,
    14,
    Math.max(14, viewportW - menuW - rightSafeMargin)
  )
  const top = clamp(
    anchor.y - 24,
    isMobile ? 124 : 104,
    Math.max(104, viewportH - menuH - 18)
  )

  const prereqCount =
    index.hardPrereqsOf(node.id).length + index.softPrereqsOf(node.id).length
  const dependentCount =
    index.hardDependentsOf(node.id).length +
    (index.softDependentsByNode.get(node.id)?.length ?? 0)
  const childCount =
    node.kind === 'branch'
      ? index.unitsOf(node.id).length
      : node.kind === 'unit'
        ? index.leavesOf(node.id).length
        : 0

  const isLit = visualState === 'lit' || visualState === 'review_due'
  const badge = STATE_META[visualState]

  return (
    <motion.div
      className="node-action-menu hud-panel"
      data-testid="node-action-menu"
      initial={{ opacity: 0, scale: 0.94, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 4 }}
      transition={{ duration: 0.16 }}
      style={isMobile ? undefined : { left, top, width: menuW }}
      role="dialog"
      aria-label={`${node.title.zh} 快捷操作菜单`}
    >
      <div className="node-action-menu-header">
        <div className="node-action-menu-badges">
          <span className="pill">{KIND_TEXT[node.kind]}</span>
          <span className="pill" style={{ borderColor: badge.color, color: badge.color }}>
            {badge.label}
          </span>
        </div>
        <button
          type="button"
          className="hud-btn"
          aria-label="关闭节点菜单"
          onClick={onClose}
          style={{ height: 24, padding: '0 6px' }}
        >
          <X size={13} />
        </button>
      </div>

      <div className="node-action-menu-title" data-testid="node-action-menu-title">
        {node.title.zh}
      </div>
      <div className="node-action-menu-meta">
        <span>前置 {prereqCount}</span>
        <span>后续 {dependentCount}</span>
        {childCount > 0 && <span>下级 {childCount} 项</span>}
      </div>

      <div className="node-action-menu-grid">
        <button
          type="button"
          className="hud-btn primary"
          data-testid="menu-open-drawer"
          onClick={onOpenDrawer}
        >
          <BookOpen size={13} />
          <span>学习详情</span>
        </button>

        {node.kind !== 'leaf' && childCount > 0 && (
          <button
            type="button"
            className="hud-btn"
            data-testid="menu-drill-down"
            onClick={() => onDrillDown(node.id)}
          >
            <FolderTree size={13} />
            <span>进入子星域</span>
          </button>
        )}

        <button
          type="button"
          className={`hud-btn ${isolateSubgraph ? 'active' : ''}`}
          data-testid="menu-isolate-graph"
          aria-pressed={isolateSubgraph}
          onClick={onToggleIsolate}
        >
          <Filter size={13} />
          <span>{isolateSubgraph ? '显示全局' : '只看关联链'}</span>
        </button>

        {isLit ? (
          <button
            type="button"
            className="hud-btn"
            data-testid="menu-toggle-light"
            onClick={() => onUnlight(node.id)}
          >
            <RotateCcw size={13} />
            <span>取消点亮</span>
          </button>
        ) : (
          <button
            type="button"
            className="hud-btn"
            data-testid="menu-toggle-light"
            onClick={() => onLight(node.id)}
          >
            <CheckCircle2 size={13} />
            <span>快速点亮</span>
          </button>
        )}

        <button
          type="button"
          className="hud-btn"
          data-testid="menu-start-focus"
          onClick={() => onStartFocus(node.id)}
        >
          <Play size={13} />
          <span>开始专注</span>
        </button>
      </div>
    </motion.div>
  )
}
