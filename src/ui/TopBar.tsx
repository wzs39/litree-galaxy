import {
  Archive,
  ArrowLeft,
  Box,
  Compass,
  HelpCircle,
  Map as MapIcon,
  Pencil,
  RotateCcw,
  Search,
  Sparkles
} from 'lucide-react'
import type {
  ActiveLens,
  GraphIndex,
  PackDocument,
  PackMeta,
  QualityPreset,
  ThemeMode,
  ViewLevel
} from '../core/types'

const LENS_OPTIONS: ReadonlyArray<{ id: ActiveLens; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'actionable', label: '可点亮' },
  { id: 'core', label: '核心' },
  { id: 'route', label: '路线' },
  { id: 'review_due', label: '待复习' },
  { id: 'bookmarked', label: '收藏' }
]

interface TopBarProps {
  topbarRef?: React.RefObject<HTMLElement | null>
  packs: readonly PackMeta[]
  activePackId: string
  pack: PackDocument | null
  index: GraphIndex | null
  viewLevel: ViewLevel
  clusterStack: readonly string[]
  activeDomains: readonly string[]
  activeLens: ActiveLens
  editMode: boolean
  renderMode?: '2d' | '3d'
  theme: ThemeMode
  quality: QualityPreset
  onSwitchPack: (packId: string) => void
  onStepBack: () => void
  onSelectCluster: (clusterId: string) => void
  onResetToGalaxy: () => void
  onToggleDomain: (domainId: string) => void
  onClearDomains: () => void
  onSetLens: (lens: ActiveLens) => void
  onOpenSearch: () => void
  onToggleEditMode: () => void
  onToggleRenderMode?: () => void
  onSetTheme: (theme: ThemeMode) => void
  onSetQuality: (quality: QualityPreset) => void
  onOpenBackup: () => void
  onOpenHelp: () => void
  onResetView: () => void
}

