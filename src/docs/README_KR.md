# ModernWash 백엔드 문서화

## 프로젝트 개요 ✨

**ModernWash는 차량 세차 서비스 백엔드 시스템으로 다음 기술 스택을 사용합니다:**

- **Fastify:** 고성능 웹 프레임워크
- **MongoDB:** 사용자 데이터 저장을 위한 NoSQL 데이터베이스
- **OAuth 2.0:** 소셜 인증 (구글, 카카오, 네이버)
- **JWT:** 토큰 기반 인증 시스템

**주요 기능:**

- 소셜 로그인 통합
- 토큰 관리 (액세스 + 리프레시)
- 사용자 프로필 관리
- 모바일 친화적인 인증 플로우

**프로젝트 구조**

```bash
SERVER/
├── dist/                     # 컴파일된 JavaScript 파일
├── src/
│   ├── modules/
│   │   └── member/           # 회원 인증 모듈
│   │       ├── member.controller.ts  # 라우트 핸들러
│   │       ├── member.route.ts       # 라우트 정의
│   │       ├── member.schema.ts      # MongoDB 스키마
│   │       └── member.service.ts     # 비즈니스 로직
│   ├── libs/
│   │   ├── enums/
│   │   │   └── member.enum.ts # 인증 제공자 열거형
│   │   ├── types/
│   │   │   └── common.ts      # 공통 타입 정의
│   │   └── utils/             # 유틸리티 함수
│   ├── app.ts                 # Fastify 앱 초기화
│   └── server.ts              # 서버 진입점
├── docs/                      # 문서
├── env                        # 환경 변수
├── .gitignore
├── deploy.sh                  # 배포 스크립트
├── jest.config.js             # Jest 설정
├── package.json
├── package-lock.json
├── README.md
├── run_django.py              # Django 통합 (필요시)
└── tsconfig.json              # TypeScript 설정
```

## 설치 및 설정

**필수 조건**

- Node.js v18 이상
- MongoDB Atlas 계정 또는 로컬 MongoDB
- 각 소셜 제공자의 OAuth 인증 정보

**설치 단계**

1. 저장소 복제:

```bash
git clone http://gitlab.inkjetai/Mike/car-services-backend-fastify.git
cd modernwash-backend

```

2. 의존성 설치:

```bash
npm install
```

3. 환경 변수 설정
4. 개발 모드 실행:

```bash
npm run dev
```

5. 프로덕션 빌드:

```bash
npm run build
npm start
```

## 환경 구성

**환경 변수**

루트 디렉토리에 `.env` 파일 생성:

```bash
PORT=3110
MONGO_URL=mongodb+srv://사용자명:비밀번호@클러스터.mongodb.net/DB명
EXPO_PUBLIC_BASE_URL=https://도메인.com
EXPO_PUBLIC_SCHEME=앱스키마://

# 구글 OAuth
GOOGLE_CLIENT_ID=구글-클라이언트-ID
GOOGLE_CLIENT_SECRET=구글-시크릿

# 카카오 OAuth
KAKAO_CLIENT_ID=카카오-클라이언트-ID
KAKAO_CLIENT_SECRET=카카오-시크릿

# 네이버 OAuth
NAVER_CLIENT_ID=네이버-클라이언트-ID
NAVER_CLIENT_SECRET=네이버-시크릿

# JWT
JWT_SECRET=JWT-시크릿-키
```

**OAuth 설정**

1. **구글:** Google Cloud Console에서 설정

- 승인된 리디렉션 URI: `{BASE_URL}/api/v1/auth/google/callback`

2. **카카오:** Kakao Developers에서 앱 등록

- 리디렉션 URI: `{BASE_URL}/api/v1/auth/kakao/callback`

3. **네이버:** Naver Developers에서 앱 등록

- 콜백 URL: `{BASE_URL}/api/v1/auth/naver/callback`

## 인증 시스템

**인증 흐름**

1. 사용자가 제공자(구글/카카오/네이버)로 로그인 시작

