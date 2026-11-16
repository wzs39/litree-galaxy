export type NodeKind = 'branch' | 'unit' | 'leaf'
export type EdgeType = 'hard' | 'soft' | 'related'

export interface LocalizedTitle {
  zh: string
  en?: string
}

export interface ResourceItem {
  id?: string
  title: string
  url: string
  lang?: 'zh' | 'en'
  addedAt?: string
}

export interface CustomResource {
  id: string
  title: string
  url: string
  lang?: 'zh' | 'en'
  addedAt: string
}

export interface DomainDef {
  id: string
  name: string
  color: string
}

export interface KnowledgeNode {
  id: string
  parentId: string | null
  kind: NodeKind
  title: LocalizedTitle
  domainId: string
  core?: boolean
  summary?: string
  outcome?: string
  caution?: string
  resources?: ResourceItem[]
  exercises?: string[]
  evidence?: string
  tags?: string[]
  estimatedMinutes?: number
  position3D?: [number, number, number]
  layoutOverride?: { x: number; y: number }
}

export interface KnowledgeEdge {
  id: string
  from: string
  to: string
  type: EdgeType
  reason?: string
}

export interface LearningRoute {
  id: string
  name: string
  note?: string
  ids: string[]
}

export interface PackDocument {
  schema: 'litree/pack-v2'
  id: string
  version: number
  title: LocalizedTitle
  description?: string
  source: 'builtin' | 'custom'
  domains: DomainDef[]
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
  routes: LearningRoute[]
}

export interface PackMeta {
  id: string
  title: LocalizedTitle
  description?: string
  file?: string
  source: 'builtin' | 'custom'
  nodeCount?: number
}

// Legacy litree/pack-v1 shapes (preserved for lossless v1 -> v2 adaptation)
export interface PackNodeV1 {
  id: string
  parent: string | null
  kind: NodeKind
  title: LocalizedTitle
  domain: string
  core?: boolean
  summary?: string
  outcome?: string
  caution?: string
  resources?: ResourceItem[]
  exercises?: string[]
  evidence?: string
  tags?: string[]
  estimatedMinutes?: number
  position3D?: [number, number, number]
  layoutOverride?: { x: number; y: number }
}

export interface PackEdgeV1 {
  from: string
  to: string
  type: 'hard' | 'soft'
  reason?: string
}

export interface PackRouteV1 {
  id?: string
  name: string
  note?: string
  ids: string[]
}

export interface PackV1 {
  schema: 'litree/pack-v1'
  id: string
  version?: number
  title: LocalizedTitle
  description?: string
  domains: DomainDef[]
  nodes: PackNodeV1[]
  edges: PackEdgeV1[]
  routes?: PackRouteV1[]
}

// Legacy litree/progress-v1 shape (preserved for lossless migration)
export interface ProgressV1 {
  schema?: 'litree/progress-v1'
  packId: string
  lit: Record<string, { at: string; note?: string } | string | boolean>
  learning: Record<string, string>
  xp: number
  history: { id: string; at: string; xp: number }[]
}

// Progress v2 & Study State
export type UserNodeStatus = 'unstarted' | 'queued' | 'learning' | 'lit'
export type MasteryLevel = 0 | 1 | 2 | 3
export type LeitnerBox = 0 | 1 | 2 | 3 | 4 | 5

export interface UserNodeProgress {
  status: UserNodeStatus
  litAt?: string
  litMode?: 'gated' | 'free'
  startedAt?: string
  lastReviewedAt?: string
  nextReviewAt?: string
  reviewCount: number
  leitnerBox: LeitnerBox
  mastery: MasteryLevel
  noteMarkdown?: string
  customResources?: CustomResource[]
  tags?: string[]
  pinned?: boolean
  completedExercises?: number[]
}

export interface DailyActivityEntry {
  lit: number
  reviewed: number
  focusMinutes: number
  xp: number
}

export interface StudySession {
  id: string
  nodeId: string
  startedAt: string
  durationMinutes: number
  mode: 'focus' | 'review' | 'light'
}

export interface ProgressHistoryItem {
  id: string
  at: string
  xp: number
  action: 'light' | 'unlight' | 'review' | 'focus'
}

