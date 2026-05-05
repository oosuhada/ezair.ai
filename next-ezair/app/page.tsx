import { AiSearchBox } from '@/components/AiSearchBox';
import { Header } from '@/components/Header';
import { SearchForm } from '@/components/SearchForm';

export default function Page() {
  return (
    <>
      <Header />
      <main className="container" style={{ display: 'grid', gap: 20, paddingBottom: 60 }}>
        <section className="card" style={{ background: 'linear-gradient(135deg, #dbeafe, #ffffff)' }}>
          <h1 style={{ fontSize: 42, margin: 0 }}>EZ AIR</h1>
          <p>Gemini와 Amadeus를 서버에서 안전하게 연결하는 Next.js 풀스택 마이그레이션 scaffold입니다.</p>
        </section>
        <AiSearchBox />
        <SearchForm />
      </main>
    </>
  );
}
