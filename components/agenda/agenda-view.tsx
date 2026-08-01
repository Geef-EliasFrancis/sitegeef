'use client';

import { useMemo, useState } from 'react';
import { IconSearch, IconX } from '@/components/icons';
import type { PublicAgendaEvent } from '@/lib/agenda/public-agenda';

type AgendaEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'estudo' | 'acolhimento' | 'publica' | 'evangelizacao';
};

const weekdayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + mondayOffset);
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
}

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatAgendaDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(`${value}T12:00:00`));
}

export function AgendaView({ events: publicEvents }: { events: PublicAgendaEvent[] }) {
  const today = useMemo(() => new Date(), []);
  const [week, setWeek] = useState(() => startOfWeek(today));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mobileDay, setMobileDay] = useState(0);
  const events: AgendaEvent[] = publicEvents.map((event) => ({ ...event, category: 'publica' }));

  const days = useMemo(() => weekdayNames.map((label, index) => {
    const date = new Date(week);
    date.setDate(week.getDate() + index);
    return { label, date };
  }), [week]);

  const visibleEvents = events.filter((event) => event.title.toLowerCase().includes(query.toLowerCase()));
  const selected = events.find((event) => event.id === selectedId);
  const monthValue = `${week.getFullYear()}-${String(week.getMonth() + 1).padStart(2, '0')}`;

  const moveWeek = (amount: number) => {
    const next = new Date(week);
    next.setDate(next.getDate() + amount * 7);
    setWeek(next);
  };

  const setMonth = (value: string) => {
    const [year, month] = value.split('-').map(Number);
    const next = new Date(year, month - 1, 1);
    setWeek(startOfWeek(next));
  };

  return (
    <main className="agenda-page">
      <header className="agenda-header">
        <div>
          <span className="agenda-eyebrow">GEEF</span>
          <h1>Agenda</h1>
          <p>{formatDate(days[0].date)} — {formatDate(days[6].date)}</p>
        </div>
        <div className="agenda-toolbar" aria-label="Controles da agenda">
          <button className="agenda-icon-button" onClick={() => moveWeek(-1)} aria-label="Semana anterior" title="Semana anterior">‹</button>
          <button className="agenda-today-button" onClick={() => setWeek(startOfWeek(today))} title="Voltar para esta semana">Hoje</button>
          <button className="agenda-icon-button" onClick={() => moveWeek(1)} aria-label="Próxima semana" title="Próxima semana">›</button>
          <label className="agenda-picker" title="Trocar mês e ano">
            <span aria-hidden="true">▦</span>
            <input type="month" value={monthValue} onChange={(event) => setMonth(event.target.value)} aria-label="Escolher mês e ano" />
          </label>
          <button className="agenda-icon-button" onClick={() => setSearchOpen((open) => !open)} aria-label={searchOpen ? 'Fechar busca' : 'Abrir busca'} title={searchOpen ? 'Fechar busca' : 'Buscar'}>
            {searchOpen ? <IconX size={18} /> : <IconSearch size={18} />}
          </button>
        </div>
      </header>

      {searchOpen && (
        <div className="agenda-search-row">
          <IconSearch size={16} />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar atividade" aria-label="Buscar atividade" />
        </div>
      )}

      <div className="agenda-layout">
        <section className="agenda-board" aria-label="Semana de atividades">
          <div className="agenda-mobile-day-switcher" aria-label="Navegar pelos dias">
            <button className="agenda-icon-button" onClick={() => setMobileDay((day) => (day + 6) % 7)} aria-label="Dia anterior">‹</button>
            <strong>{weekdayNames[mobileDay]}</strong>
            <button className="agenda-icon-button" onClick={() => setMobileDay((day) => (day + 1) % 7)} aria-label="Próximo dia">›</button>
          </div>
          <div className="agenda-week-grid">
            {days.map(({ label, date }, index) => {
              const dayKey = localDateKey(date);
              const dayEvents = visibleEvents.filter((event) => event.date === dayKey);
              return (
                <article className={`agenda-day agenda-day-${index} ${mobileDay === index ? 'is-mobile-active' : ''}`} key={label}>
                  <header className="agenda-day-header">
                    <span>{label}</span>
                    <time dateTime={date.toISOString()}>{date.getDate()}</time>
                  </header>
                  <div className="agenda-day-events">
                    {dayEvents.length === 0 ? <span className="agenda-empty">—</span> : dayEvents.map((event) => (
                      <button key={event.id} className={`agenda-event agenda-event--${event.category} ${selectedId === event.id ? 'is-selected' : ''}`} onClick={() => setSelectedId(selectedId === event.id ? null : event.id)} aria-expanded={selectedId === event.id}>
                        <span className="agenda-event-time">Dia marcado</span>
                        <strong>{event.title}</strong>
                        <span className="agenda-event-chevron" aria-hidden="true">{selectedId === event.id ? '−' : '+'}</span>
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="agenda-next" aria-label="Próximos eventos">
          <div className="agenda-section-heading"><span>Próximos</span><span aria-hidden="true">✦</span></div>
          {events.slice(0, 3).map((event) => <button key={event.id} className="agenda-next-item" onClick={() => setSelectedId(event.id)}><time>{formatAgendaDate(event.date)}</time><span>{event.title}</span></button>)}
        </aside>
      </div>

      {selected && <div className="agenda-detail" role="dialog" aria-label={`Detalhes de ${selected.title}`}><button className="agenda-detail-close" onClick={() => setSelectedId(null)} aria-label="Fechar detalhes" title="Fechar"><IconX size={16} /></button><span>{formatAgendaDate(selected.date)}</span><h2>{selected.title}</h2><p>{selected.description}</p></div>}
    </main>
  );
}
