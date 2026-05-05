# 보안 주의 사항

## API 키 노출 대응 절차

클라이언트 HTML(index.html)에 API 키가 포함된 경우, 해당 키는 이미 외부에 노출된 것으로 간주해야 합니다.
브라우저 개발자 도구, 공개 저장소, CDN 캐시 등 다양한 경로를 통해 제3자가 키를 수집했을 가능성이 있습니다.

---

## 즉시 해야 할 일

### 1. 노출된 키 비활성화

1. [Google Cloud Console](https://console.cloud.google.com/) 에 로그인합니다.
2. **API 및 서비스 > 사용자 인증 정보** 메뉴로 이동합니다.
3. 노출된 API 키를 찾아 **비활성화** 또는 **삭제**합니다.

### 2. 새 키 발급

1. **사용자 인증 정보 만들기 > API 키**를 선택합니다.
2. 새 키를 발급받고, 가능하면 **API 제한** 및 **IP 제한**을 설정합니다.
3. 새 키는 반드시 서버 `.env` 파일에만 저장합니다.

### 3. Git 히스토리 확인

GitHub 등 공개 저장소에 키가 커밋된 이력이 있다면, `git log`에 키 값이 남아 있을 수 있습니다.
히스토리에 키가 포함된 경우 키 삭제만으로는 충분하지 않으며, **키 회전이 필수**입니다.

> 과거 커밋에서 키를 삭제하려면 `git filter-repo` 또는 GitHub의 **Secret scanning** 기능을 활용할 수 있습니다.

---

## API 키 관리 원칙

| 항목 | 올바른 위치 | 절대 금지 |
|------|-------------|-----------|
| `GEMINI_API_KEY` | 서버 `.env` | 프론트엔드 코드, HTML |
| `AMADEUS_API_KEY` | 서버 `.env` | 프론트엔드 코드, HTML |
| `AMADEUS_API_SECRET` | 서버 `.env` | 프론트엔드 코드, HTML |

- 프론트엔드(HTML, JS 번들, 환경변수 접두사 `VITE_` / `REACT_APP_` 등)에는 시크릿을 절대 포함하지 않습니다.
- `.env.example`에는 키 이름만 두고 값은 비워 둡니다.
- 실제 `.env` 파일은 `.gitignore`에 포함되어 있어야 하며, 저장소에 커밋하지 않습니다.

---

## .env 파일 구조

```
# .env.example (저장소에 커밋 가능 — 값 없음)
GEMINI_API_KEY=
AMADEUS_API_KEY=
AMADEUS_API_SECRET=

# .env (로컬/서버 전용 — 절대 커밋 금지)
GEMINI_API_KEY=<서버 .env에만 입력>
AMADEUS_API_KEY=실제값
AMADEUS_API_SECRET=<서버 .env에만 입력>
```

---

## 체크리스트

- [ ] 노출된 Gemini API 키를 Google Cloud Console에서 비활성화/삭제했다
- [ ] 새 API 키를 발급하고 서버 `.env`에만 저장했다
- [ ] `backend/.env`가 `.gitignore`에 포함되어 있고 git에 추적되지 않는다
- [ ] `index.html` 또는 프론트엔드 코드에 API 키가 포함되어 있지 않다
- [ ] Git 히스토리에 키가 남아 있다면 키 회전을 완료했다