2. 서버가 제공자의 인증 페이지로 리디렉션

3. 제공자가 인증 코드와 함께 리디렉션

4. 서버가 코드를 토큰으로 교환

5. 서버가 JWT 토큰을 클라이언트에 발급

**토큰 관리**

- **액세스 토큰:** 단기 유효 (기본 20초)

- **리프레시 토큰:** 장기 유효 (기본 30일)

- 토큰 갱신 엔드포인트 제공

**모바일 지원**

- `APP_SCHEME`을 통한 딥링크 처리

- 상태 파라미터를 통한 플랫폼 감지

## API 엔드포인트

기본 URL: https://도메인.com/api/v1/auth

**인증 엔드포인트**

- `GET /google/authorize`: 구글 OAuth 흐름 시작
- `GET /google/callback`: 구글 OAuth 콜백 처리
- `POST /google/token`: 코드를 JWT 토큰으로 교환
- `GET /kakao/authorize`: 카카오 OAuth 흐름 시작
- `GET /kakao/callback`: 카카오 OAuth 콜백 처리
- `POST /kakao/token`: 코드를 JWT 토큰으로 교환
- `GET /naver/authorize`: 네이버 OAuth 흐름 시작
- `GET /naver/callback`: 네이버 OAuth 콜백 처리
- `POST /naver/token`: 코드를 JWT 토큰으로 교환
- `POST /refresh`: 액세스 토큰 갱신
- `POST /user`: 현재 사용자 정보 조회

## 데이터베이스 스키마

**회원 컬렉션**

```bash
{
  email: string,       // 사용자 이메일
  name: string,        // 사용자 표시 이름
  sub: string,         // 제공자에서의 고유 ID
  picture?: string,    // 프로필 사진 URL
  provider: string,    // 'google' | 'kakao' | 'naver'
  exp: number,         // 토큰 만료 타임스탬프
  createdAt: Date,     // 자동 생성
  updatedAt: Date      // 자동 갱신
}
```

인덱스:

- `{provider: 1, sub:1}` 복합 유니크 인덱스

## 보안

**구현된 보안 조치**

- 엄격한 CORS 정책
- HS256 알고리즘을 사용한 JWT 서명
- 단기 유효 액세스 토큰
- Fastify Helmet을 통한 보안 헤더
- 환경 변수를 통한 시크릿 관리
- 엄격 모드의 MongoDB 연결

**보안 권장 사항**

1. `.env` 파일 **절대 커밋 금지**
2. 주기적인 JWT 시크릿 키 교체
3. 프로덕션 환경에서는 HTTPS 사용
4. 비정상적인 토큰 활동 모니터링
5. 의존성 주기적 업데이트

## 배포

**프로덕션 빌드**

```bash
npm run build
```

**배포 스크립트**

`deploy.sh` 스크립트는 다음을 자동화합니다:

1. `main` 브랜치에서 최신 코드 가져오기
2. 의존성 패키지 설치
3. 애플리케이션 빌드
4. PM2를 사용하여 프로덕션 모드로 애플리케이션 시작

**사용 방법:**

```bash
sh deploy.sh
또는
sh ./deploy.sh
```

**주의 사항:**

- PM2가 전역으로 설치되어 있어야 합니다:

```bash
npm install -g pm2
```

## 문제 해결

**일반적인 문제**

1. **MongoDB 연결 실패**

- `MONGO_URL` 확인
- MongoDB 네트워크 접근 확인
- MongoDB 인스턴스 실행 확인

2. **OAuth 리디렉션 오류**

- 리디렉션 URI 정확히 일치 확인
- `BASE_URL` 환경 변수 확인
- 제공자 앱 설정 확인

3. **JWT 검증 실패**

- `JWT_SECRET` 일치 확인
- 토큰 만료 시간 확인
- 토큰 변조 여부 확인
  **로깅**
- Fastify는 Pino 로거 사용
- 개발 모드에서는 상세 로그 출력
- 프로덕션에서는 구조화된 JSON 로그
