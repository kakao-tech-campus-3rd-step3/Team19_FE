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
