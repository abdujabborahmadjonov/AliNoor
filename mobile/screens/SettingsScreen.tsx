import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  CITIES,
  findCity,
  searchCities,
  utcOffsetLabel,
} from '../lib/cities'
import {
  AppSettings,
  DEFAULT_SETTINGS,
  loadKey,
  saveKey,
  signOutAndClear,
} from '../lib/store'
import { T } from '../lib/theme'

const METHODS: Array<[AppSettings['method'], string]> = [
  ['MuslimWorldLeague', 'Muslim World League'],
  ['ISNA', 'ISNA (North America)'],
  ['Egyptian', 'Egyptian General Authority'],
  ['UmmAlQura', 'Umm al-Qura (Makkah)'],
  ['Karachi', 'University of Karachi'],
]

export default function SettingsScreen({
  userId,
  email,
}: {
  userId: string
  email: string
}) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [pickCity, setPickCity] = useState(false)
  const [cityQuery, setCityQuery] = useState('')
  const [loadFailed, setLoadFailed] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const alive = useRef(true)

  const load = useCallback(async () => {
    const st = await loadKey<AppSettings>(
      userId,
      'alinoor_settings',
      DEFAULT_SETTINGS,
    )
    if (!alive.current) return
    setLoadFailed(st.failed)
    if (!st.failed) setSettings({ ...DEFAULT_SETTINGS, ...st.value })
  }, [userId])

  useEffect(() => {
    alive.current = true
    load()
    return () => {
      alive.current = false
    }
  }, [load])

  const city = findCity(settings.city)
  const cityOffset = utcOffsetLabel(city.tz)
  const cityResults = useMemo(() => searchCities(cityQuery), [cityQuery])
  // Recomputed per opening so a DST change mid-session still shows right.
  const offsets = useMemo(
    () =>
      pickCity ? new Map(CITIES.map(c => [c.tz, utcOffsetLabel(c.tz)])) : null,
    [pickCity],
  )

  const togglePicker = () => {
    setPickCity(!pickCity)
    setCityQuery('')
  }

  const update = (patch: Partial<AppSettings>) => {
    // Writing defaults on top of an unread row would reset the city everywhere.
    if (loadFailed) return
    const next = { ...settings, ...patch }
    setSettings(next)
    saveKey(userId, 'alinoor_settings', next)
  }

  return (
    <ScrollView style={s.wrap} keyboardShouldPersistTaps="handled">
      <View style={s.card}>
        <Text style={s.heading}>ACCOUNT</Text>
        <Text style={s.mono}>{email}</Text>
      </View>

      {loadFailed && (
        <View style={s.card}>
          <Text style={s.heading}>SETTINGS UNAVAILABLE</Text>
          <Text style={s.failText}>
            Your settings didn’t load, so they aren’t shown — changing them now
            would overwrite what’s already saved.
          </Text>
          <TouchableOpacity style={s.retryBtn} onPress={load}>
            <Text style={s.retryBtnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loadFailed && (
        <>
      <View style={s.card}>
        <Text style={s.heading}>CITY</Text>
        <TouchableOpacity style={s.select} onPress={togglePicker}>
          <Text style={s.selectText}>
            {city.name} · {city.country}
          </Text>
          <Text style={s.chev}>{pickCity ? '▴' : '▾'}</Text>
        </TouchableOpacity>
        <Text style={s.tz}>
          {city.tz}
          {cityOffset ? `  ·  ${cityOffset}` : ''}
        </Text>
        {pickCity && (
          <View style={s.options}>
            <TextInput
              style={s.search}
              value={cityQuery}
              onChangeText={setCityQuery}
              placeholder="Search city, country or UTC offset"
              placeholderTextColor={T.faint}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
              returnKeyType="search"
            />
            {cityResults.length === 0 && (
              <Text style={s.empty}>No city matches “{cityQuery.trim()}”</Text>
            )}
            {cityResults.map(c => (
              <TouchableOpacity
                key={c.name}
                style={s.optionRow}
                onPress={() => {
                  update({ city: c.name })
                  setPickCity(false)
                  setCityQuery('')
                }}>
                <Text
                  numberOfLines={1}
                  style={[
                    s.optionText,
                    s.optionName,
                    c.name === settings.city && s.optionActive,
                  ]}>
                  {c.name} · {c.country}
                </Text>
                <Text style={s.offset}>{offsets?.get(c.tz)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={s.card}>
        <Text style={s.heading}>CALCULATION METHOD</Text>
        {METHODS.map(([value, label]) => (
          <TouchableOpacity
            key={value}
            style={s.option}
            onPress={() => update({ method: value })}>
            <Text
              style={[
                s.optionText,
                value === settings.method && s.optionActive,
              ]}>
              {value === settings.method ? '● ' : '○ '}
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.card}>
        <Text style={s.heading}>MADHHAB</Text>
        <View style={s.rowGap}>
          {(['Hanafi', 'Shafi'] as const).map(m => (
            <TouchableOpacity
              key={m}
              style={[s.pill, settings.madhab === m && s.pillActive]}
              onPress={() => update({ madhab: m })}>
              <Text
                style={[
                  s.pillText,
                  settings.madhab === m && s.pillTextActive,
                ]}>
                {m === 'Shafi' ? "Shafi'i / Maliki / Hanbali" : 'Hanafi'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.note}>affects Asr time</Text>
      </View>
        </>
      )}

      <TouchableOpacity
        style={s.signOut}
        disabled={signingOut}
        onPress={async () => {
          setSigningOut(true)
          await signOutAndClear()
          if (alive.current) setSigningOut(false)
        }}>
        <Text style={s.signOutText}>
          {signingOut ? 'Logging out…' : 'Log out'}
        </Text>
      </TouchableOpacity>
      <Text style={s.footer}>nūr — light, the kind you read by</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: T.bg, paddingHorizontal: 16 },
  card: {
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 14,
    padding: 18,
    marginTop: 14,
  },
  heading: {
    fontSize: 10,
    letterSpacing: 1.6,
    color: T.mute,
    marginBottom: 12,
  },
  mono: { fontSize: 13, color: T.ink3 },
  select: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  selectText: { fontSize: 14, color: T.ink },
  chev: { color: T.mute },
  tz: { fontSize: 12, color: T.mute, marginTop: 8 },
  options: { marginTop: 8 },
  search: {
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: T.ink,
    backgroundColor: T.panel,
    marginBottom: 4,
  },
  empty: { fontSize: 13, color: T.mute, paddingVertical: 10 },
  option: { paddingVertical: 8 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
  },
  optionName: { flexShrink: 1 },
  offset: { fontSize: 11, color: T.mute },
  optionText: { fontSize: 14, color: T.ink3 },
  optionActive: { color: T.ink, fontWeight: '600' },
  rowGap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  pillActive: { backgroundColor: T.ink, borderColor: T.ink },
  pillText: { fontSize: 13, color: T.ink2 },
  pillTextActive: { color: T.bg, fontWeight: '600' },
  note: { fontSize: 13, fontStyle: 'italic', color: T.warn, marginTop: 10 },
  failText: { fontSize: 13, lineHeight: 20, color: T.ink3 },
  retryBtn: {
    backgroundColor: T.ink,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 14,
  },
  retryBtnText: { color: T.bg, fontSize: 14, fontWeight: '600' },
  signOut: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#d9a196',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  signOutText: { color: T.ember, fontWeight: '600', fontSize: 15 },
  footer: {
    textAlign: 'center',
    color: T.mute,
    fontStyle: 'italic',
    fontSize: 14,
    marginTop: 22,
  },
})
