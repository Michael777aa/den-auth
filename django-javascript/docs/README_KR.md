# 토스페이먼츠 Django 연동 샘플 (웹뷰) - 한글 README

## 프로젝트 소개

이 프로젝트는 토스페이먼츠의 다양한 결제 방식을 Django 백엔드와 연동하는 방법을 보여주는 샘플입니다.
특히, 모바일 앱의 웹뷰(WebView) 환경에서 결제 모듈을 사용하는 시나리오를 가정하고 구성되었습니다.

Swagger를 이용한 API 자동 문서화 기능이 포함되어 있어,
프론트엔드 개발자가 API 엔드포인트를 쉽게 확인하고 연동할 수 있습니다.

## 주요 기능

*   **토스페이먼츠 연동:**
    *   결제 위젯 (Payment Widget)
    *   일반 결제 (Payment Window)
    *   브랜드페이 (BrandPay)
    *   자동 결제 (Billing / 정기결제)
*   **API 문서 자동 생성:**
    *   Swagger UI: `/swagger/` 경로에서 확인
    *   ReDoc UI: `/redoc/` 경로에서 확인

## 설치 및 실행

1.  **저장소 복제:**
    ```bash
    # git clone ... (저장소 주소)
    # cd car-services-backend/django-javascript
    ```

2.  **가상 환경 생성 및 의존성 설치:** (최초 1회)
    *   프로젝트 디렉토리(`car-services-backend/django-javascript`) 내에 가상 환경(`.venv`)이 없다면 생성합니다.
        ```bash
        python3 -m venv .venv
        ```
    *   의존성을 설치합니다.
        ```bash
        ./.venv/bin/pip install -r requirements.txt
        ```

3.  **데이터베이스 마이그레이션:** (선택 사항: Django admin 등 내장 기능 사용 시 필요)
    ```bash
    ./.venv/bin/python manage.py migrate
    ```

4.  **시크릿 키 / 클라이언트 키 설정:**
    *   **주의:** `payments/views.py` 및 템플릿(`*.checkout.html`) 파일 내에 테스트용 키가 하드코딩되어 있습니다.
        *   **시크릿 키 (`payments/views.py`):** 실제 서비스에서는 코드에 직접 넣지 말고, 환경 변수나 별도 설정 파일을 통해 안전하게 관리해야 합니다.
        *   **클라이언트 키 (`*.checkout.html`):** 각 템플릿 파일 내의 테스트 클라이언트 키를 실제 운영 또는 테스트용 키로 교체해야 합니다.
    *   개발 및 테스트 시에는 토스페이먼츠 개발자센터에서 발급받은 본인의 키를 사용하십시오.

5.  **개발 서버 실행:**
    *   프로젝트 루트 디렉토리(`car-services-backend`)로 이동하여 `run_django.py` 스크립트를 실행합니다.
        ```bash
        cd .. # car-services-backend 디렉토리로 이동
        python3 run_django.py
        ```
    *   이 스크립트는 가상 환경을 사용하여 포트 8001에서 Django 개발 서버를 실행합니다.

6.  **접속 확인:**
    *   웹 브라우저에서 `http://127.0.0.1:8001/swagger/` 로 접속하여 API 문서를 확인합니다.
    *   `http://127.0.0.1:8001/widget/checkout` 등으로 접속하여 결제 테스트 페이지를 로드할 수 있습니다. (단, 앱 데이터 전달 없이는 결제 시작 불가)

## API 엔드포인트

자세한 API 명세는 `/swagger/` 또는 `/redoc/` 경로에서 확인할 수 있습니다. 주요 엔드포인트 역할은 다음과 같습니다.

