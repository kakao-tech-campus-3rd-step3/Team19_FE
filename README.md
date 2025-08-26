# [충남대 1팀] 무쉼사: 무더위쉼터를 찾는 사람들

### 초기 Setup

- **TypeScript, Vite, React 기반 프로젝트 초기 세팅**
- **Prettier 코드 포맷터 설정 추가**
  - `settings.json`을 Git에 포함시켜 별도 설정 없이도 적용 가능하도록 함
- **Emotion 스타일 라이브러리 설치 및 테마 구조 설정**
  - 안정적인 타입 지원 확보를 위해 아래 코드 추가:

    ```ts
    import '@emotion/react';
    import { ThemeType } from './theme';

    declare module '@emotion/react' {
      export interface Theme extends ThemeType {}
    }
    ```

- **style 폴더 생성 및 colors, typography, spacing 등 스타일 관련 파일 추가**
  - 컬러, 타이포그래피, 간격(spacing) 토큰을 테마에서 사용할 수 있도록 구성
- **로고 이미지 및 시작 이미지 추가**
- 멘토링 끝끝