export interface PackProgress {
  schema: 'litree/progress-v2'
  packId: string
  nodes: Record<string, UserNodeProgress>
  xp: number
  streakDays: number
  lastStudyDate?: string // YYYY-MM-DD
  dailyActivity: Record<string, DailyActivityEntry>
  sessions: StudySession[]
  history: ProgressHistoryItem[]
  activeRouteId?: string
  lastFocusedNodeId?: string
}

export interface PackCurationOverlay {
  schema?: 'litree/overlay-v1'
  packId: string
  updatedAt: string
  addedNodes: KnowledgeNode[]
  updatedNodes: Record<string, Partial<Omit<KnowledgeNode, 'id'>>>
  deletedNodeIds: string[]
  addedEdges: KnowledgeEdge[]
  deletedEdgeIds: string[]
  addedRoutes?: LearningRoute[]
  updatedRoutes?: Record<string, Partial<Omit<LearningRoute, 'id'>>>
  deletedRouteIds?: string[]
}

export type ThemeMode = 'nebula' | 'daylight' | 'minimal'
export type QualityPreset = 'high' | 'balanced' | 'eco'
export type ViewLevel = 'galaxy' | 'branch' | 'unit'
export type ActiveLens = 'all' | 'actionable' | 'core' | 'route' | 'review_due' | 'bookmarked'

export interface UserSettings {
  activePackId: string
  theme: ThemeMode
  quality: QualityPreset
  onboardingDone?: boolean
}

export interface BackupV2 {
  schema: 'litree/backup-v2'
  exportedAt: string
  progressByPack: Record<string, PackProgress>
  curationByPack: Record<string, PackCurationOverlay>
  customPacks: PackDocument[]
  settings?: Partial<UserSettings>
}

export type NodeVisualState =
  | 'locked'
  | 'available'
  | 'queued'
  | 'learning'
  | 'lit'
  | 'review_due'

export interface GraphIndex {
  pack: PackDocument
  nodesById: ReadonlyMap<string, KnowledgeNode>
  edgesById: ReadonlyMap<string, KnowledgeEdge>
  childrenByParent: ReadonlyMap<string | null, readonly KnowledgeNode[]>
  hardPrereqsByNode: ReadonlyMap<string, readonly KnowledgeEdge[]>
  softPrereqsByNode: ReadonlyMap<string, readonly KnowledgeEdge[]>
  hardDependentsByNode: ReadonlyMap<string, readonly KnowledgeEdge[]>
  softDependentsByNode: ReadonlyMap<string, readonly KnowledgeEdge[]>
  relatedEdgesByNode: ReadonlyMap<string, readonly KnowledgeEdge[]>
  edgeReasons: ReadonlyMap<string, readonly KnowledgeEdge[]>
  edgesBetween(from: string, to: string): readonly KnowledgeEdge[]
  owningUnit(nodeId: string): string | undefined
  owningBranch(nodeId: string): string | undefined
  depthOf(nodeId: string): number
  dagDepthOf(unitId: string): number
  leavesOf(id: string): readonly KnowledgeNode[]
  unitsOf(id: string): readonly KnowledgeNode[]
  chaptersOf(unitId: string): readonly KnowledgeNode[]
  hardPrereqsOf(unitId: string): readonly KnowledgeNode[]
  softPrereqsOf(unitId: string): readonly KnowledgeNode[]
  hardDependentsOf(unitId: string): readonly KnowledgeNode[]
  topoOrder(): readonly KnowledgeNode[]
}

export interface NebulaVisualSnapshot {
  nodeStates: ReadonlyMap<string, NodeVisualState>
  selectedId: string | null
  hoveredId: string | null
  activeDomains: readonly string[]
  activeLens: ActiveLens
  activeRouteUnitIds?: readonly string[]
  pathTraceHighlight?: {
    nodeIds: readonly string[]
    edgeIds: readonly string[]
  } | null
  focusTimerNodeId: string | null
  cycleConflictEdgeIds: readonly string[]
  bookmarkedIds?: ReadonlySet<string>
}

export interface LitreeTelemetry {
  ready: boolean
  rendererMode: 'webgl2' | 'webgl1' | 'fallback-2d'
  glRenderer: string
  frameCount: number
  nodeCount: number
  edgeCount: number
  camera: {
    pos: [number, number, number]
    target: [number, number, number]
    distance: number
  }
  activeView: ViewLevel | string
  selectedId: string | null
  hoveredId: string | null
  isFlying: boolean
  lastBurstAt: number
  projectNodeToScreen: (id: string) => { x: number; y: number; inView: boolean } | null
}

