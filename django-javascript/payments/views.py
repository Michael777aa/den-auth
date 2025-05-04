from django.shortcuts import render
import requests, json, base64
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
# drf-yasg imports
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.decorators import api_view

billing_key_map = {}

# API 요청에 헤더를 생성하는 함수
def create_headers(secret_key):
    # 토스페이먼츠 API는 시크릿 키를 사용자 ID로 사용하고, 비밀번호는 사용하지 않습니다.
    # 비밀번호가 없다는 것을 알리기 위해 시크릿 키 뒤에 콜론을 추가합니다.
    # @docs https://docs.tosspayments.com/reference/using-api/authorization#%EC%9D%B8%EC%A6%9D
    userpass = f"{secret_key}:"
    encoded_u = base64.b64encode(userpass.encode()).decode()
    return {
        "Authorization": f"Basic {encoded_u}",
        "Content-Type": "application/json"
    }

# API 요청을 호출하고 응답 핸들링하는 함수
def send_payment_request(url, params, headers):
    response = requests.post(url, json=params, headers=headers)
    return response.json(), response.status_code

# 성공 및 실패 페이지 렌더링하는 함수
def handle_response(request, resjson, status_code, success_template, fail_template):
    if status_code == 200:
        return render(request, success_template, {
            "res": json.dumps(resjson, indent=4),
            "respaymentKey": resjson.get("paymentKey"),
            "resorderId": resjson.get("orderId"),
            "restotalAmount": resjson.get("totalAmount")
        })
    else:
        return render(request, fail_template, {
            "code": resjson.get("code"),
            "message": resjson.get("message")
        })

# 페이지 렌더링 함수
def widgetCheckout(request):
    return render(request, './widget/checkout.html')

def brandpayCheckout(request):
    return render(request, './brandpay/checkout.html')

def paymentCheckout(request):
    return render(request, './payment/checkout.html')

def paymentBilling(request):
    return render(request, './payment/billing.html')

# 결제 성공 및 실패 핸들링
# TODO: 개발자센터에 로그인해서 내 시크릿 키를 입력하세요. 시크릿 키는 외부에 공개되면 안돼요.
# @docs https://docs.tosspayments.com/reference/using-api/api-keys
@swagger_auto_schema(
    method='get',
    operation_summary="[결제위젯] 결제 성공 처리",
    operation_description="결제위젯 연동 시 successUrl로 지정되는 엔드포인트입니다. 토스페이먼츠로부터 전달받은 결제 정보를 사용하여 결제 승인을 요청하고, 성공 또는 실패 페이지를 렌더링합니다.",
    manual_parameters=[
        openapi.Parameter('orderId', openapi.IN_QUERY, description="가맹점 주문 ID", type=openapi.TYPE_STRING, required=True),
        openapi.Parameter('amount', openapi.IN_QUERY, description="결제 금액", type=openapi.TYPE_INTEGER, required=True),
        openapi.Parameter('paymentKey', openapi.IN_QUERY, description="토스페이먼츠 결제 키", type=openapi.TYPE_STRING, required=True),
    ],
    responses={
        200: openapi.Response(description="결제 승인 성공 시 /widget/success.html 템플릿 렌더링"),
        # process_payment 내부에서 handle_response 호출 시 실패하면 fail.html 렌더링
        # handle_response 는 토스 응답 상태를 따르므로 다양한 오류 코드가 가능 (예: 4xx, 5xx)
        # 여기서는 대표적으로 실패 시 상황만 기술
        'default': openapi.Response(description="결제 승인 실패 시 /fail.html 템플릿 렌더링 (오류 코드/메시지 포함)")
    }
)
@api_view(['GET'])
def widgetSuccess(request):
    return process_payment(request, "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6", './widget/success.html')

@swagger_auto_schema(
    method='get',
    operation_summary="[일반결제] 결제 성공 처리",
    operation_description="일반결제 연동 시 successUrl로 지정되는 엔드포인트입니다. 토스페이먼츠로부터 전달받은 결제 정보를 사용하여 결제 승인을 요청하고, 성공 또는 실패 페이지를 렌더링합니다.",
    manual_parameters=[
        openapi.Parameter('orderId', openapi.IN_QUERY, description="가맹점 주문 ID", type=openapi.TYPE_STRING, required=True),
        openapi.Parameter('amount', openapi.IN_QUERY, description="결제 금액", type=openapi.TYPE_INTEGER, required=True),
        openapi.Parameter('paymentKey', openapi.IN_QUERY, description="토스페이먼츠 결제 키", type=openapi.TYPE_STRING, required=True),
    ],
    responses={
        200: openapi.Response(description="결제 승인 성공 시 /payment/success.html 템플릿 렌더링"),
        'default': openapi.Response(description="결제 승인 실패 시 /fail.html 템플릿 렌더링 (오류 코드/메시지 포함)")
    }
)
@api_view(['GET'])
def paymentSuccess(request):
    return process_payment(request, "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R", './payment/success.html')

