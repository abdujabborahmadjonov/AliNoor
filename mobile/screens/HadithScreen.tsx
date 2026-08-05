import React, { useState } from 'react'
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
import { BUKHARI_BOOKS } from '../lib/bukhari'
import { T } from '../lib/theme'

type Hadith = {
  number: number
  en: string
  ar: string
  grades: string
}

const BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions'

// One hadith is fetched only when its number is tapped (public-domain mirror).
const fetchOne = async (n: number): Promise<Hadith | null> => {
  try {
    const [en, ar] = await Promise.all([
      fetch(`${BASE}/eng-bukhari/${n}.json`).then(r => r.json()),
      fetch(`${BASE}/ara-bukhari/${n}.json`).then(r => r.json()),
    ])
    const e = en.hadiths?.[0]
    return {
      number: n,
      en: e?.text || '',
      ar: ar.hadiths?.[0]?.text || '',
      grades: (e?.grades || [])
        .map((g: any) => g.grade)
        .filter(Boolean)
        .join(', '),
    }
  } catch {
    return null
  }
}

export default function HadithScreen() {
  const [bookNo, setBookNo] = useState(1)
  const [pickBook, setPickBook] = useState(false)
  const [open, setOpen] = useState<number | null>(null)
  const [cache, setCache] = useState<Record<number, Hadith>>({})
  const [loading, setLoading] = useState(false)

  const book = BUKHARI_BOOKS.find(b => b.n === bookNo)!
  const total = BUKHARI_BOOKS[BUKHARI_BOOKS.length - 1].last
  const openData = open ? cache[open] : null

  const openOne = async (n: number) => {
    setOpen(n)
    if (cache[n]) return
    setLoading(true)
    const h = await fetchOne(n)
    if (h) setCache(c => ({ ...c, [n]: h }))
    setLoading(false)
  }

  return (
    <ScrollView style={s.wrap}>
      <TouchableOpacity style={s.bookSelect} onPress={() => setPickBook(true)}>
        <Text style={s.bookSelectText}>
          {book.n}. {book.title}
        </Text>
        <Text style={{ color: T.mute }}>▾</Text>
      </TouchableOpacity>

      <Text style={s.blurb}>
        Sahih al-Bukhari · hadith {book.first}–{book.last} — tap a number, only
        that hadith is loaded
      </Text>

      <View style={s.numGrid}>
        {Array.from(
          { length: book.last - book.first + 1 },
          (_, i) => book.first + i,
        ).map(n => (
          <TouchableOpacity
            key={n}
            style={[
              s.numChip,
              open === n && s.numChipActive,
              cache[n] && open !== n ? s.numChipSeen : null,
            ]}
            onPress={() => openOne(n)}>
            <Text style={[s.numText, open === n && s.numTextActive]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {open && (
        <View style={s.card}>
          {loading && !openData ? (
            <ActivityIndicator color={T.ink} style={{ marginVertical: 20 }} />
          ) : openData ? (
            <>
              <View style={s.headRow}>
                <Text style={s.ref}>
                  BUKHARI · {openData.number}
                  {openData.grades ? `  — ${openData.grades}` : ''}
                </Text>
                <View style={s.navBtns}>
                  <TouchableOpacity
                    disabled={open <= 1}
                    onPress={() => openOne(open - 1)}
                    style={s.navBtn}>
                    <Text style={s.navBtnText}>←</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={open >= total}
                    onPress={() => openOne(open + 1)}
                    style={s.navBtn}>
                    <Text style={s.navBtnText}>→</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={s.english}>{openData.en}</Text>
              <Text style={s.arabic}>{openData.ar}</Text>
            </>
          ) : (
            <Text style={s.blurb}>Couldn’t load — tap again to retry.</Text>
          )}
        </View>
      )}
      <View style={{ height: 30 }} />

      <Modal visible={pickBook} animationType="slide">
        <View style={s.pickerWrap}>
          <View style={s.pickerHead}>
            <Text style={s.pickerTitle}>Sahih al-Bukhari · 97 books</Text>
            <TouchableOpacity onPress={() => setPickBook(false)}>
              <Text style={s.pickerClose}>Close</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={BUKHARI_BOOKS}
            keyExtractor={b => String(b.n)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.pickerRow}
                onPress={() => {
                  setBookNo(item.n)
                  setOpen(null)
                  setPickBook(false)
                }}>
                <Text style={s.pickerNum}>{item.n}</Text>
                <Text style={s.pickerName}>{item.title}</Text>
                <Text style={s.pickerCount}>{item.last - item.first + 1}</Text>
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
  bookSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginTop: 16,
  },
  bookSelectText: { fontSize: 14, color: T.ink, fontWeight: '500', flex: 1 },
  blurb: { fontSize: 12, color: T.mute, marginTop: 12 },
  numGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  numChip: {
    minWidth: 52,
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
  card: {
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.line,
    borderLeftWidth: 3,
    borderLeftColor: T.catEdu,
    borderRadius: 14,
    padding: 18,
    marginTop: 16,
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ref: { fontSize: 10, letterSpacing: 1.2, color: T.mute, flex: 1 },
  navBtns: { flexDirection: 'row', gap: 6 },
  navBtn: {
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  navBtnText: { color: T.ink3, fontSize: 13 },
  english: { fontSize: 14, lineHeight: 22, color: T.ink2 },
  arabic: {
    fontSize: 18,
    lineHeight: 36,
    color: T.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: 14,
  },
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
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderColor: T.line,
    gap: 12,
  },
  pickerNum: { width: 30, fontSize: 12, color: T.mute },
  pickerName: { flex: 1, fontSize: 14, color: T.ink },
  pickerCount: { fontSize: 11, color: T.faint },
})
