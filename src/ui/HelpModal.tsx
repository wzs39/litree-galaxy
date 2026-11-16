import { HelpCircle, X } from 'lucide-react'

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

const SHORTCUTS = [
  { key: 'Ctrl+K / /', desc: '打开全局搜索与 > 命令面板' },
  { key: 'E', desc: '开启 / 关闭实时图谱编辑器' },
  { key: '?', desc: '打开 / 关闭快捷键与帮助面板' },
  { key: 'Esc', desc: '按层级关闭当前弹窗或学习抽屉' },
  { key: '左键拖拽 / 滚轮', desc: '旋转 / 缩放 3D 知识星云视角' },
  { key: '单击 / 双击星辰', desc: '选中查看学习详情 / 钻取进入分支或单元星团' }
] as const

export function HelpModal({ open, onClose }: HelpModalProps) {
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
        aria-label="快捷键与星云使用指南"
        data-testid="help-modal"
      >
        <div className="modal-header">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
            <HelpCircle size={16} />
            <span>LitTree Galaxy 使用指南与快捷键</span>
          </span>
          <button type="button" className="hud-btn" onClick={onClose} aria-label="关闭帮助">
            <X size={13} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            将知识体系映射为 3D 交互星云：黄金代表已点亮掌握，青色代表可开始学习，琥珀色代表进行中，紫罗兰脉冲光环提醒间隔复习。
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SHORTCUTS.map((item) => (
              <div key={item.key} className="resource-row">
                <kbd
                  style={{
                    padding: '2px 7px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11
                  }}
                >
                  {item.key}
                </kbd>
                <span>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
