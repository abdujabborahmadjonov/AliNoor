import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Linking,
  Modal,
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
import LandingScreen from './screens/LandingScreen'
import TodayScreen from './screens/TodayScreen'
import HabitsScreen from './screens/HabitsScreen'
import QuranScreen from './screens/QuranScreen'
import EssaysScreen from './screens/EssaysScreen'
import HadithScreen from './screens/HadithScreen'
import ArabicScreen from './screens/ArabicScreen'
import SettingsScreen from './screens/SettingsScreen'

type Tab =
  | 'today'
  | 'habits'
  | 'quran'
  | 'essays'
  | 'hadith'
  | 'arabic'
  | 'settings'

const TABS: Array<{ key: Tab; label: string; icon: string }> = [
  { key: 'today', label: 'Today', icon: '◔' },
  { key: 'habits', label: 'Habits', icon: '▤' },
  { key: 'quran', label: 'Quran', icon: '☾' },
  { key: 'essays', label: 'Essays', icon: '✎' },
]

const MORE: Array<{ key: Tab; label: string; sub: string }> = [
  { key: 'hadith', label: 'Hadith', sub: 'Sahih al-Bukhari, complete' },
  { key: 'arabic', label: 'Arabic', sub: 'starter Qur’anic vocabulary' },
  { key: 'settings', label: 'Settings', sub: 'city, method, account' },
]

const TITLES: Record<Tab, string> = {
  today: 'Today',
  habits: 'Habits',
  quran: 'Quran',
  essays: 'Essays',
  hadith: 'Hadith',
  arabic: 'Arabic',
  settings: 'Settings',
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [booted, setBooted] = useState(false)
  const [tab, setTab] = useState<Tab>('today')
  const [moreOpen, setMoreOpen] = useState(false)
  const [landingSeen, setLandingSeen] = useState(false)

  useEffect(() => {
    // Never hang on boot: if session restore is slow (offline / expired
    // token refresh), start signed-out and let onAuthStateChange catch up.
    const fallback = setTimeout(() => setBooted(true), 4000)
    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(fallback)
      setSession(data.session)
      setBooted(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession),
    )

    // Google sign-in returns here as alinoor://auth?code=… (PKCE) or, as a
    // fallback, with tokens in the URL fragment.
    const handleUrl = async (url: string | null) => {
      if (!url) return
      const codeMatch = url.match(/[?&]code=([^&#]+)/)
      if (codeMatch) {
        await supabase.auth.exchangeCodeForSession(codeMatch[1])
        return
      }
      if (!url.includes('#')) return
      const params = new URLSearchParams(url.split('#')[1])
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token })
      }
    }
    Linking.getInitialURL().then(handleUrl)
    const linkSub = Linking.addEventListener('url', e => handleUrl(e.url))

    return () => {
      sub.subscription.unsubscribe()
      linkSub.remove()
    }
  }, [])

  if (!booted) {
    return (
      <View style={s.boot}>
        <ActivityIndicator color={T.ink} size="large" />
      </View>
    )
  }

  // Signed-out visitors meet the landing first, like the website.
  if (!session && !landingSeen) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={s.app} edges={['top', 'left', 'right']}>
          <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
          <LandingScreen
            onNavigate={next => {
              setTab(next)
              setLandingSeen(true)
            }}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    )
  }

  const userId = session?.user.id || null
  const email = session?.user.email || ''
  const moreActive = MORE.some(m => m.key === tab)
  // Reading tabs are public, like the website; personal tabs need sign-in.
  const GATED: Tab[] = ['today', 'habits', 'settings']
  const needsAuth = !session && GATED.includes(tab)

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
          <Text style={s.headerTitle}>{TITLES[tab]}</Text>
        </View>

        {/* Active screen */}
        <View style={s.body}>
          {needsAuth ? (
            <AuthScreen />
          ) : (
            <>
              {tab === 'today' && userId && <TodayScreen userId={userId} />}
              {tab === 'habits' && userId && <HabitsScreen userId={userId} />}
              {tab === 'quran' && <QuranScreen />}
              {tab === 'essays' && (
                <EssaysScreen
                  userId={userId}
                  email={email}
                  name={session?.user.user_metadata?.full_name || ''}
                />
              )}
              {tab === 'hadith' && <HadithScreen />}
              {tab === 'arabic' && <ArabicScreen userId={userId} />}
              {tab === 'settings' && userId && (
                <SettingsScreen userId={userId} email={email} />
              )}
            </>
          )}
        </View>

        {/* Bottom tabs — Today · Habits · Quran · Essays · More */}
        <View style={s.tabbar}>
          {TABS.map(t => {
            const active = tab === t.key
            return (
              <TouchableOpacity
                key={t.key}
                style={s.tab}
                onPress={() => {
                  setTab(t.key)
                  setMoreOpen(false)
                }}>
                <Text style={[s.tabIcon, active && s.tabActive]}>{t.icon}</Text>
                <Text style={[s.tabLabel, active && s.tabActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            )
          })}
          <TouchableOpacity style={s.tab} onPress={() => setMoreOpen(true)}>
            <Text style={[s.tabIcon, moreActive && s.tabActive]}>⋯</Text>
            <Text style={[s.tabLabel, moreActive && s.tabActive]}>More</Text>
          </TouchableOpacity>
        </View>

        {/* More sheet */}
        <Modal
          visible={moreOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setMoreOpen(false)}>
          <TouchableOpacity
            style={s.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setMoreOpen(false)}>
            <View style={s.sheet}>
              {MORE.map(m => (
                <TouchableOpacity
                  key={m.key}
                  style={s.sheetRow}
                  onPress={() => {
                    setTab(m.key)
                    setMoreOpen(false)
                  }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        s.sheetLabel,
                        tab === m.key && { color: T.ember },
                      ]}>
                      {m.label}
                    </Text>
                    <Text style={s.sheetSub}>{m.sub}</Text>
                  </View>
                  <Text style={s.sheetArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
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
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,18,15,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: T.panel,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingVertical: 10,
    paddingBottom: 90,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  sheetLabel: { fontSize: 16, fontWeight: '600', color: T.ink },
  sheetSub: { fontSize: 12, color: T.mute, marginTop: 2 },
  sheetArrow: { fontSize: 16, color: T.faint },
})
