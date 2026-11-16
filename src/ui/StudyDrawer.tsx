import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  CheckSquare,
  ChevronRight,
  ExternalLink,
  Filter,
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

type DrawerTab = 'overview' | 'children' | 'path' | 'practice'

interface StudyDrawerProps {
  node: KnowledgeNode
  index: GraphIndex
  progress: PackProgress | null
  litLeaves: ReadonlySet<string>
  focusTimer: FocusTimerState
  isMobile?: boolean
  isolateSubgraph?: boolean
  onToggleIsolate?: () => void
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
  isolateSubgraph = false,
  onToggleIsolate,
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
  const [activeTab, setActiveTab] = useState<DrawerTab>('overview')
  const [showAddResource, setShowAddResource] = useState(false)
  const [resTitle, setResTitle] = useState('')
  const [resUrl, setResUrl] = useState('')
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    setActiveTab('overview')
    setShowAddResource(false)
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

  const directChildren = useMemo(() => {
    return index.childrenByParent.get(node.id) ?? []
  }, [node.id, index])

  const parentNode = useMemo(() => {
    return node.parentId ? index.nodesById.get(node.parentId) ?? null : null
  }, [node.parentId, index])

  const owningUnitNode = useMemo(() => {
    if (node.kind !== 'leaf') return null
    const uid = index.owningUnit(node.id)
    return uid ? index.nodesById.get(uid) ?? null : null
  }, [node.id, node.kind, index])

  const siblingLeaves = useMemo(() => {
    if (node.kind !== 'leaf') return []
    const sibParentId = node.parentId ?? owningUnitNode?.id
    if (!sibParentId) return []
    return (index.childrenByParent.get(sibParentId) ?? []).filter((n) => n.kind === 'leaf')
  }, [node.kind, node.parentId, owningUnitNode, index])

