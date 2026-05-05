'use client';

import { FormEvent, useState } from 'react';
import { FlightResults, type FlightResult } from './FlightResults';

export function AiSearchBox() {
  const [query, setQuery] = useState('다음주 금요일 서울에서 제주도 직항 2명');
  const [insight, setInsight] = useState('');
  const [flights, setFlights] = useState<FlightResult[]>([]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setInsight('AI가 검색 조건을 분석 중입니다...');
    const response = await fetch('/api/ai/flight-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    if (!response.ok) {
      setInsight(data.message || data.error || 'AI 검색 실패');
      return;
    }
    if (data.mode === 'CLARIFICATION') {
      setInsight(data.question || '추가 정보가 필요합니다.');
      setFlights([]);
      return;
    }
    setInsight(data.aiInsight || '검색 결과입니다.');
    setFlights(data.flights || []);
  }

  return (
    <section className="card">
      <h2>AI 자연어 검색</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} />
        <button className="primary-button" type="submit">AI 검색</button>
      </form>
      <p>{insight}</p>
      <FlightResults flights={flights} />
    </section>
  );
}