@swagger_auto_schema(
    method='get',
    operation_summary="[브랜드페이] 결제 성공 처리",
    operation_description="브랜드페이 연동 시 successUrl로 지정되는 엔드포인트입니다. 토스페이먼츠로부터 전달받은 결제 정보를 사용하여 결제 승인을 요청하고, 성공 또는 실패 페이지를 렌더링합니다.",
    manual_parameters=[
        openapi.Parameter('orderId', openapi.IN_QUERY, description="가맹점 주문 ID", type=openapi.TYPE_STRING, required=True),
        openapi.Parameter('amount', openapi.IN_QUERY, description="결제 금액", type=openapi.TYPE_INTEGER, required=True),
        openapi.Parameter('paymentKey', openapi.IN_QUERY, description="토스페이먼츠 결제 키", type=openapi.TYPE_STRING, required=True),
    ],
    responses={
        200: openapi.Response(description="결제 승인 성공 시 /brandpay/success.html 템플릿 렌더링"),
        'default': openapi.Response(description="결제 승인 실패 시 /fail.html 템플릿 렌더링 (오류 코드/메시지 포함)")
    }
)
@api_view(['GET'])
def brandpaySuccess(request):
    return process_payment(request, "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R", './brandpay/success.html')

# 결제 승인 호출하는 함수
# @docs https://docs.tosspayments.com/guides/v2/payment-widget/integration#3-결제-승인하기
def process_payment(request, secret_key, success_template):
    orderId = request.GET.get('orderId')
    amount = request.GET.get('amount')
    paymentKey = request.GET.get('paymentKey')

    url = "https://api.tosspayments.com/v1/payments/confirm"
    headers = create_headers(secret_key)
    params = {
        "orderId": orderId,
        "amount": amount,
        "paymentKey": paymentKey
    }

    resjson, status_code = send_payment_request(url, params, headers)
    return handle_response(request, resjson, status_code, success_template, 'fail.html')

# Fail page rendering view
@swagger_auto_schema(
    method='get',
    operation_summary="결제 실패 처리",
    operation_description="결제 실패 시 failUrl로 지정되는 엔드포인트입니다. 토스페이먼츠로부터 전달받은 오류 코드와 메시지를 사용하여 실패 페이지를 렌더링합니다.",
    manual_parameters=[
        openapi.Parameter('code', openapi.IN_QUERY, description="오류 코드", type=openapi.TYPE_STRING, required=True),
        openapi.Parameter('message', openapi.IN_QUERY, description="오류 메시지", type=openapi.TYPE_STRING, required=True),
    ],
    responses={
        200: openapi.Response(description="/fail.html 템플릿 렌더링 (오류 코드/메시지 포함)")
    }
)
@api_view(['GET'])
def fail(request):
    return render(request, "fail.html", {
        "code": request.GET.get('code'),
        "message": request.GET.get('message')
    })

# 빌링키 발급
# AuthKey 로 카드 빌링키 발급 API 를 호출하세요
# @docs https://docs.tosspayments.com/reference#authkey로-카드-빌링키-발급
@swagger_auto_schema(
    method='post',
    operation_summary="카드 빌링키 발급 요청",
    operation_description="고객 키(customerKey)와 인증 키(authKey)를 받아 토스페이먼츠에 빌링키 발급을 요청합니다.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'customerKey': openapi.Schema(type=openapi.TYPE_STRING, description='고객을 식별하는 고유 키'),
            'authKey': openapi.Schema(type=openapi.TYPE_STRING, description='인증 SDK / 메소드에서 발급되는 일회성 인증 키'),
        },
        required=['customerKey', 'authKey']
    ),
    responses={
        200: openapi.Response(
            description="빌링키 발급 성공",
            examples={
                "application/json": {
                    "mId": "tvivarepublica",
                    "customerKey": "CUSTOMER_KEY_123",
                    "authenticatedAt": "2023-01-01T10:00:00+09:00",
                    "method": "카드",
                    "billingKey": "BILLING_KEY_123...",
                    "card": {
                        "issuerCode": "4V",
                        "acquirerCode": "41",
                        "number": "433012******1234",
                        "cardType": "신용",
                        "ownerType": "개인"
                    }
                }
            }
        ),
        400: openapi.Response(description="잘못된 요청 파라미터 (customerKey 또는 authKey 누락)"),
        # 실제 API 응답에 따라 다른 상태 코드 (예: 5xx) 추가 가능
    }
)
@api_view(['POST'])
@csrf_exempt
def issueBillingKey(request):
    try:
        data = json.loads(request.body)
        customerKey = data.get('customerKey')
        authKey = data.get('authKey')

        if not customerKey or not authKey:
            raise ValueError("Missing parameters")
    except (json.JSONDecodeError, ValueError) as e:
        return JsonResponse({'error': str(e)}, status=400)

    url = "https://api.tosspayments.com/v1/billing/authorizations/issue"
    secret_key = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R"
    headers = create_headers(secret_key)
    params = {
        "customerKey": customerKey,
        "authKey": authKey
    }

    resjson, status_code = send_payment_request(url, params, headers)

    if status_code == 200:
        billing_key_map[customerKey] = resjson.get('billingKey')
    
    return JsonResponse(resjson, status=status_code)

