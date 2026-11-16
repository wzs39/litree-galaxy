/**
 * scripts/enrich-leaf-resources.mjs
 *
 * 为 cs-math.json 与 dev-mini.json 中全部未填写资料的最小知识点 (leaf) 与分支/章节 (branch)
 * 批量补充：
 * 1. summary：基于所属单元、章节与中英文标题的清晰核心概览
 * 2. resources：针对该具体知识点的多来源精准检索与百科/课程直达资料（3~4 条 https:// 链接）
 * 3. estimatedMinutes：默认学习预估时长（leaf 核心 25 分钟 / 普通 15 分钟）
 *
 * 不改变节点、边或路线数量，严格满足 schema.ts (pack-v1/pack-v2) 校验契约。
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))

function enc(s) {
  return encodeURIComponent(String(s ?? '').trim())
}

function buildTargetedResources(node, owningUnitTitleZh, domainName, domainId) {
  const titleZh = node.title?.zh?.trim() || node.id
  const titleEn = node.title?.en?.trim() || ''
  const queryEn = titleEn || titleZh
  const queryZh = titleZh
  const contextQueryZh =
    owningUnitTitleZh && owningUnitTitleZh !== titleZh
      ? `${owningUnitTitleZh} ${titleZh}`
      : titleZh

  const items = [
    {
      title: `中文百科 · ${titleZh}`,
      url: `https://zh.wikipedia.org/wiki/Special:Search?search=${enc(queryZh)}`,
      lang: 'zh'
    },
    {
      title: `Wikipedia · ${queryEn}`,
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${enc(queryEn)}`,
      lang: 'en'
    }
  ]

  if (domainId === 'M1' || domainId === 'M2' || domainId === 'M3') {
    items.push({
      title: `Wolfram MathWorld · ${queryEn}`,
      url: `https://mathworld.wolfram.com/search/?query=${enc(queryEn)}`,
      lang: 'en'
    })
    items.push({
      title: `课程精讲检索 · ${titleZh}`,
      url: `https://search.bilibili.com/all?keyword=${enc(contextQueryZh)}`,
      lang: 'zh'
    })
  } else if (domainId === 'A' || domainId === 'X') {
    items.push({
      title: `arXiv 前沿论文检索 · ${queryEn}`,
      url: `https://arxiv.org/search/?query=${enc(queryEn)}&searchtype=all`,
      lang: 'en'
    })
    items.push({
      title: `课程与实践解析 · ${titleZh}`,
      url: `https://search.bilibili.com/all?keyword=${enc(contextQueryZh)}`,
      lang: 'zh'
    })
  } else if (domainId === 'F' || domainId === 'S') {
    items.push({
      title: `MIT OpenCourseWare · ${queryEn}`,
      url: `https://ocw.mit.edu/search/?q=${enc(queryEn)}`,
      lang: 'en'
    })
    items.push({
      title: `专题精讲检索 · ${titleZh}`,
      url: `https://search.bilibili.com/all?keyword=${enc(contextQueryZh)}`,
      lang: 'zh'
    })
  } else {
    items.push({
      title: `GeeksforGeeks · ${queryEn}`,
      url: `https://www.geeksforgeeks.org/?s=${enc(queryEn)}`,
      lang: 'en'
    })
    items.push({
      title: `实战课程检索 · ${titleZh} (${domainName || 'CS'})`,
      url: `https://search.bilibili.com/all?keyword=${enc(contextQueryZh)}`,
      lang: 'zh'
    })
  }

  return items
}

function enrichPackFile(relPath) {
  const fullPath = join(ROOT, relPath)
  const pack = JSON.parse(readFileSync(fullPath, 'utf-8'))

  const byId = new Map()
  const childrenByParent = new Map()
  for (const node of pack.nodes) {
    byId.set(node.id, node)
    const p = node.parent ?? node.parentId ?? null
    if (p) {
      let arr = childrenByParent.get(p)
      if (!arr) {
        arr = []
        childrenByParent.set(p, arr)
      }
      arr.push(node)
    }
  }

  const domainMap = new Map(pack.domains.map((d) => [d.id, d.name]))

  function resolveOwningUnit(node) {
    let cur = node
    const visited = new Set()
    while (cur && !visited.has(cur.id)) {
      visited.add(cur.id)
      if (cur.kind === 'unit') return cur
      const pId = cur.parent ?? cur.parentId ?? null
      cur = pId ? byId.get(pId) : undefined
    }
    return undefined
  }

  let updatedLeaves = 0
  let updatedBranches = 0

  for (const node of pack.nodes) {
    const domainId = node.domain ?? node.domainId ?? 'M1'
    const domainName = domainMap.get(domainId) ?? domainId
    const unitNode = resolveOwningUnit(node)
    const unitTitleZh = unitNode?.title?.zh ?? ''
    const parentId = node.parent ?? node.parentId ?? null
    const parentNode = parentId ? byId.get(parentId) : undefined
    const parentTitleZh = parentNode?.title?.zh ?? ''
    const childCount = childrenByParent.get(node.id)?.length ?? 0

    if (node.kind === 'leaf') {
      let touched = false
      if (!node.summary || !node.summary.trim()) {
        const chapterHint =
          parentNode && parentNode.id !== unitNode?.id ? `「${parentTitleZh}」` : ''
        const unitHint = unitTitleZh ? `所属单元「${unitTitleZh}」${chapterHint}核心知识点` : '核心知识点'
        const enHint = node.title?.en ? ` (${node.title.en})` : ''
        node.summary = `${unitHint}：掌握「${node.title.zh}」${enHint}的核心概念、关键性质与在${domainName}中的典型应用。`
        touched = true
      }
      if (!Array.isArray(node.resources) || node.resources.length === 0) {
        node.resources = buildTargetedResources(node, unitTitleZh, domainName, domainId)
        touched = true
      }
      if (typeof node.estimatedMinutes !== 'number') {
        node.estimatedMinutes = node.core ? 25 : 15
        touched = true
      }
      if (touched) updatedLeaves++
    } else if (node.kind === 'branch') {
      let touched = false
      if (!node.summary || !node.summary.trim()) {
        const scopeHint = unitTitleZh ? `所属「${unitTitleZh}」` : `${domainName}学科`
        node.summary = `${scopeHint}专题分组「${node.title.zh}」，下辖 ${childCount} 个子模块/知识点。`
        touched = true
      }
      if (!Array.isArray(node.resources) || node.resources.length === 0) {
        node.resources = buildTargetedResources(node, unitTitleZh, domainName, domainId).slice(0, 2)
        touched = true
      }
      if (touched) updatedBranches++
    }
  }

  writeFileSync(fullPath, JSON.stringify(pack), 'utf-8')
  console.log(
    `[enrich] ${relPath}: updatedLeaves=${updatedLeaves}, updatedBranches=${updatedBranches}`
  )
}

enrichPackFile('resources/packs/cs-math.json')
enrichPackFile('resources/packs/dev-mini.json')
