import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { QURAN_THEMES } from '../lib/content'
import { T } from '../lib/theme'

type Ayah = {
  ref: string
  surahName: string
  ar: string
  en: string
}

type SurahInfo = {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: string
}

const API = 'https://api.alquran.cloud/v1'
// Uthmani Arabic + the public-domain Pickthall translation.
const EDITIONS = 'quran-uthmani,en.pickthall'

const fetchAyah = async (ref: string): Promise<Ayah | null> => {
  try {
    const res = await fetch(`${API}/ayah/${ref}/editions/${EDITIONS}`)
    const json = await res.json()
    const [ar, en] = json.data
    return { ref, surahName: ar.surah.englishName, ar: ar.text, en: en.text }
  } catch {
    return null
  }
}

export default function QuranScreen() {
  const [mode, setMode] = useState<'themes' | 'surahs'>('themes')

  // themes
  const [themeKey, setThemeKey] = useState(QURAN_THEMES[0].key)
  const [ayat, setAyat] = useState<Ayah[]>([])
  const [themeLoading, setThemeLoading] = useState(true)

  // surahs
  const [surahs, setSurahs] = useState<SurahInfo[]>([])
  const [surahNo, setSurahNo] = useState(1)
  const [pickSurah, setPickSurah] = useState(false)
  const [openAyah, setOpenAyah] = useState<number | null>(null)
  const [cache, setCache] = useState<Record<string, Ayah>>({})
  const [ayahLoading, setAyahLoading] = useState(false)

  const theme = QURAN_THEMES.find(t => t.key === themeKey)!
  const surah = surahs.find(x => x.number === surahNo)
  const openData = openAyah ? cache[`${surahNo}:${openAyah}`] : null

  useEffect(() => {
    let alive = true
    setThemeLoading(true)
    Promise.all(theme.refs.map(fetchAyah)).then(rows => {
      if (!alive) return
      setAyat(rows.filter(Boolean) as Ayah[])
      setThemeLoading(false)
    })
    return () => {
      alive = false
    }
  }, [themeKey, theme.refs])

  useEffect(() => {
    fetch(`${API}/surah`)
      .then(r => r.json())
      .then(j => setSurahs(j.data || []))
      .catch(() => {})
  }, [])

  const openOne = async (n: number) => {
    const ref = `${surahNo}:${n}`
    setOpenAyah(n)
    if (cache[ref]) return
    setAyahLoading(true)
    const a = await fetchAyah(ref)
    if (a) setCache(c => ({ ...c, [ref]: a }))
    setAyahLoading(false)
  }

  return (
    <ScrollView style={s.wrap}>
      {/* mode switch */}
      <View style={s.modeRow}>
        {(
          [
            ['themes', 'Ayat to live by'],
            ['surahs', 'All surahs'],
          ] as const
        ).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[s.modeBtn, mode === key && s.modeBtnActive]}
            onPress={() => setMode(key)}>
            <Text style={[s.modeText, mode === key && s.modeTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'themes' && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.chipsRow}>
            {QURAN_THEMES.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[s.chip, t.key === themeKey && s.chipActive]}
                onPress={() => setThemeKey(t.key)}>
                <Text
                  style={[s.chipText, t.key === themeKey && s.chipTextActive]}>
                  {t.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={s.blurb}>{theme.blurb}</Text>

          {themeLoading ? (
            <ActivityIndicator color={T.ink} style={{ marginTop: 40 }} />
          ) : (
            ayat.map(a => (
              <View key={a.ref} style={s.ayahCard}>
                <Text style={s.ayahRef}>
                  {a.ref} · {a.surahName}
                </Text>
                <Text style={s.arabic}>{a.ar}</Text>
                <Text style={s.translation}>{a.en}</Text>
              </View>
            ))
          )}
        </>
      )}

      {mode === 'surahs' && (
        <>
          <TouchableOpacity
            style={s.surahSelect}
            onPress={() => setPickSurah(true)}>
            <Text style={s.surahSelectText}>
              {surah
                ? `${surah.number}. ${surah.englishName} · ${surah.numberOfAyahs} ayat`
                : 'Loading surahs…'}
            </Text>
            <Text style={{ color: T.mute }}>▾</Text>
          </TouchableOpacity>

          {surah && (
            <Text style={s.blurb}>
              {surah.englishNameTranslation} · {surah.revelationType} — tap an
              ayah number, only that ayah is loaded
            </Text>
          )}

          <View style={s.numGrid}>
            {surah &&
              Array.from({ length: surah.numberOfAyahs }, (_, i) => i + 1).map(
                n => (
                  <TouchableOpacity
                    key={n}
                    style={[
                      s.numChip,
                      openAyah === n && s.numChipActive,
                      cache[`${surahNo}:${n}`] && openAyah !== n
                        ? s.numChipSeen
                        : null,
                    ]}
                    onPress={() => openOne(n)}>
                    <Text
                      style={[
                        s.numText,
                        openAyah === n && s.numTextActive,
                      ]}>
                      {n}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
          </View>

          {openAyah && (
            <View style={s.ayahCard}>
              {ayahLoading && !openData ? (
                <ActivityIndicator color={T.ink} style={{ marginVertical: 20 }} />
              ) : openData ? (
                <>
                  <View style={s.ayahHeadRow}>
                    <Text style={s.ayahRef}>
                      {openData.ref} · {openData.surahName}
                    </Text>
                    <View style={s.navBtns}>
                      <TouchableOpacity
                        disabled={openAyah <= 1}
                        onPress={() => openOne(openAyah - 1)}
                        style={s.navBtn}>
                        <Text style={s.navBtnText}>←</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={!surah || openAyah >= surah.numberOfAyahs}
                        onPress={() => openOne(openAyah + 1)}
                        style={s.navBtn}>
                        <Text style={s.navBtnText}>→</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={s.arabic}>
                    {openData.ar} ﴿{openAyah}﴾
                  </Text>
                  <Text style={s.translation}>{openData.en}</Text>
                </>
              ) : (
                <Text style={s.blurb}>Couldn’t load — tap again to retry.</Text>
              )}
            </View>
          )}
        </>
      )}
      <View style={{ height: 30 }} />

      {/* surah picker */}
      <Modal visible={pickSurah} animationType="slide">
        <View style={s.pickerWrap}>
          <View style={s.pickerHead}>
            <Text style={s.pickerTitle}>Choose a surah</Text>
            <TouchableOpacity onPress={() => setPickSurah(false)}>
              <Text style={s.pickerClose}>Close</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={surahs}
            keyExtractor={x => String(x.number)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.pickerRow}
                onPress={() => {
                  setSurahNo(item.number)
                  setOpenAyah(null)
                  setPickSurah(false)
                }}>
                <Text style={s.pickerNum}>{item.number}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.pickerName}>{item.englishName}</Text>
                  <Text style={s.pickerSub}>
                    {item.englishNameTranslation} · {item.numberOfAyahs} ayat
                  </Text>
                </View>
                <Text style={s.pickerArabic}>{item.name.replace('سُورَةُ ', '')}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: T.bg, paddingHorizontal: 16 },
  modeRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  modeBtn: {
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  modeBtnActive: { backgroundColor: T.ink, borderColor: T.ink },
  modeText: { fontSize: 13, color: T.ink2, fontWeight: '500' },
  modeTextActive: { color: T.bg, fontWeight: '600' },
  chipsRow: { marginTop: 14 },
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
  ayahCard: {
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.line,
    borderLeftWidth: 3,
    borderLeftColor: T.ember,
    borderRadius: 14,
    padding: 18,
    marginTop: 14,
  },
  ayahHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ayahRef: { fontSize: 11, color: T.mute, letterSpacing: 0.6 },
  arabic: {
    fontSize: 26,
    lineHeight: 52,
    color: T.ink,
    textAlign: 'right',
    marginTop: 14,
    writingDirection: 'rtl',
  },
  translation: { fontSize: 14, lineHeight: 22, color: T.ink2, marginTop: 12 },
  surahSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginTop: 14,
  },
  surahSelectText: { fontSize: 14, color: T.ink, fontWeight: '500' },
  numGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 14,
  },
  numChip: {
    minWidth: 40,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
  },
  numChipActive: { backgroundColor: T.ink, borderColor: T.ink },
  numChipSeen: { borderColor: T.lineStrong },
  numText: { fontSize: 12, color: T.ink3 },
  numTextActive: { color: T.bg, fontWeight: '700' },
  navBtns: { flexDirection: 'row', gap: 6 },
  navBtn: {
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  navBtnText: { color: T.ink3, fontSize: 13 },
  pickerWrap: { flex: 1, backgroundColor: T.bg, paddingTop: 54 },
  pickerHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: T.line,
  },
  pickerTitle: { fontSize: 16, fontWeight: '600', color: T.ink },
  pickerClose: { fontSize: 14, color: T.ember },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: T.line,
    gap: 12,
  },
  pickerNum: { width: 30, fontSize: 12, color: T.mute },
  pickerName: { fontSize: 15, fontWeight: '500', color: T.ink },
  pickerSub: { fontSize: 11, color: T.mute, marginTop: 1 },
  pickerArabic: { fontSize: 18, color: T.ink3 },
})
