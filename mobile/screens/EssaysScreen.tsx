import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { T } from '../lib/theme'

type Article = {
  id: string
  title: string
  slug: string
  excerpt: string
  topic?: string | null
  cover_image: string
  author_name?: string | null
  content?: string
  read_time_minutes?: number
}

const PAGE = 10

// Imported essays are stored as HTML — flatten to readable paragraphs.
const htmlToParagraphs = (html: string): string[] => {
  const text = html
    .replace(/<br\s*\/?>(\n)?/gi, '\n')
    .replace(/<\/(p|h[1-6]|li|blockquote)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
  return text
    .split(/\n{2,}/)
    .map(p => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

export default function EssaysScreen({
  userId,
  email,
  name,
}: {
  userId: string | null
  email: string
  name: string
}) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [end, setEnd] = useState(false)
  const [open, setOpen] = useState<Article | null>(null)
  const [openBody, setOpenBody] = useState<string[] | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [writing, setWriting] = useState(false)
  const [wTitle, setWTitle] = useState('')
  const [wContent, setWContent] = useState('')
  const [publishing, setPublishing] = useState(false)

  const publish = async (status: 'draft' | 'published') => {
    if (!userId) return
    if (!wTitle.trim() || !wContent.trim()) {
      Alert.alert('AliNoor', 'Title and content are required.')
      return
    }
    setPublishing(true)
    const slug =
      wTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now().toString(36)
    const words = wContent.trim().split(/\s+/).length
    const { error } = await supabase.from('articles').insert({
      title: wTitle.trim(),
      slug,
      excerpt: wContent.trim().slice(0, 180),
      content: wContent.trim(),
      topic: 'Essays',
      status,
      author_id: userId,
      author_email: email,
      author_name: name || null,
      read_time_minutes: Math.max(1, Math.round(words / 200)),
      published_at: status === 'published' ? new Date().toISOString() : null,
    })
    setPublishing(false)
    if (error) {
      Alert.alert('AliNoor', error.message)
    } else {
      setWriting(false)
      setWTitle('')
      setWContent('')
      Alert.alert(
        'AliNoor',
        status === 'published' ? 'Essay published!' : 'Draft saved.',
      )
      if (status === 'published') refresh()
    }
  }

  const refresh = useCallback(async () => {
    setRefreshing(true)
    const rows = await fetchPage(0)
    setArticles(rows)
    setEnd(rows.length < PAGE)
    setRefreshing(false)
  }, [])

  const fetchPage = async (offset: number) => {
    const { data } = await supabase
      .from('articles')
      .select(
        'id, title, slug, excerpt, topic, cover_image, author_name, read_time_minutes',
      )
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE - 1)
    return data || []
  }

  useEffect(() => {
    fetchPage(0).then(rows => {
      setArticles(rows)
      setEnd(rows.length < PAGE)
      setLoading(false)
    })
  }, [])

  const more = async () => {
    if (loadingMore || end) return
    setLoadingMore(true)
    const rows = await fetchPage(articles.length)
    setArticles(a => [...a, ...rows])
    setEnd(rows.length < PAGE)
    setLoadingMore(false)
  }

  const openEssay = async (a: Article) => {
    setOpen(a)
    setOpenBody(null)
    const { data } = await supabase
      .from('articles')
      .select('content')
      .eq('id', a.id)
      .single()
    setOpenBody(htmlToParagraphs(data?.content || ''))
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={T.ink} size="large" />
      </View>
    )
  }

  return (
    <>
      {userId && (
        <TouchableOpacity style={s.writeFab} onPress={() => setWriting(true)}>
          <Text style={s.writeFabText}>✎ Write</Text>
        </TouchableOpacity>
      )}
      <FlatList
        style={s.wrap}
        data={articles}
        keyExtractor={a => a.id}
        onEndReached={more}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListHeaderComponent={
          <View style={s.hero}>
            <Text style={s.heroMicro}>A HOME FOR THOUGHTFUL WRITING</Text>
            <Text style={s.heroTitle}>
              Write in the quiet.{'\n'}Read in the{' '}
              <Text style={s.heroLight}>light</Text>.
            </Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={T.ink} style={{ marginVertical: 20 }} />
          ) : (
            <View style={{ height: 24 }} />
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => openEssay(item)}>
            {!!item.cover_image && (
              <Image source={{ uri: item.cover_image }} style={s.cover} />
            )}
            <View style={s.cardBody}>
              {!!item.topic && (
                <Text style={s.topic}>{item.topic.toUpperCase()}</Text>
              )}
              <Text style={s.title}>{item.title.trim()}</Text>
              {!!item.excerpt && (
                <Text style={s.excerpt} numberOfLines={3}>
                  {item.excerpt}
                </Text>
              )}
              <View style={s.metaRow}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>
                    {(item.author_name || 'A')[0].toUpperCase()}
                  </Text>
                </View>
                <Text style={s.meta}>{item.author_name || 'AliNoor'}</Text>
                {!!item.read_time_minutes && (
                  <Text style={s.metaRight}>
                    {item.read_time_minutes} min
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!open} animationType="slide" onRequestClose={() => setOpen(null)}>
        <View style={s.readerWrap}>
          <View style={s.readerHead}>
            <TouchableOpacity onPress={() => setOpen(null)}>
              <Text style={s.back}>← Essays</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.readerScroll}>
            <Text style={s.readerTitle}>{open?.title.trim()}</Text>
            <Text style={s.readerMeta}>
              {open?.author_name || 'AliNoor'}
              {open?.read_time_minutes ? ` · ${open.read_time_minutes} min` : ''}
            </Text>
            {!!open?.cover_image && (
              <Image source={{ uri: open.cover_image }} style={s.readerCover} />
            )}
            {openBody === null ? (
              <ActivityIndicator color={T.ink} style={{ marginTop: 40 }} />
            ) : (
              openBody.map((p, i) => (
                <Text key={i} style={s.para}>
                  {p}
                </Text>
              ))
            )}
            <View style={{ height: 48 }} />
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={writing}
        animationType="slide"
        onRequestClose={() => setWriting(false)}>
        <KeyboardAvoidingView
          style={s.composeWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.readerHead}>
            <TouchableOpacity onPress={() => setWriting(false)}>
              <Text style={s.back}>← Cancel</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.composeScroll}>
            <Text style={s.composeMicro}>NEW ESSAY</Text>
            <TextInput
              style={s.composeTitle}
              value={wTitle}
              onChangeText={setWTitle}
              placeholder="Title…"
              placeholderTextColor={T.faint}
            />
            <TextInput
              style={s.composeBody}
              value={wContent}
              onChangeText={setWContent}
              placeholder="Write your essay…"
              placeholderTextColor={T.faint}
              multiline
              textAlignVertical="top"
            />
            <View style={s.composeBtns}>
              <TouchableOpacity
                style={s.draftBtn}
                disabled={publishing}
                onPress={() => publish('draft')}>
                <Text style={s.draftBtnText}>Save draft</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.publishBtn}
                disabled={publishing}
                onPress={() => publish('published')}>
                <Text style={s.publishBtnText}>
                  {publishing ? 'Publishing…' : 'Publish'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: T.bg, paddingHorizontal: 16 },
  center: {
    flex: 1,
    backgroundColor: T.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { paddingTop: 22, paddingBottom: 8 },
  heroMicro: { fontSize: 10, letterSpacing: 1.8, color: T.mute },
  heroTitle: {
    fontSize: 30,
    lineHeight: 37,
    fontWeight: '600',
    color: T.ink,
    letterSpacing: -0.5,
    marginTop: 10,
  },
  heroLight: { textDecorationLine: 'underline', textDecorationColor: T.warn },
  card: {
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 14,
  },
  cover: { width: '100%', height: 160, backgroundColor: T.panel2 },
  cardBody: { padding: 16 },
  topic: {
    fontSize: 9,
    letterSpacing: 1.6,
    color: T.mute,
    marginBottom: 6,
  },
  title: { fontSize: 17, fontWeight: '600', color: T.ink, lineHeight: 23 },
  excerpt: { fontSize: 13, color: T.ink3, lineHeight: 19, marginTop: 6 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: T.line,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: T.lineStrong,
    backgroundColor: T.panel2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: { fontSize: 10, fontWeight: '700', color: T.ink2 },
  meta: { fontSize: 12, color: T.ink3, flex: 1 },
  metaRight: { fontSize: 11, color: T.faint },
  readerWrap: { flex: 1, backgroundColor: T.bg },
  readerHead: {
    paddingTop: 54,
    paddingBottom: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: T.line,
    backgroundColor: T.bg,
  },
  back: { color: T.ink3, fontSize: 15 },
  readerScroll: { paddingHorizontal: 20, paddingTop: 20 },
  readerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: T.ink,
    lineHeight: 33,
  },
  readerMeta: { fontSize: 12, color: T.mute, marginTop: 8, marginBottom: 14 },
  readerCover: {
    width: '100%',
    height: 190,
    borderRadius: 12,
    backgroundColor: T.panel2,
    marginBottom: 18,
  },
  para: { fontSize: 16, lineHeight: 27, color: T.ink2, marginBottom: 16 },
  writeFab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    zIndex: 10,
    backgroundColor: T.ink,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 13,
    elevation: 4,
    shadowColor: '#14120f',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  writeFabText: { color: T.bg, fontWeight: '700', fontSize: 14 },
  composeWrap: { flex: 1, backgroundColor: T.bg },
  composeScroll: { paddingHorizontal: 20, paddingTop: 16 },
  composeMicro: { fontSize: 10, letterSpacing: 1.6, color: T.mute },
  composeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: T.ink,
    marginTop: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: T.line,
  },
  composeBody: {
    fontSize: 16,
    lineHeight: 26,
    color: T.ink2,
    minHeight: 300,
    marginTop: 14,
  },
  composeBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  draftBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  draftBtnText: { color: T.ink2, fontWeight: '600', fontSize: 14 },
  publishBtn: {
    flex: 1,
    backgroundColor: T.ink,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  publishBtnText: { color: T.bg, fontWeight: '700', fontSize: 14 },
})
