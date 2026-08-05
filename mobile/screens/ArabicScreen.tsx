import React, { useEffect, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { ARABIC_GROUPS } from '../lib/content'
import { loadKey, saveKey } from '../lib/store'
import { T } from '../lib/theme'

export default function ArabicScreen({ userId }: { userId: string }) {
  const [groupKey, setGroupKey] = useState(ARABIC_GROUPS[0].key)
  const [starred, setStarred] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadKey<Record<string, boolean>>(userId, 'alinoor_arabic_stars', {}).then(
      setStarred,
    )
  }, [userId])

  const group = ARABIC_GROUPS.find(g => g.key === groupKey)!

  const toggleStar = (ar: string) => {
    const next = { ...starred, [ar]: !starred[ar] }
    if (!next[ar]) delete next[ar]
    setStarred(next)
    saveKey(userId, 'alinoor_arabic_stars', next)
  }

  return (
    <ScrollView style={s.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.chipsRow}>
        {ARABIC_GROUPS.map(g => (
          <TouchableOpacity
            key={g.key}
            style={[s.chip, g.key === groupKey && s.chipActive]}
            onPress={() => setGroupKey(g.key)}>
            <Text style={[s.chipText, g.key === groupKey && s.chipTextActive]}>
              {g.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={s.blurb}>
        starter Qur’anic vocabulary · ★ {Object.keys(starred).length} starred
      </Text>

      <View style={s.grid}>
        {group.words.map(w => (
          <View key={w.ar} style={s.card}>
            <TouchableOpacity
              style={s.star}
              onPress={() => toggleStar(w.ar)}>
              <Text
                style={{
                  fontSize: 15,
                  color: starred[w.ar] ? T.warn : T.faint,
                }}>
                ★
              </Text>
            </TouchableOpacity>
            <Text style={s.arabic}>{w.ar}</Text>
            <Text style={s.tr}>{w.tr}</Text>
            <Text style={s.en}>{w.en}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: T.bg, paddingHorizontal: 16 },
  chipsRow: { marginTop: 16 },
  chip: {
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipActive: { backgroundColor: T.ink, borderColor: T.ink },
  chipText: { fontSize: 12, color: T.ink2 },
  chipTextActive: { color: T.bg, fontWeight: '600' },
  blurb: { fontSize: 12, color: T.mute, marginTop: 12 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  card: {
    width: '47.8%',
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.line,
    borderLeftWidth: 3,
    borderLeftColor: T.lineStrong,
    borderRadius: 14,
    padding: 14,
  },
  star: { position: 'absolute', top: 10, left: 12, zIndex: 1 },
  arabic: {
    fontSize: 30,
    lineHeight: 46,
    color: T.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  tr: { fontSize: 11, color: T.mute, marginTop: 6 },
  en: { fontSize: 13, color: T.ink2, marginTop: 2 },
})
