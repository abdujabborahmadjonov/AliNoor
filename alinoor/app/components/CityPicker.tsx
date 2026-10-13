'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  CITIES,
  City,
  findCity,
  searchCities,
  utcOffsetLabel,
} from '@/lib/cities'

// A searchable city select: type a city, country, timezone or UTC offset.
export default function CityPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (name: string) => void
}) {
  const listId = useId()
  const listRef = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const current = findCity(value)

  const results = useMemo(() => searchCities(query), [query])
  // Recomputed per opening so a DST change mid-session still shows right.
  const offsets = useMemo(
    () => (open ? new Map(CITIES.map((c) => [c.tz, utcOffsetLabel(c.tz)])) : null),
    [open]
  )

  useEffect(() => {
    if (!open) return
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  const openList = () => {
    if (open) return
    setQuery('')
    setActive(Math.max(0, CITIES.findIndex((c) => c.name === current.name)))
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  const choose = (c: City) => {
    onChange(c.name)
    close()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) return openList()
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive((i) => Math.min(Math.max(i + step, 0), results.length - 1))
    } else if (e.key === 'Enter' && open) {
      e.preventDefault()
      if (results[active]) choose(results[active])
    } else if (e.key === 'Escape' && open) {
      e.preventDefault()
      close()
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        role="combobox"
        aria-label="City"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && results[active] ? `${listId}-${active}` : undefined
        }
        autoComplete="off"
        spellCheck={false}
        value={open ? query : `${current.name} · ${current.country}`}
        placeholder="Search city, country or UTC offset"
        onFocus={openList}
        onClick={openList}
        onBlur={close}
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
          setOpen(true)
        }}
        onKeyDown={onKeyDown}
        className="w-full px-4 py-2.5 pr-9 border border-line rounded-lg bg-panel text-ink text-sm placeholder:text-faint focus:outline-none focus:border-linestrong"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mute text-xs"
      >
        {open ? '⌕' : '▾'}
      </span>

      {open && (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          aria-label="Cities"
          className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto bg-panel border border-line rounded-lg shadow-pop py-1"
        >
          {results.length === 0 ? (
            <li className="px-4 py-2.5 text-sm text-mute">
              No city matches “{query.trim()}”
            </li>
          ) : (
            results.map((c, i) => (
              <li
                key={c.name}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                // Keep focus in the input so blur doesn't close before the click.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(c)}
                onMouseMove={() => i !== active && setActive(i)}
                className={`flex items-center justify-between gap-3 px-4 py-2 text-sm cursor-pointer ${
                  i === active ? 'bg-panel2' : ''
                }`}
              >
                <span className="truncate">
                  <span
                    className={
                      c.name === current.name ? 'text-ink font-semibold' : 'text-ink2'
                    }
                  >
                    {c.name}
                  </span>
                  <span className="text-mute"> · {c.country}</span>
                </span>
                <span className="font-mono text-[11px] text-mute flex-shrink-0">
                  {offsets?.get(c.tz)}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
