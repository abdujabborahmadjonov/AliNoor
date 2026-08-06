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
import PrayerRing from '../components/PrayerRing'
import { findCity } from '../lib/cities'
import {
  dateInTz,
  fmtTime,
  maghribDay,
  timesFor,
} from '../lib/prayer'
import {
  AppSettings,
  DEFAULT_SETTINGS,
  Task,
  loadKey,
  saveKey,
  uid,
} from '../lib/store'
import { T } from '../lib/theme'

// Month calendar (Monday-first): today filled, selected ringed, any day
// tappable to plan it — a straight port of the website's.
function MonthCalendar({
  tz,
  selected,
  onSelect,
}: {
  tz: string
  selected: string
  onSelect: (ymd: string) => void
}) {
  const [offset, setOffset] = useState(0)
  const todayYmd = dateInTz(tz)
  const [ty, tm] = todayYmd.split('-').map(Number)

  const first = new Date(Date.UTC(ty, tm - 1 + offset, 1))
  const y = first.getUTCFullYear()
  const m = first.getUTCMonth()
  const lead = (first.getUTCDay() + 6) % 7
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(Date.UTC(y, m, 1 - lead + i))
    return {
      ymd: d.toISOString().slice(0, 10),
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === m,
    }
  })

  const title = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(first)

  return (
    <View>
      <View style={s.calHead}>
        <TouchableOpacity onPress={() => setOffset(offset - 1)} style={s.calNav}>
          <Text style={s.calNavText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.calTitle}>{title}</Text>
        <TouchableOpacity onPress={() => setOffset(offset + 1)} style={s.calNav}>
          <Text style={s.calNavText}>›</Text>
        </TouchableOpacity>
      </View>
      <View style={s.calGrid}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <Text key={i} style={s.calDow}>
            {d}
          </Text>
        ))}
        {cells.map(c => (
          <TouchableOpacity
            key={c.ymd}
            style={s.calCell}
            onPress={() => onSelect(c.ymd)}>
            <Text
              style={[
                s.calDay,
                !c.inMonth && s.calDayOut,
                c.ymd === todayYmd && s.calDayToday,
                c.ymd === selected && c.ymd !== todayYmd && s.calDaySel,
              ]}>
              {c.day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.calHint}>
        tap a date to see its prayer times &amp; plan tasks
      </Text>
    </View>
  )
}

export default function TodayScreen({ userId }: { userId: string }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [tasks, setTasks] = useState<Task[]>([])
  const [now, setNow] = useState(new Date())
  const [addingAfter, setAddingAfter] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedYmd, setSelectedYmd] = useState('')

  const load = useCallback(async () => {
    const [st, t] = await Promise.all([
      loadKey<AppSettings>(userId, 'alinoor_settings', DEFAULT_SETTINGS),
      loadKey<Task[]>(userId, 'alinoor_tasks', []),
    ])
    setSettings({ ...DEFAULT_SETTINGS, ...st })
    setTasks(t)
  }, [userId])

  useEffect(() => {
    load()
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [load])

  const city = findCity(settings.city)
  const todayYmd = dateInTz(city.tz, now)
  const viewYmd = selectedYmd || todayYmd
  const isToday = viewYmd === todayYmd

  // Prayer times for the viewed day (local noon anchors non-today windows).
  const day = useMemo(() => {
    if (isToday) return maghribDay(settings, now)
    const [y, m, d] = viewYmd.split('-').map(Number)
    return maghribDay(settings, new Date(y, m - 1, d, 12, 0, 0))
  }, [settings, now, viewYmd, isToday])

  const live = useMemo(() => maghribDay(settings, now), [settings, now])
  const ringTimes = useMemo(() => timesFor(settings, now), [settings, now])
  const dayTasks = tasks.filter(t => t.date === viewYmd)
  const doneCount = dayTasks.filter(t => t.done).length

  const persist = (next: Task[]) => {
    setTasks(next)
    saveKey(userId, 'alinoor_tasks', next)
  }

  const addTask = (anchor: string) => {
    if (!draft.trim()) return
    persist([
      ...tasks,
      { id: uid(), date: viewYmd, anchor, title: draft.trim(), done: false },
    ])
    setDraft('')
    setAddingAfter(null)
  }

  const [vy, vm, vd] = viewYmd.split('-').map(Number)
  const gregorian = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
    .format(new Date(Date.UTC(vy, vm - 1, vd)))
    .toUpperCase()

  let hijri = ''
  try {
    hijri = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      timeZone: city.tz,
      day: 'numeric',
      month: 'long',
    })
      .format(isToday ? now : new Date(vy, vm - 1, vd, 12))
      .toUpperCase()
  } catch {}

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
      {/* Date strip */}
      <Text style={s.dateRow}>
        {gregorian}
        {hijri ? ` · ${hijri}` : ''} · {city.name.toUpperCase()}
      </Text>

      {!isToday && (
        <View style={s.planRow}>
          <Text style={s.planHand}>planning another day</Text>
          <TouchableOpacity
            style={s.planBack}
            onPress={() => setSelectedYmd('')}>
            <Text style={s.planBackText}>back to today</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TIMELINE */}
      {day.sequence.map(p => {
        const isNow = isToday && day.current.name === p.name
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

      {/* RING — always live */}
      <View style={s.card}>
        <Text style={s.cardMicro}>
          now · <Text style={{ color: T.ink2 }}>{live.current.name}</Text>
        </Text>
        <View style={s.ringBox}>
          <PrayerRing times={ringTimes} city={city} now={now} next={live.next} />
        </View>
      </View>

      {/* CALENDAR */}
      <View style={s.card}>
        <MonthCalendar
          tz={city.tz}
          selected={viewYmd}
          onSelect={ymd => setSelectedYmd(ymd === todayYmd ? '' : ymd)}
        />
      </View>

      {/* PROGRESS */}
      <View style={s.card}>
        <Text style={s.cardMicro}>
          {isToday ? "today's progress" : 'planned for this day'}
        </Text>
        <Text style={s.progressText}>
          {doneCount} of {dayTasks.length} tasks done
        </Text>
        <Text style={s.hand}>the day runs Maghrib to Maghrib</Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: T.bg, paddingHorizontal: 16 },
  dateRow: {
    fontSize: 10,
    letterSpacing: 1.6,
    color: T.mute,
    marginTop: 16,
    marginBottom: 12,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  planHand: { fontSize: 17, fontStyle: 'italic', color: T.mute },
  planBack: {
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  planBackText: { fontSize: 11, color: T.ink3 },
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
  prayerTime: { fontSize: 14, color: T.ink2, fontVariant: ['tabular-nums'] },
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
  card: {
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 16,
    padding: 18,
    marginTop: 14,
    elevation: 1,
    shadowColor: '#14120f',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  cardMicro: { fontSize: 10, letterSpacing: 1.6, color: T.mute },
  ringBox: { paddingHorizontal: 14, marginTop: 6 },
  calHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calNav: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calNavText: { fontSize: 18, color: T.ink3 },
  calTitle: { fontSize: 14, fontWeight: '600', color: T.ink },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calDow: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 10,
    color: T.faint,
    paddingVertical: 4,
  },
  calCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 4,
  },
  calDay: {
    width: 30,
    height: 30,
    borderRadius: 15,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 12,
    color: T.ink2,
  },
  calDayOut: { color: T.faint },
  calDayToday: {
    backgroundColor: T.ink,
    color: T.bg,
    fontWeight: '700',
    overflow: 'hidden',
  },
  calDaySel: {
    borderWidth: 1.5,
    borderColor: T.ember,
    color: T.ink,
    fontWeight: '600',
    overflow: 'hidden',
  },
  calHint: { fontSize: 10, color: T.faint, marginTop: 8 },
  progressText: { fontSize: 14, color: T.ink3, marginTop: 8 },
  hand: { fontSize: 17, fontStyle: 'italic', color: T.mute, marginTop: 10 },
})