export interface FocusTimerState {
  nodeId: string | null
  remainingSec: number
  totalSec: number
  running: boolean
}

export interface CreateNodeInput {
  id?: string
  parentId: string | null
  kind: NodeKind
  title: LocalizedTitle
  domainId: string
  core?: boolean
  summary?: string
  outcome?: string
  caution?: string
  resources?: ResourceItem[]
  exercises?: string[]
  evidence?: string
  tags?: string[]
  estimatedMinutes?: number
}

export interface CreateEdgeInput {
  id?: string
  from: string
  to: string
  type: EdgeType
  reason?: string
}

export type MutationResult<T = void> =
  | { ok: true; data: T; warnings?: string[] }
  | { ok: false; error: string; cyclePath?: string[]; cycleEdgeIds?: string[] }

export interface AppState {
  // Data
  packs: PackMeta[]
  activePackId: string
  pack: PackDocument | null
  basePack: PackDocument | null
  curation: PackCurationOverlay | null
  progress: PackProgress | null
  index: GraphIndex | null
  loading: boolean
  error: string | null
  lastNotice: string | null

  // View / Selection
  viewLevel: ViewLevel
  focusClusterId: string | null
  clusterStack: string[]
  selectedId: string | null
  hoveredId: string | null
  activeDomains: string[]
  activeLens: ActiveLens
  activeRouteId: string | null
  editMode: boolean
  cycleConflictEdgeIds: string[]
  theme: ThemeMode
  quality: QualityPreset
  focusTimer: FocusTimerState

  // Core Actions (PROJECT.md § Interface Contracts)
  init(): Promise<void>
  switchPack(packId: string): Promise<boolean>
  selectNode(id: string | null): void
  hoverNode(id: string | null): void
  enterCluster(id: string): void
  stepBack(): void
  lightNode(id: string, opts?: { force?: boolean }): Promise<{ unlockedIds: string[] }>
  unlightNode(id: string): Promise<void>
  setNodeStatus(id: string, status: UserNodeStatus): Promise<void>
  batchLightUnit(unitId: string, force?: boolean): Promise<{ unlockedIds: string[]; litCount: number }>
  batchUnlightUnit(unitId: string): Promise<void>
  updateNote(id: string, md: string): void
  addCustomResource(id: string, res: { title: string; url: string; lang?: 'zh' | 'en'; id?: string }): MutationResult<CustomResource>
  removeCustomResource(id: string, resId: string): void
  toggleTag(id: string, tag: string): void
  togglePin(id: string): void
  toggleExercise(id: string, idx: number): void
  gradeReview(id: string, remembered: boolean): void
  startFocus(id: string, minutes?: number): void
  pauseFocus(): void
  completeFocusSession(): Promise<void>
  createNode(input: CreateNodeInput): Promise<MutationResult<KnowledgeNode>>
  updateNode(id: string, patch: Partial<Omit<KnowledgeNode, 'id'>>): Promise<MutationResult<KnowledgeNode>>
  deleteNode(id: string): Promise<MutationResult<string[]>>
  createEdge(input: CreateEdgeInput): Promise<MutationResult<KnowledgeEdge>>
  deleteEdge(id: string): Promise<MutationResult<void>>
  exportBackup(): Promise<string>
  importBackup(json: string, mode?: 'merge' | 'replace'): Promise<MutationResult<{ packsImported: number }>>
  exportMarkdownJournal(): string
  resetCuration(): Promise<void>

  // Supporting View / Filter / Utility Actions
  setActiveDomains(domains: string[]): void
  setActiveLens(lens: ActiveLens): void
  setActiveRouteId(routeId: string | null): void
  setEditMode(enabled: boolean): void
  setTheme(theme: ThemeMode): void
  setQuality(quality: QualityPreset): void
  tickFocus(seconds?: number): void
  flushSave(): Promise<void>
  cleanOrphans(): number
  getNodeVisualState(id: string, nowMs?: number): NodeVisualState
  getLitLeavesSet(): Set<string>
}
