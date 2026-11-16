import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bookmark,
  CheckSquare,
  ExternalLink,
  Flame,
  FolderOpen,
  ListChecks,
  Pin,
  Plus,
  Route,
  Sparkles,
  Trash2,
  X,
  Zap
} from 'lucide-react'
import { isLit, leafAvailable, unitAvailable } from '../core/graph'
import { computePathTrace, type PathTraceResult } from '../core/pathTrace'
import type {
  CustomResource,
  FocusTimerState,
  GraphIndex,
  KnowledgeNode,
  MutationResult,
  PackProgress,
  UserNodeStatus
} from '../core/types'
import { FocusTimerWidget } from './FocusTimerWidget'
import { nodeDisplayTitle, sanitizeHttpUrl } from './utils'

interface StudyDrawerProps {
  node: KnowledgeNode
  index: GraphIndex
  progress: PackProgress | null
  litLeaves: ReadonlySet<string>
  focusTimer: FocusTimerState
  isMobile?: boolean
  onClose: () => void
  onSelectAndFly: (nodeId: string) => void
  onEnterCluster: (clusterId: string) => void
  onLight: (nodeId: string, force?: boolean) => Promise<void>
  onUnlight: (nodeId: string) => Promise<void>
  onBatchLightUnit: (unitId: string, force?: boolean) => Promise<void>
  onBatchUnlightUnit: (unitId: string) => Promise<void>
  onSetStatus: (nodeId: string, status: UserNodeStatus) => Promise<void>
  onTogglePin: (nodeId: string) => void
  onToggleTag: (nodeId: string, tag: string) => void
  onToggleExercise: (nodeId: string, idx: number) => void
  onUpdateNote: (nodeId: string, md: string) => void
  onAddCustomResource: (
    nodeId: string,
    res: { title: string; url: string; lang?: 'zh' | 'en' }
  ) => MutationResult<CustomResource>
  onRemoveCustomResource: (nodeId: string, resId: string) => void
  onStartFocus: (nodeId: string, minutes: number) => void
  onPauseFocus: () => void
  onCompleteFocus: () => void
  onToast: (message: string, kind?: 'info' | 'error') => void
}

const KIND_LABELS: Record<KnowledgeNode['kind'], string> = {
  branch: '知识分支',
  unit: '学习单元',
  leaf: '知识点'
}

