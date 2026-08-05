import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { T } from '../lib/theme'

// First screen for signed-out visitors — the website's landing, condensed.
export default function LandingScreen({
  onNavigate,
}: {
  onNavigate: (tab: 'today' | 'habits' | 'quran' | 'essays' | 'hadith' | 'arabic') => void
}) {
  return (
    <View style={s.wrap}>
      <View style={s.center}>
        <Text style={s.micro}>LIVE MINDFULLY · WRITE THOUGHTFULLY</Text>

        <Text style={s.wordmark}>alinoor</Text>
        <Text style={s.handTop}>in the light</Text>

        <Text style={s.tagline}>
          A prayer-anchored day on one side.{'\n'}A quiet home for essays on
          the other.
        </Text>

        <View style={s.btnRow}>
          <TouchableOpacity
            style={s.primaryBtn}
            onPress={() => onNavigate('essays')}>
            <Text style={s.primaryTitle}>Essays</Text>
            <Text style={s.primarySub}>read &amp; write</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.ghostBtn}
            onPress={() => onNavigate('today')}>
            <Text style={s.ghostTitle}>Today</Text>
            <Text style={s.ghostSub}>prayers &amp; tasks</Text>
          </TouchableOpacity>
        </View>

        <View style={s.links}>
          {(
            [
              ['quran', 'Quran'],
              ['hadith', 'Hadith'],
              ['arabic', 'Arabic'],
              ['habits', 'Habits'],
            ] as const
          ).map(([key, label]) => (
            <TouchableOpacity key={key} onPress={() => onNavigate(key)}>
              <Text style={s.link}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.hand}>nūr — light, the kind you read by</Text>
      </View>

      <Text style={s.footer}>© 2026 AliNoor</Text>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: T.bg, paddingHorizontal: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  micro: { fontSize: 10, letterSpacing: 2, color: T.mute },
  wordmark: {
    fontSize: 64,
    fontWeight: '700',
    color: T.ink,
    letterSpacing: -2,
    marginTop: 18,
  },
  handTop: { fontSize: 18, fontStyle: 'italic', color: T.ember, marginTop: 2 },
  tagline: {
    fontSize: 15,
    lineHeight: 23,
    color: T.ink3,
    textAlign: 'center',
    marginTop: 20,
  },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 32, width: '100%' },
  primaryBtn: {
    flex: 1,
    backgroundColor: T.ink,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  primaryTitle: { color: T.bg, fontSize: 19, fontWeight: '700' },
  primarySub: { color: T.bg, opacity: 0.7, fontSize: 11, marginTop: 3 },
  ghostBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: T.lineStrong,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: T.panel,
  },
  ghostTitle: { color: T.ink, fontSize: 19, fontWeight: '700' },
  ghostSub: { color: T.mute, fontSize: 11, marginTop: 3 },
  links: {
    flexDirection: 'row',
    gap: 22,
    marginTop: 30,
  },
  link: { fontSize: 13, color: T.mute },
  hand: {
    fontSize: 19,
    fontStyle: 'italic',
    color: T.mute,
    marginTop: 44,
    transform: [{ rotate: '-1deg' }],
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: T.faint,
    paddingBottom: 24,
  },
})
