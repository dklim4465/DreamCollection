# ✈️ 드림컬랙션 — 팀 프론트엔드 프로젝트

## 🎨 디자인 시스템

`DESIGN.md` 파일에 색상·폰트·간격 토큰이 전부 정의되어 있어요.
모든 색상/크기는 `tailwind.config.js`에 반영되어 있으니 **하드코딩 금지**.

```tsx
// ✅ 올바른 방법
<div className="bg-primary text-on-primary rounded-lg p-stack-md">

// ❌ 하드코딩 금지
<div style={{ background: '#24657e', padding: '16px' }}>
```

---

## 🚀 시작하기 (처음 세팅)

### 1. 필수 설치

| 도구 | 다운로드 | 확인 |
|------|---------|------|
| Node.js LTS | https://nodejs.org | `node -v` |
| Git | https://git-scm.com | `git --version` |
| VS Code | https://code.visualstudio.com | — |

### 2. 설치 및 실행

```bash
# 1) 레포 클론
git clone https://github.com/[팀GitHub]/travelers-hub.git
cd travelers-hub

# 2) 의존성 설치
npm install

# 3) 환경변수 복사
cp .env.example .env

# 4) 개발 서버 실행
npm run dev
# → http://localhost:3000
```

> **백엔드(Spring Boot) 실행 후** `npm run dev` 해야 API 연동 됩니다.
> 백엔드 없이 UI만 확인하려면 `.env`에서 API URL 주석 처리.

---

## 📁 폴더 구조 & 담당

```
src/
├── api/                  # axios API 함수 (담당 D)
│   ├── client.ts         # axios 기본 설정 + JWT 인터셉터
│   ├── auth.ts           # 로그인/회원가입
│   ├── destinations.ts   # 추천 여행지
│   └── community.ts      # 커뮤니티 피드
│
├── components/
│   ├── layout/           # 수정 금지 (팀장 A만)
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── AppLayout.tsx
│   ├── common/           # 공통 컴포넌트 (팀장 A만)
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   └── PrivateRoute.tsx
│   ├── home/             # 담당: A
│   │   ├── HeroCarousel.tsx
│   │   └── QuickActions.tsx
│   ├── community/        # 담당: B
│   │   └── FeedGrid.tsx
│   └── travel/           # 담당: C (추가 예정)
│
├── pages/                # 페이지 단위 컴포넌트
│   ├── HomePage.tsx      # 담당: A ✅
│   ├── CommunityPage.tsx # 담당: B (TODO)
│   ├── MatchingPage.tsx  # 담당: B (TODO)
│   ├── TravelPlanPage.tsx# 담당: C (TODO)
│   └── LoginPage.tsx     # 담당: A ✅
│
├── hooks/                # 커스텀 훅 (3명 각자 1개 이상)
├── store/                # Zustand 전역 상태
│   └── authStore.ts
├── types/                # TypeScript 타입 정의
│   └── index.ts
└── styles/
    └── index.css         # 수정 금지 (팀장 A만)
```

---

## 🌿 Git 브랜치 규칙

```bash
main      → 배포용 (직접 push 금지)
develop   → 통합 브랜치
feature/* → 개인 기능 개발
```

```bash
# 작업 시작
git checkout develop && git pull origin develop
git checkout -b feature/community-card

# 작업 후
git add .
git commit -m "feat: 커뮤니티 카드 컴포넌트 구현"
git push origin feature/community-card
# → GitHub에서 develop 대상 PR 생성
```

| 타입 | 의미 |
|------|------|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `style` | CSS 스타일링 |
| `refactor` | 리팩토링 |
| `docs` | 문서 수정 |

---

## 🎯 컴포넌트 작성 규칙

```tsx
// 1. Props 인터페이스 먼저 정의
interface Props {
  items?: DestinationCard[];   // 선택형은 ? 붙이기
  onSelect?: (id: number) => void;
}

// 2. 샘플 데이터는 컴포넌트 밖에 상수로
const SAMPLE_DATA = [...];

// 3. 컴포넌트 export default
export default function MyComponent({ items = SAMPLE_DATA }: Props) {
  // API 연동은 이 안에서 useQuery로
  return (...);
}
```

---

## ⚠️ 수정 금지 파일 (팀장 A만)

- `src/App.tsx`
- `src/main.tsx`
- `src/components/layout/*`
- `src/components/common/*`
- `src/styles/index.css`
- `tailwind.config.js`
- `vite.config.ts`

필요 시 **팀장에게 요청**하세요.

---

## 🔌 VS Code 추천 확장

`.vscode/extensions.json` 파일 확인 후 설치:
- **ES7+ React Snippets** — 컴포넌트 스니펫
- **Tailwind CSS IntelliSense** — 클래스 자동완성
- **Prettier** — 코드 포맷터
- **GitLens** — Git 히스토리

