'use client';

import { FormEvent, useState } from 'react';
import { FlightResults, type FlightResult } from './FlightResults';

export function SearchForm() {
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage('검색 중...');
    const payload = {
      origin: String(form.get('origin') || 'ICN').toUpperCase(),
      destination: String(form.get('destination') || 'CJU').toUpperCase(),
      departDate: String(form.get('departDate') || ''),
      returnDate: String(form.get('returnDate') || '') || null,
      adults: Number(form.get('adults') || 1),
      travelClass: String(form.get('travelClass') || 'ECONOMY'),
      nonStop: Boolean(form.get('nonStop')),
    };
    const response = await fetch('/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || data.error || '검색 실패');
      return;
    }
    setFlights(data.flights || []);
    setMessage(`${(data.flights || []).length}개 결과`);
  }

  return (
    <section className="card">
      <h2>폼 기반 항공권 검색</h2>
      <form className="grid" onSubmit={onSubmit}>
        <label className="field">출발지 IATA<input className="input" name="origin" defaultValue="ICN" /></label>
        <label className="field">도착지 IATA<input className="input" name="destination" defaultValue="CJU" /></label>
        <label className="field">출발일<input className="input" name="departDate" type="date" required /></label>
        <label className="field">귀국일<input className="input" name="returnDate" type="date" /></label>
        <label className="field">성인<input className="input" name="adults" type="number" min="1" max="9" defaultValue="1" /></label>
        <label className="field">좌석<select className="input" name="travelClass" defaultValue="ECONOMY"><option>ECONOMY</option><option>BUSINESS</option><option>FIRST</option></select></label>
        <label><input name="nonStop" type="checkbox" /> 직항만</label>
        <button className="primary-button" type="submit">검색</button>
      </form>
      <p>{message}</p>
      <FlightResults flights={flights} />
    </section>
  );
}
