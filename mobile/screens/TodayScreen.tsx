import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
import { countdown, dateInTz, fmtTime, maghribDay } from '../lib/prayer'
import {
  AppSettings,
  DEFAULT_SETTINGS,
  Task,
  loadKey,
  saveKey,
  uid,
} from '../lib/store'
import { T } from '../lib/theme'

export default function TodayScreen({ userId }: { userId: string }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [tasks, setTasks] = useState<Task[]>([])
  const [now, setNow] = useState(new Date())
  const [addingAfter, setAddingAfter] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const [s, t] = await Promise.all([
      loadKey<AppSettings>(userId, 'alinoor_settings', DEFAULT_SETTINGS),
      loadKey<Task[]>(userId, 'alinoor_tasks', []),
    ])
    setSettings({ ...DEFAULT_SETTINGS, ...s })
    setTasks(t)
  }, [userId])

  useEffect(() => {
    load()
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [load])

  const day = useMemo(() => maghribDay(settings, now), [settings, now])
  const city = findCity(settings.city)
  const today = dateInTz(city.tz, now)
  const dayTasks = tasks.filter(t => t.date === today)

  const persist = (next: Task[]) => {
    setTasks(next)
    saveKey(userId, 'alinoor_tasks', next)
  }

  const addTask = (anchor: string) => {
    if (!draft.trim()) return
    persist([
      ...tasks,
      { id: uid(), date: today, anchor, title: draft.trim(), done: false },
    ])
    setDraft('')
    setAddingAfter(null)
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
            setRefreshing(false)
          }}
        />
      }>
      {/* Next prayer card */}
      <View style={s.nextCard}>
        <View style={s.nextHead}>
          <View>
            <Text style={s.micro}>NOW · {day.current.name.toUpperCase()}</Text>
            <Text style={[s.micro, s.microNext]}>
              NEXT · {day.next.name.toUpperCase()}
            </Text>
          </View>
          <View style={s.sunDot} />
        </View>
        <Text style={s.nextBig}>{countdown(day.next.time, now)}</Text>
        <Text style={s.nextAt}>
          at {fmtTime(day.next.time, city.tz)} · {city.name}
        </Text>
      </View>

      {day.sequence.map(p => {
        const isNow = day.current.name === p.name
        const anchorTasks = dayTasks.filter(t => t.anchor === p.name)
        return (
          <View key={`${p.name}${p.time.getTime()}`}>
            <View style={[s.prayerRow, isNow && s.prayerNow]}>
              <View style={[s.prayerDot, isNow && s.prayerDotNow]} />
              <Text style={s.prayerName}>{p.name}</Text>
              {isNow && <Text style={s.nowBadge}>NOW</Text>}
              <Text style={s.prayerTime}>{fmtTime(p.time, city.tz)}</Text>
            </View>

            <View style={s.taskBlock}>
              {anchorTasks.map(t => (
                <View key={t.id} style={s.taskRow}>
                  <TouchableOpacity
                    onPress={() =>
                      persist(
                        tasks.map(x =>
                          x.id === t.id ? { ...x, done: !x.done } : x,
                        ),
                      )
                    }
                    style={[s.check, t.done && s.checkDone]}
                  />
                  <Text style={[s.taskText, t.done && s.taskDone]}>
                    {t.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => persist(tasks.filter(x => x.id !== t.id))}>
                    <Text style={s.remove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {addingAfter === p.name ? (
                <View style={s.addRow}>
                  <TextInput
                    style={s.addInput}
                    value={draft}
                    onChangeText={setDraft}
                    placeholder="Task…"
                    placeholderTextColor={T.faint}
                    autoFocus
                    onSubmitEditing={() => addTask(p.name)}
                  />
                  <TouchableOpacity
                    style={s.addBtn}
                    onPress={() => addTask(p.name)}>
                    <Text style={s.addBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={s.addSlot}
                  onPress={() => {
                    setAddingAfter(p.name)
                    setDraft('')
                  }}>
                  <Text style={s.addHint}>+ add task after {p.name}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )
      })}

      <Text style={s.footerNote}>the day runs Maghrib to Maghrib</Text>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: T.bg, paddingHorizontal: 16 },
  nextCard: {
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#14120f',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  nextHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sunDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#d4a868',
  },
  micro: { fontSize: 10, letterSpacing: 1.6, color: T.mute },
  microNext: { color: T.ember, marginTop: 3 },
  nextBig: {
    fontSize: 42,
    fontWeight: '700',
    color: T.ink,
    marginTop: 10,
    letterSpacing: -1,
  },
  nextAt: { fontSize: 12, color: T.mute, marginTop: 3 },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 1,
    shadowColor: '#14120f',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  prayerNow: { borderColor: T.ember, backgroundColor: '#fdf6f0' },
  prayerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: T.lineStrong,
    marginRight: 12,
  },
  prayerDotNow: { backgroundColor: T.ember, borderColor: T.ember },
  prayerName: { fontSize: 15, fontWeight: '600', color: T.ink, flex: 1 },
  prayerTime: {
    fontSize: 14,
    color: T.ink2,
    fontVariant: ['tabular-nums'],
  },
  nowBadge: {
    fontSize: 10,
    letterSpacing: 1.6,
    color: T.ember,
    marginRight: 10,
  },
  taskBlock: { marginLeft: 18, marginVertical: 6 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.panel2,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
  },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: T.lineStrong,
    marginRight: 10,
  },
  checkDone: { backgroundColor: T.good, borderColor: T.good },
  taskText: { flex: 1, fontSize: 14, color: T.ink2 },
  taskDone: { color: T.mute, textDecorationLine: 'line-through' },
  remove: { color: T.faint, fontSize: 12, paddingHorizontal: 4 },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: T.ink,
    backgroundColor: T.panel,
  },
  addBtn: {
    backgroundColor: T.ink,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  addBtnText: { color: T.bg, fontSize: 13, fontWeight: '600' },
  addSlot: {
    borderWidth: 1,
    borderColor: T.line,
    borderStyle: 'dashed',
    borderRadius: 10,
    marginBottom: 6,
  },
  addHint: {
    fontSize: 11,
    color: T.faint,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  footerNote: {
    textAlign: 'center',
    color: T.mute,
    fontStyle: 'italic',
    fontSize: 15,
    marginVertical: 24,
  },
})
