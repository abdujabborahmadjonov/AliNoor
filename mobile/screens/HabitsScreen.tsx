import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { findCity } from '../lib/cities'
import { dateInTz } from '../lib/prayer'
import {
  AppSettings,
  DEFAULT_SETTINGS,
  loadKey,
  saveKey,
  uid,
} from '../lib/store'
import { T } from '../lib/theme'

type Category = 'spiritual' | 'physical' | 'social' | 'financial' | 'educational'

type Habit = {
  id: string
  name: string
  category: Category
  createdAt: string
}

type HabitLogs = Record<string, Record<string, boolean>>

const CATEGORIES: Category[] = [
  'spiritual',
  'physical',
  'social',
  'financial',
  'educational',
]

const CAT_COLOR: Record<Category, string> = {
  spiritual: T.warn,
  physical: T.good,
  social: T.catSocial,
  financial: T.catFin,
  educational: T.catEdu,
}

const GRID_DAYS = 60

const addDays = (ymd: string, days: number) => {
  const [y, m, d] = ymd.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + days))
  return dt.toISOString().slice(0, 10)
}

export default function HabitsScreen({ userId }: { userId: string }) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLogs>({})
  const [today, setToday] = useState('')
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('spiritual')
  const [refreshing, setRefreshing] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const alive = useRef(true)

  const load = useCallback(async () => {
    const [st, h, l] = await Promise.all([
      loadKey<AppSettings>(userId, 'alinoor_settings', DEFAULT_SETTINGS),
      loadKey<Habit[]>(userId, 'alinoor_habits', []),
      loadKey<HabitLogs>(userId, 'alinoor_habit_logs', {}),
    ])
    if (!alive.current) return
    if (st.failed || h.failed || l.failed) {
      setLoadFailed(true)
      return
    }
    setLoadFailed(false)
    setToday(dateInTz(findCity(st.value.city || 'Tashkent').tz))
    setHabits(h.value)
    setLogs(l.value)
  }, [userId])

  useEffect(() => {
    alive.current = true
    load()
    return () => {
      alive.current = false
    }
  }, [load])

  const days = useMemo(() => {
    if (!today) return []
    return Array.from({ length: GRID_DAYS }, (_, i) =>
      addDays(today, i - (GRID_DAYS - 1)),
    )
  }, [today])

  const persistHabits = (next: Habit[]) => {
    if (loadFailed) return
    setHabits(next)
    saveKey(userId, 'alinoor_habits', next)
  }
  const persistLogs = (next: HabitLogs) => {
    if (loadFailed) return
    setLogs(next)
    saveKey(userId, 'alinoor_habit_logs', next)
  }

  const addHabit = () => {
    if (!name.trim()) return
    persistHabits([
      ...habits,
      { id: uid(), name: name.trim(), category, createdAt: today },
    ])
    setName('')
    setAdding(false)
  }

  const toggle = (habitId: string, day: string) => {
    const h = { ...(logs[habitId] || {}) }
    if (h[day]) delete h[day]
    else h[day] = true
    persistLogs({ ...logs, [habitId]: h })
  }

  const streak = (habitId: string) => {
    const h = logs[habitId] || {}
    let n = 0
    let d = today
    if (!h[d]) d = addDays(d, -1)
    while (h[d]) {
      n++
      d = addDays(d, -1)
    }
    return n
  }

  if (loadFailed) {
    return (
      <View style={s.failWrap}>
        <Text style={s.failTitle}>Couldn’t reach your data</Text>
        <Text style={s.failText}>
          Your habits didn’t load, so nothing is shown yet — that way nothing
          already saved gets overwritten.
        </Text>
        <TouchableOpacity style={s.retryBtn} onPress={load}>
          <Text style={s.retryBtnText}>Try again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView
      style={s.wrap}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true)
            await load()
            if (alive.current) setRefreshing(false)
          }}
        />
      }>
      <View style={s.topRow}>
        <Text style={s.topText}>
          ACTIVITY RHYTHM · {GRID_DAYS} DAYS
        </Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setAdding(!adding)}>
          <Text style={s.addBtnText}>{adding ? 'Cancel' : '+ Add habit'}</Text>
        </TouchableOpacity>
      </View>

      {adding && (
        <View style={s.form}>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Read 20 minutes"
            placeholderTextColor={T.faint}
            autoFocus
          />
          <View style={s.catRow}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  s.catChip,
                  category === c && { borderColor: CAT_COLOR[c] },
                ]}
                onPress={() => setCategory(c)}>
                <View style={[s.dot, { backgroundColor: CAT_COLOR[c] }]} />
                <Text
                  style={[s.catText, category === c && { color: T.ink }]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={s.saveBtn} onPress={addHabit}>
            <Text style={s.saveBtnText}>Save habit</Text>
          </TouchableOpacity>
        </View>
      )}

      {habits.length === 0 && !adding && (
        <View style={s.empty}>
          <Text style={s.emptyBig}>Build your rhythm.</Text>
          <Text style={s.emptyHand}>
            schedule a daily activity — streaks land here
          </Text>
        </View>
      )}

      {habits.map(h => {
        const hLogs = logs[h.id] || {}
        const done30 = days.slice(-30).filter(d => hLogs[d]).length
        return (
          <View key={h.id} style={s.card}>
            <View style={s.cardHead}>
              <View style={[s.dot, { backgroundColor: CAT_COLOR[h.category] }]} />
              <Text style={s.habitName}>{h.name}</Text>
              <Text style={s.habitMeta}>
                {streak(h.id)}🔥 · {done30}/30d
              </Text>
              <TouchableOpacity
                onPress={() => {
                  persistHabits(habits.filter(x => x.id !== h.id))
                  const next = { ...logs }
                  delete next[h.id]
                  persistLogs(next)
                }}>
                <Text style={s.remove}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={s.grid}>
              {days.map(d => {
                const done = !!hLogs[d]
                const isToday = d === today
                return (
                  <TouchableOpacity
                    key={d}
                    onPress={() => toggle(h.id, d)}
                    style={[
                      s.cell,
                      done && { backgroundColor: CAT_COLOR[h.category] },
                      isToday && s.cellToday,
                    ]}
                  />
                )
              })}
            </View>
            <Text style={s.gridHint}>tap today’s cell to mark it done →</Text>
          </View>
        )
      })}
      <View style={{ height: 30 }} />
    </ScrollView>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: T.bg, paddingHorizontal: 16 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  topText: { fontSize: 10, letterSpacing: 1.6, color: T.mute },
  addBtn: {
    backgroundColor: T.ink,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  addBtnText: { color: T.bg, fontSize: 13, fontWeight: '600' },
  form: {
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: T.ink,
    backgroundColor: T.panel,
  },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  catText: { fontSize: 12, color: T.ink3 },
  saveBtn: {
    backgroundColor: T.ink,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 14,
  },
  saveBtnText: { color: T.bg, fontSize: 14, fontWeight: '600' },
  empty: {
    borderWidth: 1,
    borderColor: T.lineStrong,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 44,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyBig: { fontSize: 16, color: T.ink3 },
  emptyHand: {
    fontSize: 15,
    fontStyle: 'italic',
    color: T.mute,
    marginTop: 6,
  },
  card: {
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    elevation: 1,
    shadowColor: '#14120f',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  habitName: { flex: 1, fontSize: 15, fontWeight: '600', color: T.ink },
  habitMeta: { fontSize: 11, color: T.mute, marginRight: 10 },
  remove: { color: T.faint, fontSize: 13, padding: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  cell: {
    width: 14,
    height: 20,
    borderRadius: 3,
    backgroundColor: T.panel2,
  },
  cellToday: { borderWidth: 1.5, borderColor: T.ember },
  gridHint: { fontSize: 10, color: T.faint, marginTop: 10 },
  failWrap: {
    flex: 1,
    backgroundColor: T.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
  },
  failTitle: { fontSize: 16, fontWeight: '600', color: T.ink },
  failText: {
    fontSize: 13,
    lineHeight: 20,
    color: T.ink3,
    textAlign: 'center',
    marginTop: 8,
  },
  retryBtn: {
    backgroundColor: T.ink,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 11,
    marginTop: 18,
  },
  retryBtnText: { color: T.bg, fontSize: 14, fontWeight: '600' },
})