*   `POST /issue-billing-key`: 카드 빌링키 발급 (자동결제 카드 등록)
*   `POST /confirm-billing`: 자동 결제 승인 (저장된 빌링키 사용)
*   `GET /callback-auth`: 브랜드페이 Access Token 발급 (인증 콜백)
*   `GET /widget/success`: 결제위젯 성공 처리 (Success URL)
*   `GET /payment/success`: 일반결제 성공 처리 (Success URL)
*   `GET /brandpay/success`: 브랜드페이 성공 처리 (Success URL)
*   `GET /fail`: 결제 실패 처리 (Fail URL)

## 웹뷰(WebView) 연동 가이드 (React Native 환경 기준)

이 Django 프로젝트는 React Native 앱의 웹뷰 환경에서 결제 모듈을 제공합니다. 앱과 웹뷰 간 상호작용은 다음 인터페이스를 따릅니다.

1.  **초기 정보 수신 인터페이스 (Django 웹뷰 → React Native 앱):**
    *   **Django 웹뷰 페이지 (`payments/templates/*checkout.html`)의 기대사항:**
        *   체크아웃 HTML 페이지에는 `initializePayment(jsonDataString)` JavaScript 함수가 정의되어 있습니다.
        *   React Native 앱은 웹뷰 로드 후, 이 함수를 호출하여 결제 정보(주문 ID, 금액, `customerKey` 등)를 JSON 문자열 형태로 전달해야 합니다.
        *   **TODO 확인:** `initializePayment` 함수 내 `clientKey`(테스트 키)는 실제 키로 교체해야 하며, 앱에서 전달하는 `customerKey`는 반드시 안전하고 고유한 값이어야 합니다.
        *   함수가 호출되고 데이터가 전달되면, 토스페이먼츠 SDK 초기화 및 결제 UI 렌더링이 진행됩니다.

2.  **결제 결과 반환 인터페이스 (Django 웹뷰 → React Native 앱):**
    *   **Django 웹뷰 페이지 (`payments/templates/*success.html`, `fail.html`)의 동작:**
        *   결제 완료 또는 실패 후 리다이렉트된 페이지는 로드 시 `window.ReactNativeWebView.postMessage(message)` 함수를 자동으로 호출합니다.
        *   결제 결과(성공/실패)와 관련 데이터를 담은 JSON 문자열 메시지를 앱으로 전송합니다.
        *   전송 메시지 형식:
            ```json
            // 성공 시
            {"type":"paymentResult","status":"success","payload":{"orderId":"...","paymentKey":"...","totalAmount":"..."}}
            // 실패 시
            {"type":"paymentResult","status":"fail","payload":{"code":"...","message":"..."}}
            ```
    *   **React Native 앱의 역할 (참고):**
        *   앱은 `WebView`의 `onMessage` 기능을 통해 이 메시지를 수신하고, 파싱하여 결과에 따른 후속 처리를 수행해야 합니다.

3.  **Success / Fail URL 설정 (참고):**
    *   토스페이먼츠 SDK 초기화 시 사용된 `successUrl`, `failUrl`은 웹뷰 내부 페이지 이동용입니다. 최종 결과는 `postMessage` 인터페이스를 통해 앱으로 전달됩니다.

## 주의사항

*   **키 관리:** 시크릿 키는 절대 외부에 노출되지 않도록 안전하게 관리하십시오. 클라이언트 키도 실제 환경에 맞는 값으로 교체해야 합니다.
*   **테스트:** 실제 서비스 배포 전, 충분한 테스트를 거치십시오.
*   **통신 규약:** 웹뷰-앱 간의 정확한 데이터 형식과 처리 방식은 프론트엔드 개발자와 긴밀히 협의하십시오.

## 기타

현재 상태에서는 앱의 데이터 전달(`initializePayment` 호출) 없이는 결제 테스트가 불가능합니다. 테스트가 필요하다면 브라우저 개발자 도구 콘솔에서 직접 `initializePayment` 함수를 호출하거나, 토스페이먼츠 공식 샘플 프로젝트를 참고할 수 있습니다. (https://github.com/tosspayments/tosspayments-sample)


