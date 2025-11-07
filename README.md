![alt text](./web/src/assets/images/image-1.png)

## 💡 프로젝트 소개

> **무더위쉼터를 찾는 사람들**은 폭염 시 사용자가 **현재 위치를 기준으로 가장 가까운 쉼터를 빠르게 찾을 수 있도록 돕는 서비스**입니다.

- 🌐 **서비스 URL**: [https://musuimsa-pi.vercel.app/](https://musuimsa-pi.vercel.app/)

---

### 🗓️ 개발 기간

> **2025.08.01 ~ 2025.11.06 (약 12주)**

---

### 🧩 프로젝트 형태

- **App**: Android 네이티브 (Kotlin)
- **Web**: React + Vite (TypeScript)
- **최종 형태**: WebView 기반 **하이브리드 앱**

## 🧑‍🤝‍🧑 팀원 소개 (Team 19)

### 💻 Frontend

|                                              Frontend                                              |                                             Frontend                                              |
| :------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------: |
| <img src="https://avatars.githubusercontent.com/u/195718822?v=4" width="100" alt="고은채 프로필"/> | <img src="https://avatars.githubusercontent.com/u/81281798?v=4" width="100" alt="정지원 프로필"/> |
|                              [고은채](https://github.com/eunchae-04)                               |                               [정지원](https://github.com/jjw5655)                                |
|                                            FE 테크리더                                             |                                              플래너                                               |

### 💾 Backend

|                                              Backend                                               |                                              Backend                                               |                                              Backend                                              |
| :------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------: |
| <img src="https://avatars.githubusercontent.com/u/146078205?v=4" width="100" alt="박수화 프로필"/> | <img src="https://avatars.githubusercontent.com/u/187789828?v=4" width="100" alt="윤아란 프로필"/> | <img src="https://avatars.githubusercontent.com/u/73630653?v=4" width="100" alt="이어진 프로필"/> |
|                              [박수화](https://github.com/hydrationn)                               |                               [윤아란](https://github.com/uvrvuoon)                                |                                [이어진](https://github.com/win929)                                |
|                                                팀장                                                |                                               메이커                                               |                                            BE 테크리더                                            |

## ✨ 주요 기능 (사용자)

- 📍 **현재 위치 확인**
- 🏠 **가까운 무더위 쉼터 확인**
- 🚶 **길찾기 및 음성 안내(TTS)**
- ☀️ **날씨 확인**
- 📝 **리뷰 작성/조회**
- ⭐ **쉼터 찜 추가/삭제**

## 🔗 외부 API 연동

- **지도 API**: 쉼터 위치 지도 표시
- **길찾기 API**: 쉼터까지 경로 안내
- **TTS API**: 길찾기 경로 음성 안내
- **기상청 날씨 API**: 현재 기온/날씨 정보 제공

## 🔧 기술 스택

### 🌐 Web (Frontend)

![React](https://img.shields.io/badge/React-61DAFB.svg?style=for-the-badge&logo=React&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF.svg?style=for-the-badge&logo=Vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=TypeScript&logoColor=white)
![Emotion](https://img.shields.io/badge/Emotion-C865B9?style=for-the-badge&logo=emotion&logoColor=white)
![ReactRouter](https://img.shields.io/badge/React%20Router-CA4245.svg?style=for-the-badge&logo=ReactRouter&logoColor=white)
![ReactQuery](https://img.shields.io/badge/React%20Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![ReactIcons](https://img.shields.io/badge/react--icons-6DB33F?style=for-the-badge&logo=react&logoColor=white)
![Tmap SDK](https://img.shields.io/badge/Tmap%20SDK-0078D7?style=for-the-badge&logo=mapbox&logoColor=white)
![Fetch API](https://img.shields.io/badge/Fetch%20API-02569B?style=for-the-badge&logo=javascript&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

- React + Vite 기반의 SPA
- Emotion으로 스타일링, React Query를 통한 서버 상태 관리 및 캐싱
- Vite Proxy로 로컬 API 프록시 구성 / Vercel SPA 배포 설정

---

### 📱 모바일 / 네이티브 (App)

![Android](https://img.shields.io/badge/Android-3DDC84.svg?style=for-the-badge&logo=android&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF.svg?style=for-the-badge&logo=kotlin&logoColor=white)
![Gradle](https://img.shields.io/badge/Gradle-02303A.svg?style=for-the-badge&logo=gradle&logoColor=white)
![WebView](https://img.shields.io/badge/WebView-4285F4.svg?style=for-the-badge&logo=googlechrome&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28.svg?style=for-the-badge&logo=firebase&logoColor=black)
![TTS](https://img.shields.io/badge/Native%20TTS-4285F4?style=for-the-badge&logo=googleassistant&logoColor=white)
![AndroidBridge](https://img.shields.io/badge/AndroidBridge-3DDC84?style=for-the-badge&logo=android&logoColor=white)

- Kotlin 기반 Android 네이티브 앱
- WebView를 통한 React 웹앱 로드 (하이브리드 구조)
- Firebase FCM으로 푸시 알림, 네이티브 TTS로 음성 길안내 지원

---

### 🛠️ 도구 · 빌드 · 린트 · 배포

![Node.js](https://img.shields.io/badge/Node.js-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3.svg?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E.svg?style=for-the-badge&logo=prettier&logoColor=black)
![TypeScript Config](https://img.shields.io/badge/tsconfig.json-007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717.svg?style=for-the-badge&logo=github&logoColor=white)
![GitHubActions](https://img.shields.io/badge/GitHub%20Actions-2088FF.svg?style=for-the-badge&logo=githubactions&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

- ESLint + Prettier로 코드 스타일 관리
- GitHub Actions로 CI/CD 자동화 및 테스트, Vercel로 웹 배포

---

### 🏛️ 아키텍처 · 패턴 · 구조

![ContextAPI](https://img.shields.io/badge/Context%20API-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![ReactQuery](https://img.shields.io/badge/React%20Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![REST API](https://img.shields.io/badge/REST%20API-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Emotion Theme](https://img.shields.io/badge/Emotion%20Theme-C865B9?style=for-the-badge&logo=emotion&logoColor=white)
![Custom Hook](https://img.shields.io/badge/Custom%20Hook-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MapCache](https://img.shields.io/badge/MapCache-4CAF50?style=for-the-badge&logo=mapbox&logoColor=white)
![ComponentBased](https://img.shields.io/badge/Component%20Based-61DAFB?style=for-the-badge&logo=react&logoColor=black)

- Context API + React Query 기반 상태 관리
- MapCache로 지도 데이터 전역 캐싱
- Emotion Theme과 pages/components/hooks 구조화로 유지보수성 향상

## 🏛️ FE 아키텍처 다이어그램

![FE 아키텍처 다이어그램](./web/src/assets/images/fe_architecture.png)

## 📂 전체 프로젝트 구조

```
Team19_FE/   # 루트 폴더
├── web/     # React 웹 앱
└── app/     # Android 앱 (이 폴더를 Android Studio에서 열기)
```

---

### Android 앱 구조 (app/ 폴더 내부)

```
app/
├── app/
│   ├── src/main/
│   │   ├── java/com/example/musuimsa/
│   │   │   └── MainActivity.kt          # 메인 액티비티
│   │   ├── res/                         # 리소스 파일들
│   │   └── AndroidManifest.xml          # 앱 매니페스트
│   ├── build.gradle.kts                 # 앱 레벨 빌드 설정
│   └── proguard-rules.pro               # ProGuard 규칙
├── build.gradle.kts                     # 프로젝트 레벨 빌드 설정
├── gradle.properties                    # Gradle 속성
└── settings.gradle.kts                  # 프로젝트 설정
```

---

### Web 구조 (Web/ 폴더 내부)

```
web/
└─ src/
├─ pages/ # 페이지 컴포넌트
├─ components/ # 재사용 가능한 UI 컴포넌트
├─ hooks/ # 커스텀 훅
├─ utils/ # 공통 유틸 함수 (ex. 날짜 포맷터)
├─ styles/ # 테마, 전역 스타일
└─ assets/ # 이미지, 아이콘, 폰트
```
