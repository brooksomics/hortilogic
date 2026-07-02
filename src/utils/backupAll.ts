/**
 * Full-app backup: export/import every layout, profile, and stash in one JSON
 * file, so a browser site-data clear is recoverable (hortilogic-a0h.4).
 */

import { z } from 'zod'
import {
  LayoutStorageSchema,
  ProfileStorageSchema,
  StashStorageSchema,
} from '../schemas/garden'
import { readLayoutStorage, readProfileStorage } from './storageHelpers'

const LAYOUTS_KEY = 'hortilogic:layouts'
const PROFILES_KEY = 'hortilogic:profiles'
const STASH_PREFIX = 'hortilogic_stash_'

export const BackupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  layouts: LayoutStorageSchema.nullable(),
  profiles: ProfileStorageSchema.nullable(),
  stashes: z.record(z.string(), StashStorageSchema),
})

export type FullBackup = z.infer<typeof BackupSchema>

export type ImportAllResult = { ok: true } | { ok: false; error: string }

function parseJSON(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function readStashes(): FullBackup['stashes'] {
  const stashes: FullBackup['stashes'] = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(STASH_PREFIX)) continue
    const parsed = StashStorageSchema.safeParse(parseJSON(localStorage.getItem(key) ?? 'null'))
    if (parsed.success) stashes[key.slice(STASH_PREFIX.length)] = parsed.data
  }
  return stashes
}

/** Snapshot all persisted app data from localStorage. */
export function exportAll(): FullBackup {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    layouts: readLayoutStorage(LAYOUTS_KEY),
    profiles: readProfileStorage(PROFILES_KEY),
    stashes: readStashes(),
  }
}

/** Validate a parsed backup file and restore it into localStorage. */
export function importAll(data: unknown): ImportAllResult {
  const parsed = BackupSchema.safeParse(data)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { ok: false, error: `Invalid backup file: ${first?.message ?? 'unknown error'}` }
  }

  const { layouts, profiles, stashes } = parsed.data
  if (layouts) localStorage.setItem(LAYOUTS_KEY, JSON.stringify(layouts))
  if (profiles) localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  for (const [layoutId, stash] of Object.entries(stashes)) {
    localStorage.setItem(`${STASH_PREFIX}${layoutId}`, JSON.stringify(stash))
  }
  return { ok: true }
}

/** Trigger a browser download of the backup as a JSON file. */
export function downloadBackup(backup: FullBackup): void {
  const datePart = backup.exportedAt.split('T')[0] ?? 'export'
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `hortilogic_backup_${datePart}.json`
  link.click()
  URL.revokeObjectURL(url)
}
