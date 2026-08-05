import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
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

export default function EssaysScreen() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [end, setEnd] = useState(false)
  const [open, setOpen] = useState<Article | null>(null)
  const [openBody, setOpenBody] = useState<string[] | null>(null)
  const [refreshing, setRefreshing] = useState(false)

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
      <FlatList
        style={s.wrap}
        data={articles}
        keyExtractor={a => a.id}
        onEndReached={more}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
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
})
