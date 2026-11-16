import { useRef, useState } from 'react'
import { Download, FileText, RotateCcw, Upload, X } from 'lucide-react'
import type { MutationResult } from '../core/types'
import { triggerDownload } from './utils'

interface BackupModalProps {
  open: boolean
  activePackId: string
  onExportBackup: () => Promise<string>
  onExportMarkdown: () => string
  onImportBackup: (
    json: string,
    mode?: 'merge' | 'replace'
  ) => Promise<MutationResult<{ packsImported: number }>>
  onResetCuration: () => Promise<void>
  onClose: () => void
  onToast: (message: string, kind?: 'info' | 'error') => void
}

export function BackupModal({
  open,
  activePackId,
  onExportBackup,
  onExportMarkdown,
  onImportBackup,
  onResetCuration,
  onClose,
  onToast
}: BackupModalProps) {
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  if (!open) return null

  const handleExportJson = async () => {
    try {
      setBusy(true)
      const json = await onExportBackup()
      triggerDownload(
        `litree-galaxy-backup-${new Date().toISOString().slice(0, 10)}.json`,
        json,
        'application/json'
      )
      onToast('已导出统一 JSON 备份', 'info')
    } catch (err) {
      onToast(err instanceof Error ? err.message : '导出备份失败', 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleExportMd = () => {
    try {
      const md = onExportMarkdown()
      triggerDownload(
        `litree-journal-${activePackId}-${new Date().toISOString().slice(0, 10)}.md`,
        md,
        'text/markdown;charset=utf-8'
      )
      onToast('已导出 Markdown 学习日志', 'info')
    } catch (err) {
      onToast(err instanceof Error ? err.message : '导出 Markdown 失败', 'error')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setBusy(true)
      const text = await file.text()
      const res = await onImportBackup(text, importMode)
      if (!res.ok) {
        onToast(res.error || '备份文件格式无效，已保留当前数据', 'error')
      } else {
        onToast(`导入成功：已恢复 ${res.data.packsImported} 个知识包数据`, 'info')
      }
    } catch (err) {
      onToast(err instanceof Error ? err.message : '读取导入文件失败', 'error')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleResetCuration = async () => {
    try {
      setBusy(true)
      await onResetCuration()
      onToast('已重置当前知识包的自定义图谱修改', 'info')
    } catch (err) {
      onToast(err instanceof Error ? err.message : '重置失败', 'error')
    } finally {
      setBusy(false)
    }
  }

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
        aria-label="数据备份、导入与恢复"
        data-testid="backup-modal"
      >
        <div className="modal-header">
          <strong>数据备份与学习日志</strong>
          <button type="button" className="hud-btn" onClick={onClose} aria-label="关闭备份弹窗">
            <X size={13} />
          </button>
        </div>

        <div className="modal-body">
          <section className="drawer-section">
            <h3 className="drawer-section-title">导出数据</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="hud-btn hud-btn-primary"
                data-testid="btn-export-json"
                disabled={busy}
                onClick={() => void handleExportJson()}
              >
                <Download size={13} />
                <span>导出 JSON 备份 (v2)</span>
              </button>

              <button
                type="button"
                className="hud-btn"
                data-testid="btn-export-md"
                disabled={busy}
                onClick={handleExportMd}
              >
                <FileText size={13} />
                <span>导出 Markdown 学习笔记</span>
              </button>
            </div>
          </section>

          <section className="drawer-section">
            <h3 className="drawer-section-title">导入恢复（兼容 v1 与 v2）</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <select
                aria-label="导入合并模式"
                className="hud-select"
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
              >
                <option value="merge">智能合并 (Merge)</option>
                <option value="replace">覆盖替换 (Replace)</option>
              </select>

              <label className="hud-btn" style={{ cursor: 'pointer' }}>
                <Upload size={13} />
                <span>选择备份 JSON 文件</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".json,application/json"
                  data-testid="import-json-input"
                  onChange={(e) => void handleFileChange(e)}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </section>

          <section className="drawer-section">
            <h3 className="drawer-section-title">图谱编辑重置</h3>
            <div>
              <button
                type="button"
                className="hud-btn hud-btn-danger"
                disabled={busy}
                onClick={() => void handleResetCuration()}
              >
                <RotateCcw size={13} />
                <span>重置当前包的图谱编辑覆盖</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