  const siblingIdx = useMemo(() => {
    return siblingLeaves.findIndex((n) => n.id === node.id)
  }, [siblingLeaves, node.id])

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
  const builtinResources = useMemo(() => {
    if (node.resources && node.resources.length > 0) return node.resources
    const titleZh = node.title.zh.trim() || node.id
    const titleEn = node.title.en?.trim() || titleZh
    const unitPrefix = owningUnitNode?.title.zh ? `${owningUnitNode.title.zh} ` : ''
    return [
      {
        title: `中文百科 · ${titleZh}`,
        url: `https://zh.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(titleZh)}`,
        lang: 'zh' as const
      },
      {
        title: `Wikipedia · ${titleEn}`,
        url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(titleEn)}`,
        lang: 'en' as const
      },
      {
        title: `课程精讲检索 · ${titleZh}`,
        url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(`${unitPrefix}${titleZh}`)}`,
        lang: 'zh' as const
      }
    ]
  }, [node.id, node.title.zh, node.title.en, node.resources, owningUnitNode])
  const inheritedUnitResources =
    node.kind === 'leaf' && owningUnitNode?.resources ? owningUnitNode.resources : []
  const exercises = node.exercises ?? []

  const showChecklistTab = node.kind === 'unit' && unitLeaves.length > 0
  const showChildrenTab =
    showChecklistTab || directChildren.length > 0 || siblingLeaves.length > 1
  const childrenCount = showChecklistTab
    ? unitLeaves.length
    : directChildren.length > 0
      ? directChildren.length
      : siblingLeaves.length

  const handleSubmitResource = (e: React.FormEvent) => {
    e.preventDefault()
    const result = onAddCustomResource(node.id, { title: resTitle, url: resUrl })
    if (!result.ok) {
      onToast(result.error, 'error')
      return
    }
    setResTitle('')
    setResUrl('')
    setShowAddResource(false)
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
            {(owningUnitNode || parentNode) && (
              <button
                type="button"
                className="drawer-parent-crumb"
                onClick={() => onSelectAndFly((owningUnitNode ?? parentNode)!.id)}
                title="跳转到上级节点"
              >
                <ArrowLeft size={11} />
                <span>{(owningUnitNode ?? parentNode)!.title.zh}</span>
              </button>
            )}
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
          className={`hud-btn ${currentStatus === 'queued' ? 'active' : ''}`}
          data-testid="btn-queue"
          onClick={() =>
            void onSetStatus(node.id, currentStatus === 'queued' ? 'unstarted' : 'queued')
          }
        >
          <span>队列</span>
        </button>

        <button
          type="button"
          className={`hud-btn ${entry?.pinned ? 'active' : ''}`}
          data-testid="btn-pin"
          onClick={() => onTogglePin(node.id)}
          aria-label={entry?.pinned ? '已置顶' : '置顶'}
          title={entry?.pinned ? '已置顶' : '置顶'}
        >
          <Pin size={13} />
        </button>

        {onToggleIsolate && (
          <button
            type="button"
            className={`hud-btn ${isolateSubgraph ? 'active' : ''}`}
            data-testid="drawer-isolate-btn"
            onClick={onToggleIsolate}
            title={isolateSubgraph ? '显示全部画布连线' : '画布仅显示本节点关联链'}
          >
            <Filter size={13} />
          </button>
        )}

        {node.kind !== 'leaf' && directChildren.length > 0 && (
          <button
            type="button"
            className="hud-btn primary"
            data-testid="btn-enter-cluster"
            onClick={() => onEnterCluster(node.id)}
          >
            <FolderOpen size={13} />
            <span>展开下级</span>
          </button>
        )}
      </div>

      {/* 4-Tab Segmented Control */}
      <div className="drawer-tabs" role="tablist" data-testid="drawer-tabs">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'overview'}
          data-testid="tab-overview"
          className={`drawer-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BookOpen size={12} />
          <span>概览与资料</span>
        </button>

        {showChildrenTab && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'children'}
            data-testid={showChecklistTab ? 'checklist-tab' : 'tab-children'}
            className={`drawer-tab-btn ${activeTab === 'children' ? 'active' : ''}`}
            onClick={() =>
              setActiveTab((cur) => (cur === 'children' && showChecklistTab ? 'overview' : 'children'))
            }
          >
            <ListChecks size={12} />
            <span>
              {node.kind === 'leaf'
                ? `同节目录 (${childrenCount})`
                : showChecklistTab
                  ? `清单 (${childrenCount})`
                  : `下级 (${childrenCount})`}
            </span>
          </button>
        )}

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'path'}
          data-testid="tab-path"
          className={`drawer-tab-btn ${activeTab === 'path' ? 'active' : ''}`}
          onClick={() => setActiveTab('path')}
        >
          <Route size={12} />
          <span>前置路径</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'practice'}
          data-testid="tab-practice"
          className={`drawer-tab-btn ${activeTab === 'practice' ? 'active' : ''}`}
          onClick={() => setActiveTab('practice')}
        >
          <CheckSquare size={12} />
          <span>练习笔记</span>
        </button>
      </div>

      <div className="drawer-body">
        {/* TAB 1: Overview & Curated Study Resources */}
        <div className="drawer-tab-panel" hidden={activeTab !== 'overview'}>
          {!isNodeLit && !canLight && hardPrereqs.length > 0 && (
            <button
              type="button"
              className="drawer-unlock-banner"
              onClick={() => setActiveTab('path')}
            >
              <span>存在 {hardPrereqs.length} 项前置硬先修未完成 · 点击查看前置路径</span>
              <ChevronRight size={13} />
            </button>
          )}

          {(node.summary || node.outcome || node.caution || node.evidence) && (
            <section className="drawer-section">
              <h3 className="drawer-section-title">核心要点</h3>
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

          <section className="drawer-section" data-testid="drawer-resources-section">
            <h3 className="drawer-section-title">
              <span>学习资料 ({builtinResources.length + customResources.length})</span>
              <button
                type="button"
                className="crumb-btn"
                onClick={() => setShowAddResource((v) => !v)}
              >
                <Plus size={11} />
                <span>{showAddResource ? '收起添加' : '补充资料'}</span>
              </button>
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
                        <ExternalLink size={11} style={{ marginRight: 5, verticalAlign: 'middle' }} />
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
                        <ExternalLink size={11} style={{ marginRight: 5, verticalAlign: 'middle' }} />
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

            {inheritedUnitResources.length > 0 && (
              <div className="inherited-resources-group">
                <div className="inherited-resources-label">
                  所属单元「{owningUnitNode!.title.zh}」权威教材与课程 ({inheritedUnitResources.length})
                </div>
                <div className="resource-list">
                  {inheritedUnitResources.map((res, idx) => {
                    const safeUrl = sanitizeHttpUrl(res.url)
                    return (
                      <div key={`inherited-${res.url}-${idx}`} className="resource-row">
                        {safeUrl ? (
                          <a
                            href={safeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="resource-link"
                          >
                            <ExternalLink size={11} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                            {res.title}
                          </a>
                        ) : (
                          <span>{res.title}</span>
                        )}
                        {res.lang && <span className="status-tag">{res.lang.toUpperCase()}</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <form
              className="custom-resource-form"
              data-testid="custom-resource-form"
              noValidate
              hidden={!showAddResource}
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

          {node.kind === 'leaf' && siblingLeaves.length > 1 && (
            <div className="leaf-pager-row">
              <button
                type="button"
                className="hud-btn"
                disabled={siblingIdx <= 0}
                onClick={() =>
                  siblingIdx > 0 && onSelectAndFly(siblingLeaves[siblingIdx - 1]!.id)
                }
              >
                ← 上一知识点
              </button>
              <span className="leaf-pager-pos">
                {siblingIdx + 1} / {siblingLeaves.length}
              </span>
              <button
                type="button"
                className="hud-btn"
                disabled={siblingIdx < 0 || siblingIdx >= siblingLeaves.length - 1}
                onClick={() =>
                  siblingIdx >= 0 &&
                  siblingIdx < siblingLeaves.length - 1 &&
                  onSelectAndFly(siblingLeaves[siblingIdx + 1]!.id)
                }
              >
                下一知识点 →
              </button>
            </div>
          )}
        </div>

        {/* TAB 2: Children / Unit Leaves Checklist / Sibling Navigator */}
        {showChecklistTab && activeTab === 'children' && (
          <section className="drawer-section">
            <div className="drawer-section-title">
              <span>单元知识点清单 ({unitLeaves.length})</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className="hud-btn"
                  style={{ height: 22, fontSize: 11 }}
                  onClick={() =>
                    void onBatchLightUnit(node.id, !unitAvailable(node.id, index, litLeaves))
                  }
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
                  <div key={leaf.id} className="checklist-row">
                    <button
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
                    <button
                      type="button"
                      className="hud-btn"
                      aria-label={`查看 ${leaf.title.zh} 资料`}
                      title="查看该知识点资料"
                      style={{ padding: '0 8px', height: 28 }}
                      onClick={() => onSelectAndFly(leaf.id)}
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {!showChecklistTab && showChildrenTab && activeTab === 'children' && (
          <section className="drawer-section">
            <h3 className="drawer-section-title">
              <span>
                {node.kind === 'leaf'
                  ? `同级知识点 (${siblingLeaves.length})`
                  : `下级模块 (${directChildren.length})`}
              </span>
            </h3>
            <div className="pathtrace-chain">
              {(node.kind === 'leaf' ? siblingLeaves : directChildren).map((child) => {
                const childLit = isLit(child.id, index, litLeaves)
                const isSelf = child.id === node.id
                return (
                  <button
                    key={child.id}
                    type="button"
                    className={`pathtrace-step-btn ${isSelf ? 'active' : ''}`}
                    onClick={() => onSelectAndFly(child.id)}
                  >
                    <span>{child.title.zh}</span>
                    <span style={{ fontSize: 11, color: childLit ? 'var(--gold)' : 'var(--text-muted)' }}>
                      {isSelf ? '当前' : childLit ? '已点亮' : '查看资料'}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* TAB 3: Prerequisites & Learning Path */}
        <div className="drawer-tab-panel" hidden={activeTab !== 'path'}>
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
              <span>PathTrace 前置路径</span>
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
        </div>

        {/* TAB 4: Exercises & Markdown Notes */}
        <div className="drawer-tab-panel" hidden={activeTab !== 'practice'}>
          {exercises.length > 0 && (
            <section className="drawer-section">
              <h3 className="drawer-section-title">
                <span>练习自检 ({completedExercises.size}/{exercises.length})</span>
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
        </div>
      </div>

      {/* Compact Persistent Focus Timer Footer */}
      <div className="drawer-footer">
        <FocusTimerWidget
          focusTimer={focusTimer}
          targetNodeId={node.id}
          targetNodeTitle={node.title.zh}
          onStartFocus={onStartFocus}
          onPauseFocus={onPauseFocus}
          onCompleteFocus={onCompleteFocus}
        />
      </div>
    </motion.aside>
  )
}
