import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

export interface Portal {
  name: string
  url: string
  search_url: string
  enabled: boolean
}

export interface PortalGroup {
  name: string
  portals: Portal[]
}

export function loadPortalGroups(): PortalGroup[] {
  const filePath = path.join(process.cwd(), 'portals.yml')
  const content = fs.readFileSync(filePath, 'utf-8')
  const data = yaml.load(content) as { groups: PortalGroup[] }
  return data.groups
}

let _portalsCache: Portal[] | null = null

export function loadPortals(): Portal[] {
  if (_portalsCache) return _portalsCache
  _portalsCache = loadPortalGroups().flatMap((g) => g.portals)
  return _portalsCache
}
