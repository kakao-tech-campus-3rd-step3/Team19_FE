# [충남대 1팀] 무쉼사: 무더위쉼터를 찾는 사람들

## 🌐 Web (React)

무쉼사 웹(React/Vite) 프로젝트입니다.

## 🛠️ 개발 환경

- **Node.js**: 22.15.1 (`.nvmrc` 참고)
- **Vite**: React 개발 서버 및 빌드 도구
- **TypeScript**
- **Emotion**: CSS-in-JS 스타일링
- **주요 라이브러리**: react-router-dom, react-icons 등

## 🚀 실행 방법

### 1. Node.js 설치

- `.nvmrc` 파일의 버전(22.15.1)과 동일한 Node.js를 사용하세요.
  ```
  nvm install 22.15.1
  nvm use 22.15.1
  ```

### 2. 의존성 설치

```bash
cd web
npm install
```

### 3. 개발 서버 실행

```bash
cd web
npm run dev
```

- 기본적으로 [http://localhost:5173](http://localhost:5173)에서 앱이 실행됩니다.

## 📁 프로젝트 구조

```
web/
├── public/                # 정적 파일
├── src/                   # 소스 코드
│   ├── assets/            # 이미지 등 에셋
│   ├── components/        # 공통 컴포넌트
│   ├── mock/              # 목(mock) 데이터
│   ├── pages/             # 페이지별 폴더
│   ├── styles/            # 스타일 및 테마
│   └── utils/             # 유틸 함수
├── .nvmrc                 # Node.js 버전 명시
├── package.json           # 패키지 관리
├── tsconfig.json          # TypeScript 설정
└── vite.config.ts         # Vite 설정
```

## 🔧 주요 기능

- **무더위쉼터 검색 및 상세 정보**
- **카카오맵 연동**
- **사용자 로그인 시 기능**
  - **리뷰 작성 및 별점**
  - **찜(즐겨찾기) 기능**
- **반응형 UI**