export function TopBar({
  topbarRef,
  packs,
  activePackId,
  pack,
  index,
  viewLevel,
  clusterStack,
  activeDomains,
  activeLens,
  editMode,
  renderMode = '2d',
  theme,
  quality,
  onSwitchPack,
  onStepBack,
  onSelectCluster,
  onResetToGalaxy,
  onToggleDomain,
  onClearDomains,
  onSetLens,
  onOpenSearch,
  onToggleEditMode,
  onToggleRenderMode,
  onSetTheme,
  onSetQuality,
  onOpenBackup,
  onOpenHelp,
  onResetView
}: TopBarProps) {
  const domains = pack?.domains ?? []

  return (
    <header ref={topbarRef} className="topbar hud-panel" data-testid="topbar">
      <div className="topbar-row">
        <div className="topbar-left">
          <span className="brand-mark">
            <Sparkles size={14} />
            <span>LitTree</span>
          </span>

          <nav className="breadcrumb-nav" aria-label="视图层级">
            <button
              type="button"
              className={`crumb-btn ${viewLevel === 'galaxy' ? 'active' : ''}`}
              onClick={onResetToGalaxy}
            >
              星云总览
            </button>
            {clusterStack.map((cid, idx) => {
              const cNode = index?.nodesById.get(cid)
              const isLast = idx === clusterStack.length - 1
              return (
                <span key={cid} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  <span>/</span>
                  <button
                    type="button"
                    className={`crumb-btn ${isLast ? 'active' : ''}`}
                    onClick={() => onSelectCluster(cid)}
                    title={cNode?.title.zh ?? cid}
                  >
                    {cNode?.title.zh ?? cid}
                  </button>
                </span>
              )
            })}
            {viewLevel !== 'galaxy' && (
              <button
                type="button"
                className="hud-btn"
                onClick={onStepBack}
                title="返回上一层级"
                style={{ height: 22, padding: '0 6px', fontSize: 11 }}
              >
                <ArrowLeft size={12} />
                <span>返回</span>
              </button>
            )}
          </nav>

          <select
            data-testid="pack-switcher"
            aria-label="切换知识包"
            className="hud-select"
            value={activePackId}
            onChange={(e) => onSwitchPack(e.target.value)}
          >
            {packs.map((p) => (
              <option key={p.id} value={p.id} data-testid={`pack-option-${p.id}`}>
                {p.title.zh}
              </option>
            ))}
          </select>
        </div>

        <div className="topbar-right">
          <button
            type="button"
            className="hud-btn"
            data-testid="search-trigger"
            onClick={onOpenSearch}
            title="搜索节点或命令 (Ctrl+K / /)"
          >
            <Search size={13} />
            <span>搜索</span>
          </button>

          <button
            type="button"
            className={`hud-btn ${editMode ? 'active' : ''}`}
            data-testid="edit-mode-toggle"
            aria-pressed={editMode}
            onClick={onToggleEditMode}
            title="图谱编辑器 (E)"
          >
            <Pencil size={13} />
            <span>编辑</span>
          </button>

          {onToggleRenderMode && (
            <button
              type="button"
              className={`hud-btn ${renderMode === '3d' ? 'active' : ''}`}
              data-testid="toggle-3d-view"
              aria-pressed={renderMode === '3d'}
              onClick={onToggleRenderMode}
              title="切换 2D 平面图 / 3D 实验星云"
            >
              {renderMode === '3d' ? <MapIcon size={13} /> : <Box size={13} />}
              <span>{renderMode === '3d' ? '切回 2D' : '3D 视图'}</span>
            </button>
          )}

          <select
            data-testid="theme-switcher"
            aria-label="主题切换"
            className="hud-select"
            value={theme}
            onChange={(e) => onSetTheme(e.target.value as ThemeMode)}
          >
            <option value="nebula">深空星云 Nebula</option>
            <option value="daylight">日光实验室 Daylight</option>
            <option value="minimal">极简专注 Minimal</option>
          </select>

          <select
            data-testid="quality-switcher"
            aria-label="画质预设"
            className="hud-select"
            value={quality}
            onChange={(e) => onSetQuality(e.target.value as QualityPreset)}
          >
            <option value="high">高画质 High</option>
            <option value="balanced">均衡 Balanced</option>
            <option value="eco">节能 Eco</option>
          </select>

          <button
            type="button"
            className="hud-btn"
            data-testid="backup-trigger"
            onClick={onOpenBackup}
            title="备份与导入"
          >
            <Archive size={13} />
            <span>备份</span>
          </button>

          <button
            type="button"
            className="hud-btn"
            data-testid="help-trigger"
            onClick={onOpenHelp}
            title="快捷键与帮助 (?)"
          >
            <HelpCircle size={13} />
          </button>

          <button
            type="button"
            className="hud-btn"
            data-testid="reset-view-btn"
            onClick={onResetView}
            title="重置星云视角"
          >
            <RotateCcw size={13} />
            <span>重置视角</span>
          </button>
        </div>
      </div>

      <div className="topbar-filters">
        <div className="domain-chips-row" role="group" aria-label="领域筛选">
          {activeDomains.length > 0 && (
            <button
              type="button"
              className="domain-chip"
              onClick={onClearDomains}
              title="清除领域筛选"
            >
              <Compass size={11} />
              <span>全部域</span>
            </button>
          )}
          {domains.map((domain) => {
            const active = activeDomains.includes(domain.id)
            return (
              <button
                key={domain.id}
                type="button"
                className="domain-chip"
                data-testid={`domain-chip-${domain.id}`}
                aria-pressed={active}
                data-active={active ? 'true' : 'false'}
                onClick={() => onToggleDomain(domain.id)}
                title={domain.name}
              >
                <span className="domain-dot" style={{ backgroundColor: domain.color }} />
                <span>{domain.name}</span>
              </button>
            )
          })}
        </div>

        <div className="lens-pills-row" role="group" aria-label="语义透镜">
          {LENS_OPTIONS.map((lens) => {
            const active = activeLens === lens.id
            return (
              <button
                key={lens.id}
                type="button"
                className="lens-pill"
                data-testid={`lens-pill-${lens.id}`}
                aria-pressed={active}
                data-active={active ? 'true' : 'false'}
                onClick={() => onSetLens(lens.id)}
              >
                {lens.label}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
