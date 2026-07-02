import { openDB, type IDBPDatabase } from 'idb'
import type { PitchSample } from '../audio/pitchStats'

export interface StoredClip {
  id: string
  label: string
  createdAt: number
  durationMs: number
  mimeType: string
  blob: Blob
  samples: PitchSample[]
}

const DB_NAME = 'euphonia-clips'
const STORE_NAME = 'clips'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDb(): Promise<IDBPDatabase> {
  dbPromise ??= openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' })
    },
  })
  return dbPromise
}

export async function saveClip(clip: StoredClip): Promise<void> {
  const db = await getDb()
  await db.put(STORE_NAME, clip)
}

export async function getAllClips(): Promise<StoredClip[]> {
  const db = await getDb()
  const clips: StoredClip[] = await db.getAll(STORE_NAME)
  return clips.sort((a, b) => b.createdAt - a.createdAt)
}

export async function deleteClip(id: string): Promise<void> {
  const db = await getDb()
  await db.delete(STORE_NAME, id)
}

export async function deleteAllClips(): Promise<void> {
  const db = await getDb()
  await db.clear(STORE_NAME)
}

export function totalStoredBytes(clips: StoredClip[]): number {
  return clips.reduce((sum, clip) => sum + clip.blob.size, 0)
}