export function StudyDrawer({
  node,
  index,
  progress,
  litLeaves,
  focusTimer,
  isMobile,
  onClose,
  onSelectAndFly,
  onEnterCluster,
  onLight,
  onUnlight,
  onBatchLightUnit,
  onBatchUnlightUnit,
  onSetStatus,
  onTogglePin,
  onToggleTag,
  onToggleExercise,
  onUpdateNote,
  onAddCustomResource,
  onRemoveCustomResource,
  onStartFocus,
  onPauseFocus,
  onCompleteFocus,
  onToast
}: StudyDrawerProps) {
  const [showChecklist, setShowChecklist] = useState(false)
  const [resTitle, setResTitle] = useState('')
  const [resUrl, setResUrl] = useState('')
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    setShowChecklist(false)
    setResTitle('')
    setResUrl('')
    setNewTag('')
  }, [node.id])

  const entry = progress?.nodes[node.id]
  const currentStatus: UserNodeStatus = entry?.status ?? 'unstarted'
  const isNodeLit = isLit(node.id, index, litLeaves)

  const unitLeaves = useMemo(() => {
    return node.kind === 'unit' ? index.leavesOf(node.id) : []
  }, [node.kind, node.id, index])

  const owningUnitNode = useMemo(() => {
    if (node.kind !== 'leaf') return null
    const uid = index.owningUnit(node.id)
    return uid ? index.nodesById.get(uid) ?? null : null
  }, [node.id, node.kind, index])

  const canLight = useMemo(() => {
    if (node.kind === 'leaf') return leafAvailable(node.id, index, litLeaves)
    if (node.kind === 'unit') {
      return unitLeaves.length > 0 && unitAvailable(node.id, index, litLeaves)
    }
    return false
  }, [node.id, node.kind, unitLeaves.length, index, litLeaves])

  const canForceLight =
    node.kind === 'leaf' || (node.kind === 'unit' && unitLeaves.length > 0)

  const prereqUnitId = node.kind === 'unit' ? node.id : owningUnitNode?.id ?? null
  const hardPrereqs = useMemo(
    () => (prereqUnitId ? index.hardPrereqsByNode.get(prereqUnitId) ?? [] : []),
    [prereqUnitId, index]
  )
  const softPrereqs = useMemo(
    () => (prereqUnitId ? index.softPrereqsByNode.get(prereqUnitId) ?? [] : []),
    [prereqUnitId, index]
  )

  const pathTrace: PathTraceResult = useMemo(
    () => computePathTrace(node.id, index, litLeaves, { maxSteps: 24, includeSoft: true }),
    [node.id, index, litLeaves]
  )

  const domain = index.pack.domains.find((d) => d.id === node.domainId)
  const completedExercises = useMemo(
    () => new Set(entry?.completedExercises ?? []),
    [entry?.completedExercises]
  )
  const customResources = entry?.customResources ?? []
  const builtinResources = node.resources ?? []
  const exercises = node.exercises ?? []
  const showChecklistTab = node.kind === 'unit' && unitLeaves.length > 0

  const handleSubmitResource = (e: React.FormEvent) => {
    e.preventDefault()
    const result = onAddCustomResource(node.id, { title: resTitle, url: resUrl })
    if (!result.ok) {
      onToast(result.error, 'error')
      return
    }
    setResTitle('')
    setResUrl('')
    onToast('已添加自定义学习资源', 'info')
  }

  const mobileViewport =
    isMobile ?? (typeof window !== 'undefined' && window.innerWidth <= 768)

  return (
    <motion.aside
      className="study-drawer hud-panel"
      data-testid="study-drawer"
      initial={mobileViewport ? { opacity: 0, y: 24 } : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={mobileViewport ? { opacity: 0, y: 24 } : { opacity: 0, x: 24 }}
      transition={{ duration: 0.18 }}
    >
      <div className="drawer-header">
        <div className="drawer-header-top">
          <div style={{ minWidth: 0 }}>
            <h2 className="drawer-title" data-testid="drawer-title">
              {node.title.zh}
            </h2>
            {node.title.en && <div className="drawer-subtitle">{node.title.en}</div>}
          </div>
          <button
            type="button"
            className="hud-btn"
            data-testid="drawer-close"
            aria-label="关闭学习抽屉"
            onClick={onClose}
          >
            <X size={14} />
          </button>
        </div>

        <div className="drawer-meta-row">
          <span className="meta-pill">{KIND_LABELS[node.kind]}</span>
          {domain && (
            <span className="meta-pill">
              <span className="domain-dot" style={{ backgroundColor: domain.color }} />
              <span>{domain.name}</span>
            </span>
          )}
          {node.core && <span className="meta-pill">核心节点</span>}
          {typeof node.estimatedMinutes === 'number' && (
            <span className="meta-pill">约 {node.estimatedMinutes} 分钟</span>
          )}
          {owningUnitNode && (
            <button
              type="button"
              className="meta-pill meta-pill-btn"
              onClick={() => onSelectAndFly(owningUnitNode.id)}
              title="跳转到所属学习单元"
            >
              <FolderOpen size={11} />
              <span>所属单元：{owningUnitNode.title.zh}</span>
            </button>
          )}
        </div>
      </div>

      <div className="drawer-actions">
        {!isNodeLit ? (
          <>
            <button
              type="button"
              className="hud-btn hud-btn-gold"
              data-testid="btn-light"
              disabled={!canLight}
              onClick={() => void onLight(node.id, false)}
              title={canLight ? '点亮此节点' : '存在未完成的前置硬先修'}
            >
              <Sparkles size={13} />
              <span>点亮</span>
            </button>
            <button
              type="button"
              className="hud-btn"
              data-testid="btn-force-light"
              disabled={!canForceLight}
              onClick={() => void onLight(node.id, true)}
              title="跳过先修限制直接点亮"
            >
              <Zap size={13} />
              <span>强制点亮</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            className="hud-btn"
            data-testid="btn-unlight"
            onClick={() => void onUnlight(node.id)}
          >
            <span>取消点亮</span>
          </button>
        )}

        <button
          type="button"
          className={`hud-btn ${currentStatus === 'queued' ? 'active' : ''}`}
          data-testid="btn-queue"
          onClick={() =>
            void onSetStatus(node.id, currentStatus === 'queued' ? 'unstarted' : 'queued')
          }
        >
          <span>加入队列</span>
        </button>

        <button
          type="button"
          className={`hud-btn ${currentStatus === 'learning' ? 'active' : ''}`}
          data-testid="btn-learning"
          onClick={() =>
            void onSetStatus(node.id, currentStatus === 'learning' ? 'unstarted' : 'learning')
          }
        >
          <Flame size={13} />
          <span>学习中</span>
        </button>

        <button
          type="button"
          className={`hud-btn ${entry?.pinned ? 'active' : ''}`}
          data-testid="btn-pin"
          onClick={() => onTogglePin(node.id)}
        >
          <Pin size={13} />
          <span>{entry?.pinned ? '已置顶' : '置顶'}</span>
        </button>

        {node.kind !== 'leaf' && (
          <button
            type="button"
            className="hud-btn"
            onClick={() => onEnterCluster(node.id)}
          >
            <span>进入星团</span>
          </button>
        )}

        {showChecklistTab && (
          <button
            type="button"
            className={`hud-btn ${showChecklist ? 'active' : ''}`}
            data-testid="checklist-tab"
            aria-pressed={showChecklist}
            onClick={() => setShowChecklist((v) => !v)}
          >
            <ListChecks size={13} />
            <span>清单 ({unitLeaves.length})</span>
          </button>
        )}
      </div>

      <div className="drawer-body">
        {showChecklistTab && showChecklist ? (
          <section className="drawer-section">
            <div className="drawer-section-title">
              <span>单元知识点清单 ({unitLeaves.length})</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className="hud-btn"
                  style={{ height: 22, fontSize: 11 }}
                  onClick={() => void onBatchLightUnit(node.id, !unitAvailable(node.id, index, litLeaves))}
                >
                  全部点亮
                </button>
                <button
                  type="button"
                  className="hud-btn"
                  style={{ height: 22, fontSize: 11 }}
                  onClick={() => void onBatchUnlightUnit(node.id)}
                >
                  全部重置
                </button>
              </div>
            </div>

            <div className="checklist-grid" data-testid="checklist-grid">
              {unitLeaves.map((leaf) => {
                const leafLit = litLeaves.has(leaf.id)
                return (
                  <button
                    key={leaf.id}
                    type="button"
                    role="checkbox"
                    aria-checked={leafLit}
                    className="checklist-item"
                    onClick={() =>
                      leafLit ? void onUnlight(leaf.id) : void onLight(leaf.id, true)
                    }
                  >
                    <span style={{ textAlign: 'left' }}>{leaf.title.zh}</span>
                    <span className="status-tag">{leafLit ? '已点亮' : '未点亮'}</span>
                  </button>
                )
              })}
            </div>
          </section>
        ) : (
          <>
            <FocusTimerWidget
              focusTimer={focusTimer}
              targetNodeId={node.id}
              targetNodeTitle={node.title.zh}
              onStartFocus={onStartFocus}
              onPauseFocus={onPauseFocus}
              onCompleteFocus={onCompleteFocus}
            />

            {(node.summary || node.outcome || node.caution || node.evidence) && (
              <section className="drawer-section">
                <h3 className="drawer-section-title">概念摘要</h3>
                {node.summary && <p style={{ margin: 0 }}>{node.summary}</p>}
                {node.outcome && (
                  <div className="reason-item">
                    <strong>掌握目标：</strong>
                    {node.outcome}
                  </div>
                )}
                {node.caution && (
                  <div className="reason-item soft">
                    <strong>易错提醒：</strong>
                    {node.caution}
                  </div>
                )}
                {node.evidence && (
                  <div className="reason-item">
                    <strong>检验标准：</strong>
                    {node.evidence}
                  </div>
                )}
              </section>
            )}

            {(hardPrereqs.length > 0 || softPrereqs.length > 0) && (
              <section className="drawer-section">
                <h3 className="drawer-section-title">
                  先修依赖说明 ({hardPrereqs.length + softPrereqs.length})
                </h3>
                <div className="reason-list">
                  {hardPrereqs.map((edge) => {
                    const fromNode = index.nodesById.get(edge.from)
                    return (
                      <div key={edge.id} className="reason-item hard">
                        <div>
                          <strong>[硬先修] {nodeDisplayTitle(fromNode) || edge.from}</strong>
                        </div>
                        {edge.reason && <div>{edge.reason}</div>}
                      </div>
                    )
                  })}
                  {softPrereqs.map((edge) => {
                    const fromNode = index.nodesById.get(edge.from)
                    return (
                      <div key={edge.id} className="reason-item soft">
                        <div>
                          <strong>[软推荐] {nodeDisplayTitle(fromNode) || edge.from}</strong>
                        </div>
                        {edge.reason && <div>{edge.reason}</div>}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            <section className="drawer-section">
              <h3 className="drawer-section-title">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Route size={13} />
                  <span>PathTrace 前置路径</span>
                </span>
                <span>
                  {pathTrace.litLeavesInScope}/{pathTrace.totalLeavesInScope} 叶已亮
                </span>
              </h3>
              <div className="pathtrace-panel" data-testid="pathtrace-panel">
                {pathTrace.chain.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    当前节点无额外先修依赖，可直接学习。
                  </div>
                ) : (
                  <div className="pathtrace-chain">
                    {pathTrace.chain.map((item) => (
                      <button
                        key={item.unitId}
                        type="button"
                        className="pathtrace-step-btn"
                        onClick={() => onSelectAndFly(item.unitId)}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span className={`pathtrace-dot ${item.status}`} />
                          <span>{item.title.zh}</span>
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                          {item.litLeaves}/{item.totalLeaves}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {pathTrace.steps.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      推荐下一步（点击定位）：
                    </div>
                    {pathTrace.steps.slice(0, 5).map((step) => (
                      <button
                        key={step.leafId}
                        type="button"
                        className="pathtrace-step-btn"
                        onClick={() => onSelectAndFly(step.leafId)}
                      >
                        <span>
                          {step.order}. {step.leafTitle.zh}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--accent)' }}>定位</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="drawer-section">
              <h3 className="drawer-section-title">
                <span>学习资源 ({builtinResources.length + customResources.length})</span>
              </h3>
              <div className="resource-list">
                {builtinResources.map((res, idx) => {
                  const safeUrl = sanitizeHttpUrl(res.url)
                  return (
                    <div key={`${res.id ?? res.url}-${idx}`} className="resource-row">
                      {safeUrl ? (
                        <a
                          href={safeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="resource-link"
                        >
                          <ExternalLink size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                          {res.title}
                        </a>
                      ) : (
                        <span>{res.title}</span>
                      )}
                      {res.lang && <span className="status-tag">{res.lang.toUpperCase()}</span>}
                    </div>
                  )
                })}

                {customResources.map((res) => {
                  const safeUrl = sanitizeHttpUrl(res.url)
                  return (
                    <div key={res.id} className="resource-row">
                      {safeUrl ? (
                        <a
                          href={safeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="resource-link"
                        >
                          <ExternalLink size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                          {res.title}
                        </a>
                      ) : (
                        <span>{res.title}</span>
                      )}
                      <button
                        type="button"
                        className="crumb-btn"
                        aria-label={`移除资源 ${res.title}`}
                        onClick={() => onRemoveCustomResource(node.id, res.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )
                })}
              </div>

              <form
                className="custom-resource-form"
                data-testid="custom-resource-form"
                noValidate
                onSubmit={handleSubmitResource}
              >
                <input
                  type="text"
                  className="hud-input"
                  placeholder="自定义资源标题"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                />
                <input
                  type="url"
                  className="hud-input"
                  placeholder="https://example.com/resource"
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                />
                <button type="submit" className="hud-btn hud-btn-primary">
                  <Plus size={12} />
                  <span>添加自定义资源</span>
                </button>
              </form>
            </section>

            {exercises.length > 0 && (
              <section className="drawer-section">
                <h3 className="drawer-section-title">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <CheckSquare size={13} />
                    <span>练习自检 ({completedExercises.size}/{exercises.length})</span>
                  </span>
                </h3>
                <div className="exercise-list">
                  {exercises.map((exercise, idx) => (
                    <label key={`${node.id}-ex-${idx}`} className="exercise-item">
                      <input
                        type="checkbox"
                        checked={completedExercises.has(idx)}
                        onChange={() => onToggleExercise(node.id, idx)}
                      />
                      <span>{exercise}</span>
                    </label>
                  ))}
                </div>
              </section>
            )}

            <section className="drawer-section">
              <h3 className="drawer-section-title">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Bookmark size={13} />
                  <span>标签与学习笔记 (Markdown)</span>
                </span>
              </h3>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
                {(entry?.tags ?? []).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="domain-chip"
                    onClick={() => onToggleTag(node.id, tag)}
                    title="点击移除标签"
                  >
                    <span>#{tag}</span>
                    <X size={10} />
                  </button>
                ))}
                <input
                  type="text"
                  className="hud-input"
                  style={{ width: 120, height: 24, padding: '0 7px' }}
                  placeholder="+ 标签回车"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTag.trim()) {
                      e.preventDefault()
                      onToggleTag(node.id, newTag.trim())
                      setNewTag('')
                    }
                  }}
                />
              </div>

              <textarea
                className="note-textarea"
                data-testid="note-editor"
                placeholder="随时记录推导、疑难或总结 (支持 Markdown，任意状态可编辑)..."
                value={entry?.noteMarkdown ?? ''}
                onChange={(e) => onUpdateNote(node.id, e.target.value)}
              />
            </section>
          </>
        )}
      </div>
    </motion.aside>
  )
}
