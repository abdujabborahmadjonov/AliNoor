import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { T } from './lib/theme'
import AuthScreen from './screens/AuthScreen'
import TodayScreen from './screens/TodayScreen'
import EssaysScreen from './screens/EssaysScreen'
import SettingsScreen from './screens/SettingsScreen'

type Tab = 'today' | 'essays' | 'settings'

const TABS: Array<{ key: Tab; label: string; icon: string }> = [
  { key: 'today', label: 'Today', icon: '◔' },
  { key: 'essays', label: 'Essays', icon: '✎' },
  { key: 'settings', label: 'Settings', icon: '⚙' },
]

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [booted, setBooted] = useState(false)
  const [tab, setTab] = useState<Tab>('today')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setBooted(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession),
    )
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!booted) {
    return (
      <View style={s.boot}>
        <ActivityIndicator color={T.ink} size="large" />
      </View>
    )
  }

  if (!session) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
          <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
          <AuthScreen />
        </SafeAreaView>
      </SafeAreaProvider>
    )
  }

  const userId = session.user.id
  const email = session.user.email || ''

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.app} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Header */}
      <View style={s.header}>
        <Text>
          <Text style={s.brand}>alinoor</Text>
          <Text style={s.hand}>  in the light</Text>
        </Text>
        <Text style={s.headerTitle}>
          {TABS.find(t => t.key === tab)?.label}
        </Text>
      </View>

      {/* Active screen */}
      <View style={s.body}>
        {tab === 'today' && <TodayScreen userId={userId} />}
        {tab === 'essays' && <EssaysScreen />}
        {tab === 'settings' && (
          <SettingsScreen userId={userId} email={email} />
        )}
      </View>

      {/* Bottom tabs */}
      <View style={s.tabbar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={s.tab}
            onPress={() => setTab(t.key)}>
            <Text style={[s.tabIcon, tab === t.key && s.tabActive]}>
              {t.icon}
            </Text>
            <Text style={[s.tabLabel, tab === t.key && s.tabActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const s = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: T.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  app: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: T.line,
    backgroundColor: T.bg,
  },
  brand: { fontSize: 19, fontWeight: '700', color: T.ink },
  hand: { fontSize: 13, fontStyle: 'italic', color: T.ember },
  headerTitle: { fontSize: 13, color: T.mute },
  body: { flex: 1 },
  tabbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: T.line,
    backgroundColor: T.bg,
    paddingBottom: 18,
    paddingTop: 2,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabIcon: { fontSize: 21, color: T.faint },
  tabLabel: { fontSize: 10, color: T.mute, marginTop: 3, letterSpacing: 0.3 },
  tabActive: { color: T.ember, fontWeight: '600' },
})
