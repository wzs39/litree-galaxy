import { useEffect, useMemo, useRef, useState } from 'react'
import { Command, Search, X } from 'lucide-react'
import type { KnowledgeNode, PackDocument, PackProgress } from '../core/types'

export interface PaletteCommand {
  id: string
  label: string
  hint?: string
  run: () => void
}

interface CommandPaletteProps {
  open: boolean
  pack: PackDocument | null
  progress: PackProgress | null
  commands: readonly PaletteCommand[]
  onSelectNode: (nodeId: string) => void
  onClose: () => void
}

const MAX_RESULTS = 40

export function CommandPalette({
  open,
  pack,
  progress,
  commands,
  onSelectNode,
  onClose
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  const trimmed = query.trim()
  const isCommandQuery = trimmed.startsWith('>')

  const matchedCommands = useMemo(() => {
    if (!isCommandQuery) return [] as PaletteCommand[]
    const needle = trimmed.slice(1).trim().toLowerCase()
    if (!needle) return [...commands]
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(needle) ||
        (cmd.hint && cmd.hint.toLowerCase().includes(needle))
    )
  }, [isCommandQuery, trimmed, commands])

  const matchedNodes = useMemo(() => {
    if (isCommandQuery || !pack) return [] as KnowledgeNode[]
    if (!trimmed) {
      return pack.nodes.slice(0, MAX_RESULTS)
    }
    const needle = trimmed.toLowerCase()
    const exact: KnowledgeNode[] = []
    const prefix: KnowledgeNode[] = []
    const body: KnowledgeNode[] = []

    for (const node of pack.nodes) {
      const idLow = node.id.toLowerCase()
      const zhLow = node.title.zh.toLowerCase()
      const enLow = node.title.en?.toLowerCase() ?? ''
      if (idLow === needle || zhLow === needle) {
        exact.push(node)
      } else if (zhLow.startsWith(needle) || idLow.startsWith(needle) || enLow.startsWith(needle)) {
        prefix.push(node)
      } else {
        const entry = progress?.nodes[node.id]
        const noteLow = entry?.noteMarkdown?.toLowerCase() ?? ''
        const summaryLow = node.summary?.toLowerCase() ?? ''
        const tagsHit =
          node.tags?.some((t) => t.toLowerCase().includes(needle)) ||
          entry?.tags?.some((t) => t.toLowerCase().includes(needle))
        if (
          zhLow.includes(needle) ||
          enLow.includes(needle) ||
          idLow.includes(needle) ||
          noteLow.includes(needle) ||
          summaryLow.includes(needle) ||
          tagsHit
        ) {
          body.push(node)
        }
      }
      if (exact.length + prefix.length + body.length >= MAX_RESULTS * 2) {
        // Enough matches collected for responsive 10k+ search
        if (exact.length >= MAX_RESULTS) break
      }
    }
    return [...exact, ...prefix, ...body].slice(0, MAX_RESULTS)
  }, [isCommandQuery, pack, progress, trimmed])

  if (!open) return null

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="命令面板与全局搜索"
        data-testid="command-palette"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            {isCommandQuery ? <Command size={15} /> : <Search size={15} />}
            <input
              ref={inputRef}
              type="text"
              className="hud-input"
              data-testid="command-input"
              placeholder="搜索知识节点、笔记、标签，或输入 > 执行命令..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="hud-btn"
            onClick={onClose}
            aria-label="关闭搜索面板"
          >
            <X size={13} />
          </button>
        </div>

        <div className="modal-body">
          <div className="palette-results" role="listbox" data-testid="command-results">
            {isCommandQuery ? (
              matchedCommands.length === 0 ? (
                <div className="palette-empty">未找到匹配的命令</div>
              ) : (
                matchedCommands.map((cmd) => (
                  <button
                    key={cmd.id}
                    type="button"
                    role="option"
                    aria-selected="false"
                    className="palette-item"
                    onClick={() => {
                      cmd.run()
                      onClose()
                    }}
                  >
                    <span>{cmd.label}</span>
                    {cmd.hint && <span className="status-tag">{cmd.hint}</span>}
                  </button>
                ))
              )
            ) : matchedNodes.length === 0 ? (
              <div className="palette-empty">未找到匹配的知识节点</div>
            ) : (
              matchedNodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  role="option"
                  aria-selected="false"
                  className="palette-item"
                  onClick={() => {
                    onSelectNode(node.id)
                    onClose()
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{node.title.zh}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {node.id}
                      {node.title.en ? ` · ${node.title.en}` : ''}
                    </div>
                  </div>
                  <span className="status-tag">{node.kind}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
