# Firebase 설정 가이드

FCM 푸시 알림을 사용하려면 Firebase 프로젝트 설정이 필요합니다.

## 📋 설정 단계

### 1. Firebase Console 접속

- [Firebase Console](https://console.firebase.google.com/) 접속
- Google 계정으로 로그인

### 2. 프로젝트 생성 또는 선택

- 새 프로젝트 만들기 또는 기존 프로젝트 선택
- 프로젝트 이름: 예) `Musuimsa` 또는 원하는 이름

### 3. Android 앱 추가

1. 프로젝트 개요 페이지에서 **Android 아이콘** 클릭
2. **Android 패키지 이름** 입력: `com.example.musuimsa`
3. 앱 닉네임 (선택사항): `무쉼사`
4. 디버그 서명 인증서 SHA-1 (선택사항, 나중에 추가 가능)

### 4. google-services.json 다운로드

1. 앱 등록 후 `google-services.json` 파일 다운로드
2. 다운로드한 파일을 `app/app/` 폴더에 복사 (기존 플레이스홀더 파일 교체)
   ```
   Team19_FE/
   └── app/
       └── app/
           └── google-services.json  ← 여기에 복사
   ```

### 5. Cloud Messaging 설정

1. Firebase Console에서 **프로젝트 설정** → **클라우드 메시징** 탭 이동
2. **Cloud Messaging API (Legacy)** 활성화 확인
3. **서버 키**를 복사하여 백엔드 팀에 전달 (푸시 발송용)

### 6. Gradle Sync

1. Android Studio에서 **File → Sync Project with Gradle Files** 실행
2. 빌드 성공 확인

## ✅ 확인 사항

### google-services.json 파일 위치 확인

```
app/app/google-services.json
```

### 패키지 이름 일치 확인

- Firebase Console의 Android 패키지 이름: `com.example.musuimsa`
- `app/app/build.gradle.kts`의 `applicationId`: `com.example.musuimsa`
- 두 값이 정확히 일치해야 합니다!

## 🔐 서버 키 전달 (백엔드 팀)

백엔드에서 푸시를 발송하려면 **서버 키**가 필요합니다:

1. Firebase Console → 프로젝트 설정 → 클라우드 메시징
2. **서버 키** 복사
3. 백엔드 팀에 전달 (환경 변수로 관리 권장)

## 🧪 테스트 방법

### 1. FCM 토큰 확인

앱을 실행하면 Logcat에 FCM 토큰이 출력됩니다:

```
[FCM] Token: ey...xyz (토큰 값)
```

### 2. 테스트 메시지 전송

Firebase Console → Cloud Messaging → 새 알림 전송:

- 알림 제목: `테스트`
- 알림 텍스트: `푸시 알림 테스트입니다`
- 대상: 앱 선택 (`com.example.musuimsa`)
- 전송!

## ⚠️ 주의사항

1. **google-services.json은 Git에 커밋하지 마세요!**

   - `.gitignore`에 이미 추가되어 있습니다
   - 팀원들은 각자 Firebase Console에서 다운로드해야 합니다

2. **패키지 이름 변경 시**

   - Firebase Console에서도 함께 변경해야 합니다
   - 새로운 `google-services.json`을 다운로드해야 합니다

3. **배포용 서명 키**
   - 프로덕션 APK/AAB 배포 시 SHA-1을 Firebase에 등록해야 합니다
   - Firebase Console → 프로젝트 설정 → 앱에서 SHA 인증서 지문 추가
