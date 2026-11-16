import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, GitBranchPlus, Pencil, Plus, Trash2, X } from 'lucide-react'
import { findCycleEdgeIds, wouldCreateCycle } from '../core/schema'
import type {
  CreateEdgeInput,
  CreateNodeInput,
  EdgeType,
  GraphIndex,
  KnowledgeEdge,
  KnowledgeNode,
  MutationResult,
  NodeKind,
  PackDocument
} from '../core/types'

interface GraphEditorPanelProps {
  pack: PackDocument
  index: GraphIndex
  selectedNode: KnowledgeNode | null
  onCreateNode: (input: CreateNodeInput) => Promise<MutationResult<KnowledgeNode>>
  onUpdateNode: (
    id: string,
    patch: Partial<Omit<KnowledgeNode, 'id'>>
  ) => Promise<MutationResult<KnowledgeNode>>
  onDeleteNode: (id: string) => Promise<MutationResult<string[]>>
  onCreateEdge: (input: CreateEdgeInput) => Promise<MutationResult<KnowledgeEdge>>
  onDeleteEdge: (id: string) => Promise<MutationResult<void>>
  onClose: () => void
  onToast: (message: string, kind?: 'info' | 'error') => void
}

export function GraphEditorPanel({
  pack,
  index,
  selectedNode,
  onCreateNode,
  onUpdateNode,
  onDeleteNode,
  onCreateEdge,
  onDeleteEdge,
  onClose,
  onToast
}: GraphEditorPanelProps) {
  const unitNodes = useMemo(
    () => pack.nodes.filter((n) => n.kind === 'unit'),
    [pack.nodes]
  )
  const branchNodes = useMemo(
    () => pack.nodes.filter((n) => n.kind === 'branch' && !index.owningUnit(n.id)),
    [pack.nodes, index]
  )

  const [newNodeTitle, setNewNodeTitle] = useState('')
  const [newNodeKind, setNewNodeKind] = useState<NodeKind>('unit')
  const [newNodeDomainId, setNewNodeDomainId] = useState<string>(pack.domains[0]?.id ?? '')

  const [fromId, setFromId] = useState<string>(unitNodes[0]?.id ?? '')
  const [toId, setToId] = useState<string>(unitNodes[1]?.id ?? unitNodes[0]?.id ?? '')
  const [edgeType, setEdgeType] = useState<EdgeType>('hard')
  const [edgeReason, setEdgeReason] = useState('')
  const [cycleError, setCycleError] = useState<string | null>(null)

  const [editTitle, setEditTitle] = useState(selectedNode?.title.zh ?? '')

  useEffect(() => {
    setEditTitle(selectedNode?.title.zh ?? '')
  }, [selectedNode])

  useEffect(() => {
    if (!pack.domains.some((d) => d.id === newNodeDomainId)) {
      setNewNodeDomainId(pack.domains[0]?.id ?? '')
    }
  }, [pack.domains, newNodeDomainId])

  useEffect(() => {
    if (unitNodes.length > 0 && !unitNodes.some((u) => u.id === fromId)) {
      setFromId(unitNodes[0]?.id ?? '')
    }
    if (unitNodes.length > 0 && !unitNodes.some((u) => u.id === toId)) {
      setToId(unitNodes[1]?.id ?? unitNodes[0]?.id ?? '')
    }
  }, [unitNodes, fromId, toId])

  const liveCyclePath = useMemo(() => {
    if (!fromId || !toId) return null
    return wouldCreateCycle({ from: fromId, to: toId, type: edgeType }, pack.nodes, pack.edges)
  }, [fromId, toId, edgeType, pack.nodes, pack.edges])

  const liveCycleEdges = useMemo(
    () => (liveCyclePath ? findCycleEdgeIds(liveCyclePath, pack.edges) : []),
    [liveCyclePath, pack.edges]
  )

  const incidentEdges = useMemo(() => {
    if (!selectedNode) return [] as KnowledgeEdge[]
    return pack.edges.filter((e) => e.from === selectedNode.id || e.to === selectedNode.id)
  }, [selectedNode, pack.edges])

  const handleCreateNode = async () => {
    const trimmed = newNodeTitle.trim()
    if (!trimmed) {
      return
    }
    const domainId =
      newNodeDomainId || selectedNode?.domainId || pack.domains[0]?.id || ''
    let parentId: string | null = null
    if (newNodeKind === 'unit') {
      if (selectedNode?.kind === 'branch' && !index.owningUnit(selectedNode.id)) {
        parentId = selectedNode.id
      } else {
        parentId =
          branchNodes.find((b) => b.domainId === domainId)?.id ??
          branchNodes[0]?.id ??
          null
      }
    } else if (newNodeKind === 'leaf') {
      if (selectedNode?.kind === 'unit') {
        parentId = selectedNode.id
      } else {
        parentId =
          unitNodes.find((u) => u.domainId === domainId)?.id ??
          unitNodes[0]?.id ??
          null
      }
    }

    const res = await onCreateNode({
      kind: newNodeKind,
      title: { zh: trimmed },
      domainId,
      parentId
    })
    if (!res.ok) {
      onToast(res.error, 'error')
      return
    }
    setNewNodeTitle('')
    onToast(`已创建节点：${res.data.title.zh}`, 'info')
  }

  const handleCreateEdge = async () => {
    if (!fromId || !toId) return
    const res = await onCreateEdge({
      from: fromId,
      to: toId,
      type: edgeType,
      reason: edgeReason.trim() || undefined
    })
    if (!res.ok) {
      setCycleError(res.error)
      return
    }
    setCycleError(null)
    setEdgeReason('')
    onToast(`已添加依赖边：${fromId} -> ${toId}`, 'info')
  }

  const handleSaveTitle = async () => {
    if (!selectedNode) return
    const trimmed = editTitle.trim()
    if (!trimmed) return
    const res = await onUpdateNode(selectedNode.id, {
      title: { ...selectedNode.title, zh: trimmed }
    })
    if (!res.ok) {
      onToast(res.error, 'error')
      return
    }
    onToast('节点标题已更新', 'info')
  }

  return (
    <aside className="side-panel hud-panel" data-testid="graph-editor-panel">
      <div className="side-panel-header">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Pencil size={14} />
          <span>实时图谱编辑器</span>
        </span>
        <button type="button" className="hud-btn" onClick={onClose} aria-label="关闭编辑器">
          <X size={13} />
        </button>
      </div>

      <div className="side-panel-body">
        {/* Positional DOM Contract: First <input> MUST be New Node Title */}
        <section className="drawer-section">
          <h3 className="drawer-section-title">新建节点</h3>
          <input
            type="text"
            className="hud-input"
            placeholder="输入新节点标题..."
            value={newNodeTitle}
            onChange={(e) => setNewNodeTitle(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {(['unit', 'leaf', 'branch'] as const).map((k) => (
              <button
                key={k}
                type="button"
                className={`hud-btn ${newNodeKind === k ? 'active' : ''}`}
                aria-pressed={newNodeKind === k}
                onClick={() => setNewNodeKind(k)}
                style={{ height: 24, fontSize: 11 }}
              >
                {k === 'unit' ? '单元' : k === 'leaf' ? '知识点' : '分支'}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="hud-btn hud-btn-primary"
            data-testid="btn-new-node"
            onClick={() => void handleCreateNode()}
          >
            <Plus size={13} />
            <span>新建节点</span>
          </button>
        </section>

        {/* Positional DOM Contract: First two <select>s MUST be Edge from & Edge to */}
        <section className="drawer-section">
          <h3 className="drawer-section-title">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <GitBranchPlus size={13} />
              <span>连接先修关系</span>
            </span>
          </h3>

          <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            前置起点 (From)
            <select
              aria-label="前置起点"
              className="hud-select"
              style={{ width: '100%', marginTop: 2 }}
              value={fromId}
              onChange={(e) => {
                setFromId(e.target.value)
                setCycleError(null)
              }}
            >
              {unitNodes.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.title.zh} ({u.id})
                </option>
              ))}
            </select>
          </label>

          <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            目标终点 (To)
            <select
              aria-label="目标终点"
              className="hud-select"
              style={{ width: '100%', marginTop: 2 }}
              value={toId}
              onChange={(e) => {
                setToId(e.target.value)
                setCycleError(null)
              }}
            >
              {unitNodes.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.title.zh} ({u.id})
                </option>
              ))}
            </select>
          </label>

          <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            边类型
            <select
              aria-label="边类型"
              className="hud-select"
              style={{ width: '100%', marginTop: 2 }}
              value={edgeType}
              onChange={(e) => {
                setEdgeType(e.target.value as EdgeType)
                setCycleError(null)
              }}
            >
              <option value="hard">硬先修 (hard)</option>
              <option value="soft">软推荐 (soft)</option>
              <option value="related">相关联 (related)</option>
            </select>
          </label>

          <input
            type="text"
            className="hud-input"
            placeholder="先修说明 (可选)"
            value={edgeReason}
            onChange={(e) => setEdgeReason(e.target.value)}
          />

          {liveCyclePath && !cycleError && (
            <div style={{ fontSize: 11, color: 'var(--gold)' }}>
              Kahn 预览提示：此连接将构成环路 ({liveCyclePath.join(' -> ')})
              {liveCycleEdges.length > 0 ? ` · 冲突边 ${liveCycleEdges.length} 条` : ''}
            </div>
          )}

          {cycleError && (
            <div className="cycle-warning-toast" role="alert" data-testid="cycle-warning-toast">
              <AlertTriangle size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              {cycleError}
            </div>
          )}

          <button
            type="button"
            className="hud-btn hud-btn-primary"
            data-testid="btn-new-edge"
            onClick={() => void handleCreateEdge()}
          >
            <GitBranchPlus size={13} />
            <span>连接先修边</span>
          </button>
        </section>

        {selectedNode && (
          <section className="drawer-section">
            <h3 className="drawer-section-title">编辑选中节点：{selectedNode.id}</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                className="hud-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <button
                type="button"
                className="hud-btn"
                onClick={() => void handleSaveTitle()}
              >
                保存
              </button>
              <button
                type="button"
                className="hud-btn hud-btn-danger"
                onClick={() => void onDeleteNode(selectedNode.id)}
                title="删除节点及子孙"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {incidentEdges.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  关联边 ({incidentEdges.length})
                </div>
                {incidentEdges.slice(0, 8).map((edge) => (
                  <div key={edge.id} className="resource-row">
                    <span style={{ fontSize: 11 }}>
                      [{edge.type}] {edge.from} → {edge.to}
                    </span>
                    <button
                      type="button"
                      className="crumb-btn"
                      onClick={() => void onDeleteEdge(edge.id)}
                      aria-label={`删除边 ${edge.id}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </aside>
  )
}
