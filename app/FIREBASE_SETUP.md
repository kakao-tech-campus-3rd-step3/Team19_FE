# Firebase 설정 가이드 (2025 최신 버전)

FCM 푸시 알림을 사용하려면 Firebase 프로젝트 설정이 필요합니다.

## 📋 설정 단계

### 1. Firebase Console 접속

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. Google 계정으로 로그인 (Gmail 계정 사용)

### 2. 프로젝트 생성

#### 새 프로젝트 만들기

1. Firebase Console 메인 화면에서 **프로젝트 추가** 버튼 클릭
2. **프로젝트 이름 입력**: 예) `무쉼사` 또는 `Musuimsa`
3. **Google Analytics 설정** (선택사항):
   - 기본적으로 체크되어 있음
   - Analytics가 필요 없으면 체크 해제 가능
   - 필요하면 체크하고 기존 Analytics 계정 선택 또는 새 계정 생성
4. **프로젝트 만들기** 버튼 클릭
5. 약 1분 정도 소요 (프로젝트 생성 완료 대기)

#### 기존 프로젝트 사용

- Firebase Console 좌측 상단에서 기존 프로젝트 선택

### 3. Android 앱 등록

#### 3-1. 프로젝트 개요에서 앱 추가

1. Firebase Console 프로젝트 개요 화면에서 **Android 아이콘** 클릭 (또는 화면 중앙의 **Android 앱 추가**)
2. **Android 앱 등록** 단계에서:
   - **Android 패키지 이름**: `com.example.musuimsa` 입력 (⚠️ 정확히 일치해야 함!)
   - **앱 닉네임** (선택사항): `무쉼사`
   - **디버그 서명 인증서 SHA-1** (선택사항): 나중에 추가 가능
3. **앱 등록** 버튼 클릭

#### 3-2. google-services.json 다운로드

1. 앱 등록 후 다음 화면에서 **google-services.json 다운로드** 버튼 클릭
2. 다운로드한 `google-services.json` 파일을 아래 경로에 복사:
   ```
   Team19_FE/
   └── app/
       └── app/
           └── google-services.json  ← 여기에 복사 (기존 플레이스홀더 파일 교체)
   ```
3. **다음** 버튼 클릭 (추가 설정 단계는 건너뛰어도 됨)

### 4. Cloud Messaging 설정

1. Firebase Console에서 **⚙️ 프로젝트 설정** → **클라우드 메시징** 탭 이동
2. **Firebase Cloud Messaging API (V1)**이 '사용 설정됨'으로 되어 있는지 확인합니다.
   - (참고) `Cloud Messaging API (Legacy)`는 '사용 중지됨'으로 표시되는 것이 정상입니다. (2024년 6월 20일 지원 종료)

### 5. Android Studio에서 Gradle Sync

1. Android Studio에서 프로젝트 열기
   - ⚠️ **중요**: `app/` 폴더를 열어야 함 (루트 폴더 X)
   - File → Open → `Team19_FE/app` 폴더 선택
2. **File → Sync Project with Gradle Files** 실행 (또는 상단 Sync 아이콘 클릭)
3. Gradle 동기화 완료 대기 (1-2분 소요)
4. 빌드 성공 확인:
   - Build → Make Project (Ctrl+F9)
   - 에러가 없으면 성공!

### 6. 확인 사항 체크리스트

설정이 제대로 되었는지 확인하세요:

- [ ] `app/app/google-services.json` 파일이 존재하고 플레이스홀더가 아닌 실제 파일인가?
- [ ] Gradle Sync가 성공적으로 완료되었는가?
- [ ] 빌드 에러가 없는가?
- [ ] Firebase Console에서 앱이 등록되어 있는가?

## 🔍 설정 확인 방법

### google-services.json 파일 확인

다운로드한 `google-services.json` 파일을 열어서 다음 내용이 포함되어 있는지 확인:

```json
{
  "project_info": {
    "project_id": "실제-프로젝트-ID",
    "project_number": "숫자",
    ...
  },
  "client": [
    {
      "client_info": {
        "android_client_info": {
          "package_name": "com.example.musuimsa"  ← 이 값 확인!
        },
        ...
      }
    }
  ]
}
```

⚠️ **중요**: `package_name`이 `com.example.musuimsa`와 정확히 일치해야 합니다!

### 패키지 이름 일치 확인

다음 3곳의 패키지 이름이 모두 일치해야 합니다:

1. **Firebase Console**: Android 앱 등록 시 입력한 패키지 이름
2. **google-services.json**: `client[0].client_info.android_client_info.package_name`
3. **build.gradle.kts**: `defaultConfig.applicationId`

현재 프로젝트에서는 모두 `com.example.musuimsa`여야 합니다.

## 🔐 서비스 계정 키 전달 (백엔드 팀)

백엔드에서 푸시를 발송하려면 (Legacy) '서버 키'가 아닌 **'서비스 계정 키(JSON 파일)'**가 필요합니다.

1. Firebase Console → **⚙️ 프로젝트 설정**
2. 상단 탭에서 **서비스 계정** 선택
3. **[새 비공개 키 생성]** 버튼 클릭
4. 경고창에서 **[키 생성]** 버튼을 눌러 `.json` 파일 다운로드
5. 다운로드한 **JSON 파일 전체**를 백엔드 팀에 안전하게 전달 (환경 변수로 관리 권장)

## 🧪 테스트 방법

### 1. FCM 토큰 확인 (코드 구현 후)

앱을 실행하면 Logcat에 FCM 토큰이 출력됩니다:

- Android Studio 하단 **Logcat** 탭 열기
- 필터: `FCM` 또는 `Firebase` 입력
- 앱 실행 시 토큰 출력 확인

```
[FCM] Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (긴 토큰 문자열)
```

### 2. Firebase Console에서 테스트 메시지 전송

1. Firebase Console 좌측 메뉴에서 **Cloud Messaging** 클릭
2. **새 알림 전송** 버튼 클릭
3. **알림 작성**:
   - **알림 제목**: `테스트`
   - **알림 텍스트**: `푸시 알림 테스트입니다`
4. **대상 선택**:
   - **단일 기기** 선택 (앱을 실행한 기기의 FCM 토큰 입력)
   - 또는 **앱** 선택 → `com.example.musuimsa` 선택
5. **전송** 버튼 클릭
6. 앱에서 알림이 수신되는지 확인

### 3. 로컬 테스트 (앱 실행 중)

앱이 실행 중일 때 테스트 메시지를 보내면:

- 앱이 포그라운드에 있으면: `onMessageReceived()` 콜백에서 처리
- 앱이 백그라운드에 있으면: 시스템 알림 표시

## ⚠️ 주의사항 및 문제 해결

### 1. google-services.json 파일 관리

- **Git에 커밋하지 마세요!**
  - `.gitignore`에 이미 추가되어 있습니다
  - 팀원들은 각자 Firebase Console에서 다운로드해야 합니다
  - 파일을 공유하면 Firebase 프로젝트 보안 문제 발생 가능

### 2. 패키지 이름 관련

- **패키지 이름 변경 시**:
  - Firebase Console에서도 함께 변경해야 합니다
  - 새로운 `google-services.json`을 다운로드해야 합니다
  - 또는 Firebase Console에서 새 앱으로 등록

### 3. Gradle Sync 실패 시

**에러**: `File google-services.json is missing.`

- 해결: `app/app/google-services.json` 파일 위치 확인
- 플레이스홀더 파일이 아닌 실제 다운로드한 파일인지 확인

**에러**: `Package name mismatch`

- 해결: Firebase Console의 패키지 이름과 `build.gradle.kts`의 `applicationId` 일치 확인

### 4. 배포용 서명 키 (프로덕션 배포 시)

프로덕션 APK/AAB를 배포할 때는 SHA-1 인증서를 Firebase에 등록해야 합니다:

1. **디버그 키 SHA-1 확인** (개발용):
   ```bash
   # Windows (PowerShell)
   keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
   ```
2. **프로덕션 키 SHA-1 확인** (배포용):
   - 프로덕션 키스토어 파일 경로로 위 명령어 실행
3. Firebase Console → 프로젝트 설정 → 앱 → **SHA 인증서 지문 추가**

### 5. Firebase 프로젝트 삭제

⚠️ **주의**: Firebase 프로젝트를 삭제하면 복구할 수 없습니다!

- 테스트용 프로젝트는 삭제해도 되지만
- 프로덕션 프로젝트는 절대 삭제하지 마세요!

## 📚 추가 리소스

- [Firebase 공식 문서 - Android 설정](https://firebase.google.com/docs/android/setup)
- [FCM Android 가이드](https://firebase.google.com/docs/cloud-messaging/android/client)
- [Firebase Console](https://console.firebase.google.com/)
