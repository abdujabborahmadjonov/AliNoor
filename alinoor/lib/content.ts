// Curated references only — verse and hadith TEXT is fetched at runtime from
// public sources (alquran.cloud for Qur'an, the public-domain hadith-api CDN
// for Bukhari/Muslim), so nothing bulky or third-party lives in the bundle.

export type QuranTheme = {
  key: string
  title: string
  blurb: string
  refs: string[] // "surah:ayah"
}

export const QURAN_THEMES: QuranTheme[] = [
  {
    key: 'remembrance',
    title: 'Remembrance & gratitude',
    blurb: 'Keeping the heart connected through dhikr and thanks.',
    refs: ['2:152', '13:28', '14:7', '33:41'],
  },
  {
    key: 'patience',
    title: 'Patience & trials',
    blurb: 'Steadiness when the day is heavy.',
    refs: ['2:153', '2:155', '94:5', '39:10'],
  },
  {
    key: 'mercy',
    title: 'Mercy & forgiveness',
    blurb: 'Hope in His mercy, whatever came before.',
    refs: ['39:53', '7:156', '3:135', '25:70'],
  },
  {
    key: 'knowledge',
    title: 'Knowledge & reflection',
    blurb: 'Reading, thinking, and being raised by what you learn.',
    refs: ['96:1', '58:11', '20:114', '39:9'],
  },
  {
    key: 'daily',
    title: 'How to spend the day',
    blurb: 'The rhythm of hours — prayer, work, rest.',
    refs: ['20:130', '17:78', '62:10', '25:47'],
  },
]

export type HadithRef = {
  collection: 'bukhari' | 'muslim'
  number: number
  note: string
}

export type HadithTheme = {
  key: string
  title: string
  blurb: string
  refs: HadithRef[]
}

export const HADITH_THEMES: HadithTheme[] = [
  {
    key: 'intentions',
    title: 'Intentions & sincerity',
    blurb: 'What the heart intends counts first.',
    refs: [
      { collection: 'bukhari', number: 1, note: 'Deeds are by intentions' },
      { collection: 'bukhari', number: 6502, note: 'Drawing near through the obligatory' },
      { collection: 'muslim', number: 2564, note: 'He looks at hearts and deeds' },
    ],
  },
  {
    key: 'character',
    title: 'Manners & character',
    blurb: 'Gentleness, truthfulness, restraint.',
    refs: [
      { collection: 'bukhari', number: 6114, note: 'Strength is self-restraint' },
      { collection: 'bukhari', number: 6018, note: 'Speak good or stay silent' },
      { collection: 'muslim', number: 2626, note: 'A good word is charity' },
    ],
  },
  {
    key: 'daily',
    title: 'Daily worship',
    blurb: 'The steady, small deeds He loves most.',
    refs: [
      { collection: 'bukhari', number: 6464, note: 'The most beloved deeds are consistent ones' },
      { collection: 'bukhari', number: 528, note: 'Five prayers wash the day' },
      { collection: 'muslim', number: 2699, note: 'Gatherings of remembrance' },
    ],
  },
  {
    key: 'knowledge',
    title: 'Seeking knowledge',
    blurb: 'A path made easy toward the Garden.',
    refs: [
      { collection: 'muslim', number: 2699, note: 'A path to Paradise' },
      { collection: 'bukhari', number: 79, note: 'The parable of rain and land' },
      { collection: 'bukhari', number: 100, note: 'How knowledge is taken away' },
    ],
  },
]

export type ArabicWord = {
  ar: string
  tr: string
  en: string
}

export type ArabicGroup = {
  key: string
  title: string
  words: ArabicWord[]
}

