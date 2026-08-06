// Adhan recordings served by aladhan.com's CDN. Each id maps to a file that
// was checked to return audio/mpeg and to support range requests, so seeking
// and mid-file starts work.
export type AdhanVoice = {
  id: string
  name: string
  file: string
}

export const ADHAN_VOICES: AdhanVoice[] = [
  { id: 'a1', name: 'Ahmad al-Nafees', file: 'a1' },
  { id: 'a2', name: 'Hafiz Mustafa Özcan', file: 'a2' },
  { id: 'a4', name: 'Mishary Rashid Alafasy · Dubai One', file: 'a4' },
  { id: 'a7', name: 'Mishary Rashid Alafasy', file: 'a7' },
  { id: 'a9', name: 'Mishary Rashid Alafasy · II', file: 'a9' },
  {
    id: 'a11',
    name: 'Mansour Al-Zahrani',
    file: 'a11-mansour-al-zahrani',
  },
]

export const adhanUrl = (voiceId: string): string => {
  const voice =
    ADHAN_VOICES.find((v) => v.id === voiceId) || ADHAN_VOICES[0]
  return `https://cdn.aladhan.com/audio/adhans/${voice.file}.mp3`
}
