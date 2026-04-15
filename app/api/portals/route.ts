import { NextResponse } from 'next/server'
import { loadPortalGroups } from '@/lib/config'

export async function GET() {
  try {
    const groups = loadPortalGroups()
    return NextResponse.json({ groups })
  } catch (err) {
    return NextResponse.json({ error: 'Nie można załadować portali.' }, { status: 500 })
  }
}