// A starter vocabulary of very common Qur'anic words, grouped by theme.
export const ARABIC_GROUPS: ArabicGroup[] = [
  {
    key: 'worship',
    title: 'Worship & faith',
    words: [
      { ar: 'صَلَاة', tr: 'ṣalāh', en: 'prayer' },
      { ar: 'إِيمَان', tr: 'īmān', en: 'faith' },
      { ar: 'ذِكْر', tr: 'dhikr', en: 'remembrance' },
      { ar: 'دُعَاء', tr: 'duʿāʾ', en: 'supplication' },
      { ar: 'صَوْم', tr: 'ṣawm', en: 'fasting' },
      { ar: 'زَكَاة', tr: 'zakāh', en: 'almsgiving' },
      { ar: 'سُجُود', tr: 'sujūd', en: 'prostration' },
      { ar: 'تَقْوَى', tr: 'taqwā', en: 'God-consciousness' },
    ],
  },
  {
    key: 'time',
    title: 'Time & the day',
    words: [
      { ar: 'يَوْم', tr: 'yawm', en: 'day' },
      { ar: 'لَيْل', tr: 'layl', en: 'night' },
      { ar: 'فَجْر', tr: 'fajr', en: 'dawn' },
      { ar: 'عَصْر', tr: 'ʿaṣr', en: 'late afternoon; era' },
      { ar: 'سَاعَة', tr: 'sāʿah', en: 'hour' },
      { ar: 'شَهْر', tr: 'shahr', en: 'month' },
      { ar: 'سَنَة', tr: 'sanah', en: 'year' },
      { ar: 'صَبَاح', tr: 'ṣabāḥ', en: 'morning' },
    ],
  },
  {
    key: 'people',
    title: 'People & family',
    words: [
      { ar: 'إِنسَان', tr: 'insān', en: 'human being' },
      { ar: 'قَوْم', tr: 'qawm', en: 'people' },
      { ar: 'وَالِد', tr: 'wālid', en: 'father' },
      { ar: 'أُمّ', tr: 'umm', en: 'mother' },
      { ar: 'أَخ', tr: 'akh', en: 'brother' },
      { ar: 'أُخْت', tr: 'ukht', en: 'sister' },
      { ar: 'وَلَد', tr: 'walad', en: 'child' },
      { ar: 'أَهْل', tr: 'ahl', en: 'family; people of' },
    ],
  },
  {
    key: 'nature',
    title: 'Nature & cosmos',
    words: [
      { ar: 'سَمَاء', tr: 'samāʾ', en: 'sky, heaven' },
      { ar: 'أَرْض', tr: 'arḍ', en: 'earth' },
      { ar: 'شَمْس', tr: 'shams', en: 'sun' },
      { ar: 'قَمَر', tr: 'qamar', en: 'moon' },
      { ar: 'نُور', tr: 'nūr', en: 'light' },
      { ar: 'مَاء', tr: 'māʾ', en: 'water' },
      { ar: 'جَبَل', tr: 'jabal', en: 'mountain' },
      { ar: 'بَحْر', tr: 'baḥr', en: 'sea' },
    ],
  },
  {
    key: 'verbs',
    title: 'Common verbs',
    words: [
      { ar: 'قَالَ', tr: 'qāla', en: 'he said' },
      { ar: 'عَلِمَ', tr: 'ʿalima', en: 'he knew' },
      { ar: 'آمَنَ', tr: 'āmana', en: 'he believed' },
      { ar: 'عَمِلَ', tr: 'ʿamila', en: 'he did, worked' },
      { ar: 'قَرَأَ', tr: 'qaraʾa', en: 'he read, recited' },
      { ar: 'كَتَبَ', tr: 'kataba', en: 'he wrote; decreed' },
      { ar: 'صَبَرَ', tr: 'ṣabara', en: 'he was patient' },
      { ar: 'شَكَرَ', tr: 'shakara', en: 'he was grateful' },
    ],
  },
  {
    key: 'qualities',
    title: 'Qualities & concepts',
    words: [
      { ar: 'رَحْمَة', tr: 'raḥmah', en: 'mercy' },
      { ar: 'عِلْم', tr: 'ʿilm', en: 'knowledge' },
      { ar: 'صِدْق', tr: 'ṣidq', en: 'truthfulness' },
      { ar: 'صَبْر', tr: 'ṣabr', en: 'patience' },
      { ar: 'شُكْر', tr: 'shukr', en: 'gratitude' },
      { ar: 'عَدْل', tr: 'ʿadl', en: 'justice' },
      { ar: 'خَيْر', tr: 'khayr', en: 'good' },
      { ar: 'حَقّ', tr: 'ḥaqq', en: 'truth, right' },
    ],
  },
]
