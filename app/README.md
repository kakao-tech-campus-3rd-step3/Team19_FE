# [충남대 1팀] 무쉼사: 무더위쉼터를 찾는 사람들

## 📱 Android 앱

무쉼사 하이브리드 앱의 Android 네이티브 부분입니다.

## 🛠️ 개발 환경

- **Android Studio**: Arctic Fox 이상
- **Kotlin**: 1.8.0 이상
- **Gradle**: 8.0 이상
- **Target SDK**: 34
- **Min SDK**: 24

## 🚀 실행 방법

### 1. Android Studio에서 프로젝트 열기

⚠️ **중요**: 루트 폴더가 아닌 **app 폴더**를 열어야 합니다!

```bash
# Android Studio 실행 후
File → Open → Team19_FE/app 폴더 선택 (루트 폴더 X)
```

**이유**: 현재 프로젝트는 하이브리드 구조로 `web/`와 `app/` 폴더가 분리되어 있습니다. 루트 폴더를 열면 Android Studio가 Android 프로젝트임을 인식하지 못해 Run 버튼이 활성화되지 않습니다.

### 2. SDK 설정 확인

- Android Studio가 자동으로 `local.properties` 파일을 생성합니다
- SDK 경로가 올바르게 설정되었는지 확인하세요

### 3. 디바이스 연결

- **실제 디바이스**: USB 디버깅 활성화 후 연결
- **에뮬레이터**: AVD Manager에서 가상 디바이스 생성

### 4. 빌드 및 실행

```bash
# 터미널에서 실행
./gradlew assembleDebug

# 또는 Android Studio에서
Run → Run 'app'
```

## 📁 프로젝트 구조

### 전체 프로젝트 구조

```
Team19_FE/   # 루트 폴더
├── web/     # React 웹 앱
└── app/     # Android 앱 (이 폴더를 Android Studio에서 열기)
```

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

## 🔧 주요 기능

- **하이브리드 앱**: WebView를 통한 웹 콘텐츠 표시
- **무더위쉼터 정보**: 근처 무더위쉼터 검색 및 표시
- **지도 연동**: 위치 기반 서비스 제공

## 📝 버전 히스토리

### v2.4 (2025-11-06)

- 길안내 종료 후 리뷰 작성 푸시 알림 기능 추가
  - GuidePage: 도착 확인 시 `POST /api/shelters/{shelterId}/arrival` API 호출
  - BE: 10분 후 FCM 푸시 발송 (`type: REVIEW_REMINDER`, `shelterId`, `shelterName` 포함)
  - MainActivity: REVIEW_REMINDER 알림 클릭 시 `/shelter-detail/{shelterId}?openReview=true`로 라우팅
  - ShelterDetailPage: `openReview` 파라미터 감지 시 자동으로 리뷰 작성 페이지로 이동
  - 효과: 앱 종료 상태에서도 알림 클릭 시 정확한 쉼터의 리뷰 작성 페이지로 이동, 기존 로직 재사용으로 안정성 확보
- Vercel SPA 라우팅 설정 추가
  - `vercel.json` 추가: 모든 경로를 `index.html`로 rewrite 설정
  - 직접 URL 접근 시 404 에러 해결 (딥링크 정상 동작)
- 앱 버전 업데이트: `versionCode=5`, `versionName=2.4`
- 앱 라벨 업데이트: "무더위 쉼터를 찾는 사람들 v2.4"

### v2.3 (2025-11-06)

- WebView 이미지 업로드 지원 추가 (`<input type="file">` 동작)
  - `WebChromeClient.onShowFileChooser` 구현, `onActivityResult`에서 선택 URI 반환
  - 파일 접근 허용: `allowFileAccess`, `allowContentAccess` 활성화
  - 런타임 권한 처리: Android 13+ `READ_MEDIA_IMAGES`, Android 12 이하 `READ_EXTERNAL_STORAGE`
  - 이미지 선택 인텐트: 기본 `ACTION_OPEN_DOCUMENT`(영구 권한 시도), 대체 `ACTION_GET_CONTENT`
- WebView 로드 URL 변경: `https://team19-fe-rr1d.vercel.app/` → `https://musuimsa-pi.vercel.app/`
  - 적용 위치: `MainActivity.kt`의 `loadWeb()` 내 `vercelUrl`
- 앱 버전 업데이트: `versionCode=4`, `versionName=2.3`
- 앱 라벨 업데이트: `app_name` → "무더위 쉼터를 찾는 사람들 v2.3"
- 효과: `/edit-profile`, `/edit-review/:id`, `/write-review/:shelterId` 페이지의 사진 업로드 버튼이 앱(WebView)에서도 정상 동작

### v2.2 (2025-11-05)

- FCM 푸시 알림 기본 탑재 및 앱-웹 연동
  - Android: `POST_NOTIFICATIONS` 권한(13+) 요청 추가
  - Android: `MyFirebaseMessagingService` 구현 (토큰 저장, 메시지 수신, 알림 표시)
  - Android: 알림 클릭 시 `MainActivity`로 딥링크 전달 → WebView에서 `/find-shelters?from=notification` 이동 및 안내 토스트 표시
  - Android: `AndroidBridge.getDeviceToken()` 제공 (웹에서 FCM 토큰 조회)
  - Web: `pushApi.ts` 추가 (`/api/users/me/device`, `/api/users/me/location` 연동)
  - Web: `usePushNotification` 훅 추가(앱 시작/로그인 시 토큰·위치 자동 등록), `App.tsx`에 연결
- 버전 업데이트: `versionCode=3`, `versionName=2.2`

### v2.1 (2025-11-04)

- 세로모드 강제 (AndroidManifest.xml)
- 메인 페이지에서 뒤로가기 시 종료 확인 다이얼로그 추가 (큰 글씨 스타일)
- 메인 페이지에서 뒤로가기 시 히스토리와 관계없이 종료 확인 다이얼로그 표시
- 앱 시작 시 선제 토큰 재발급으로 7일 로그인 유지 보장
- 로그아웃 시 WebView 쿠키 삭제 (JS 브릿지)
- Android 네이티브 TTS 구현 (GuidePage 음성 안내, Android 13 호환 테스트 완료)

### v2 (2025-10-15)

- 회원가입/로그인/로그아웃 기능 구현
- 토큰 기반 인증 시스템 (쿠키+토큰 하이브리드)
- 401 자동 재발급 및 세션 유지
- WebView 쿠키/localStorage 지원 설정
- 로그인 가드 (NavBar 프로필 버튼)
- HTTPS 개발 환경 및 프록시 설정

### v1 (2024-09-05)

- Vercel 링크 WebView 앱 구현
- 위치 권한 요청 시스템 (첫 구동 시 강제 동의)
- Geolocation API 연동 (WebView 브릿지)
- 액션바 제거 및 상태바 검정색 테마 적용
- 스플래시 배경 검정색 처리