# 자동결제 승인
@swagger_auto_schema(
    method='post',
    operation_summary="카드 자동결제 승인 요청",
    operation_description="저장된 빌링키(billingKey)와 주문 정보를 사용하여 카드 자동결제를 승인합니다.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'customerKey': openapi.Schema(type=openapi.TYPE_STRING, description='빌링키 발급 시 사용한 고객 식별 키'),
            'amount': openapi.Schema(type=openapi.TYPE_INTEGER, description='결제 금액'),
            'orderId': openapi.Schema(type=openapi.TYPE_STRING, description='가맹점 주문 ID'),
            'orderName': openapi.Schema(type=openapi.TYPE_STRING, description='주문명'),
            'customerEmail': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL, description='고객 이메일'),
            'customerName': openapi.Schema(type=openapi.TYPE_STRING, description='고객명'),
        },
        required=['customerKey', 'amount', 'orderId', 'orderName', 'customerEmail', 'customerName']
    ),
    responses={
        200: openapi.Response(
            description="자동결제 승인 성공",
            examples={
                "application/json": {
                    # 실제 토스페이먼츠 응답 예시를 참고하여 채워넣으세요.
                    "paymentKey": "PAYMENT_KEY_EXAMPLE",
                    "orderId": "ORDER_ID_EXAMPLE",
                    "status": "DONE",
                    # ... 기타 응답 필드
                }
            }
        ),
        400: openapi.Response(description="잘못된 요청 파라미터 또는 해당 customerKey에 대한 빌링키 없음"),
        # 실제 API 응답에 따라 다른 상태 코드 (예: 5xx) 추가 가능
    }
)
@api_view(['POST'])
@csrf_exempt
def confirm_billing(request):
    try:
        data = json.loads(request.body)
        customerKey = data.get('customerKey')
        amount = data.get('amount')
        orderId = data.get('orderId')
        orderName = data.get('orderName')
        customerEmail = data.get('customerEmail')
        customerName = data.get('customerName')

        if not all([customerKey, amount, orderId, orderName, customerEmail, customerName]):
            raise ValueError("Missing parameters")

        # 저장해두었던 빌링키로 카드 자동결제 승인 API 를 호출하세요.
        billingKey = billing_key_map.get(customerKey)
        if not billingKey:
            return JsonResponse({'error': 'Billing key not found'}, status=400)
        
    except (json.JSONDecodeError, ValueError) as e:
        return JsonResponse({'error': str(e)}, status=400)

    url = f"https://api.tosspayments.com/v1/billing/{billingKey}"
    secret_key = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R"
    headers = create_headers(secret_key)
    params = {
        "customerKey": customerKey,
        "amount": amount,
        "orderId": orderId,
        "orderName": orderName,
        "customerEmail": customerEmail,
        "customerName": customerName
    }

    resjson, status_code = send_payment_request(url, params, headers)

    if status_code == 200:
        return JsonResponse(resjson, status=status_code)
    else:
        return JsonResponse(resjson, status=status_code)

# 브랜드페이 Access Token 발급
@swagger_auto_schema(
    method='get',
    operation_summary="브랜드페이 Access Token 발급",
    operation_description="브랜드페이 연동 과정에서 콜백으로 호출되어 Access Token 발급을 요청합니다.",
    manual_parameters=[
        openapi.Parameter('customerKey', openapi.IN_QUERY, description="고객 식별 키", type=openapi.TYPE_STRING, required=True),
        openapi.Parameter('code', openapi.IN_QUERY, description="Access Token 발급에 필요한 인증 코드", type=openapi.TYPE_STRING, required=True),
    ],
    responses={
        200: openapi.Response(
            description="Access Token 발급 성공",
            examples={
                "application/json": {
                    # 실제 토스페이먼츠 응답 예시를 참고하여 채워넣으세요.
                    "accessToken": "ACCESS_TOKEN_EXAMPLE",
                    "tokenType": "Bearer",
                    "expiresIn": 86400,
                    # ... 기타 응답 필드
                }
            }
        ),
        400: openapi.Response(description="잘못된 요청 파라미터 (customerKey 또는 code 누락)"),
        # 실제 API 응답에 따라 다른 상태 코드 (예: 5xx) 추가 가능
    }
)
@api_view(['GET'])
def callback_auth(request):
    customerKey = request.GET.get('customerKey')
    code = request.GET.get('code')

    if not customerKey or not code:
        return JsonResponse({'error': 'Missing parameters'}, status=400)

    url = "https://api.tosspayments.com/v1/brandpay/authorizations/access-token"
    secret_key = "test_sk_aBX7zk2yd8yoXwoJ0gqVx9POLqKQ"
    headers = create_headers(secret_key)
    params = {
        "grantType": "AuthorizationCode",
        "customerKey": customerKey,
        "code": code
    }

    resjson, status_code = send_payment_request(url, params, headers)

    if status_code == 200:
        return JsonResponse(resjson, status=status_code)
    else:
        return JsonResponse(resjson, status=status_code)