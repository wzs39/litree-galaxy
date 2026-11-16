import { useState } from 'react'
import { CheckCircle2, Pause, Play, Timer } from 'lucide-react'
import type { FocusTimerState } from '../core/types'
import { formatTimeMMSS } from './utils'

interface FocusTimerWidgetProps {
  focusTimer: FocusTimerState
  targetNodeId: string | null
  targetNodeTitle?: string
  onStartFocus: (nodeId: string, minutes: number) => void
  onPauseFocus: () => void
  onCompleteFocus: () => void
}

export function FocusTimerWidget({
  focusTimer,
  targetNodeId,
  targetNodeTitle,
  onStartFocus,
  onPauseFocus,
  onCompleteFocus
}: FocusTimerWidgetProps) {
  const [presetMinutes, setPresetMinutes] = useState(25)
  const effectiveTarget = targetNodeId ?? focusTimer.nodeId

  const canResumePaused =
    !focusTimer.running &&
    effectiveTarget !== null &&
    focusTimer.nodeId === effectiveTarget &&
    focusTimer.remainingSec > 0 &&
    focusTimer.remainingSec < focusTimer.totalSec

  const handleStartOrResume = () => {
    if (!effectiveTarget) return
    if (canResumePaused) {
      onStartFocus(effectiveTarget, focusTimer.remainingSec / 60)
      return
    }
    onStartFocus(effectiveTarget, presetMinutes)
  }

  return (
    <section className="focus-timer-widget" data-testid="focus-timer-widget">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600 }}>
          <Timer size={13} />
          <span>伴星专注计时</span>
          {targetNodeTitle && (
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>· {targetNodeTitle}</span>
          )}
        </div>
        <span className="focus-remaining" data-testid="focus-remaining">
          {formatTimeMMSS(focusTimer.remainingSec)}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
        <select
          aria-label="专注时长"
          className="hud-select"
          style={{ height: 26, fontSize: 11 }}
          value={presetMinutes}
          disabled={focusTimer.running}
          onChange={(e) => setPresetMinutes(Number(e.target.value))}
        >
          <option value={15}>15m</option>
          <option value={25}>25m</option>
          <option value={45}>45m</option>
        </select>

        <button
          type="button"
          className="hud-btn hud-btn-primary"
          data-testid="btn-start-focus"
          disabled={!effectiveTarget || focusTimer.running}
          onClick={handleStartOrResume}
        >
          <Play size={12} />
          <span>{canResumePaused ? '继续' : '开始'}</span>
        </button>

        <button
          type="button"
          className="hud-btn"
          data-testid="btn-pause-focus"
          disabled={!focusTimer.running}
          onClick={onPauseFocus}
        >
          <Pause size={12} />
          <span>暂停</span>
        </button>

        {focusTimer.nodeId && (
          <button
            type="button"
            className="hud-btn"
            onClick={onCompleteFocus}
            title="完成并记录此次专注 (+2 XP)"
          >
            <CheckCircle2 size={12} />
            <span>完成</span>
          </button>
        )}
      </div>
    </section>
  )
}
