import requests
import uuid
import os # 파일 업로드 예시용
import json # JSON 응답 로깅용
import logging # 로깅 모듈 추가

# --- 로깅 설정 ---
log_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger('api_test')
logger.setLevel(logging.INFO) # 로그 레벨 설정 (DEBUG, INFO, WARNING, ERROR, CRITICAL)

# 파일 핸들러 설정 (로그 파일 생성)
file_handler = logging.FileHandler('test_results.log', mode='w') # 'w' 모드로 실행 시마다 파일 새로 작성
file_handler.setFormatter(log_formatter)
logger.addHandler(file_handler)

# 콘솔 핸들러 설정 (콘솔에도 로그 출력)
console_handler = logging.StreamHandler()
console_handler.setFormatter(log_formatter)
logger.addHandler(console_handler)

# --- 설정 ---
BASE_URL = "http://localhost:3000/auth" # 서버 주소 (포트 포함)
HEADERS = {'Content-Type': 'application/json'}

# --- 테스트용 데이터 생성 함수 ---
def generate_unique_user_data():
    """테스트 실행 시마다 고유한 사용자 데이터를 생성"""
    unique_id = str(uuid.uuid4())[:8]
    return {
        # MemberInput 타입 추정 (실제 타입 정의 확인 필요)
        "memberEmail": f"pytester_{unique_id}@example.com",
        "memberPassword": "password123",
        "memberNickname": f"PyTester_{unique_id}",
        # 스키마에 따라 필요한 다른 필드 추가 가능 (예: memberPhone)
        # "memberPhone": f"010-{unique_id[:4]}-{unique_id[4:]}" # 예시
    }

# --- API 호출 함수 ---

def register_user(session: requests.Session, user_data: dict):
    """회원가입 API 호출"""
    url = f"{BASE_URL}/signup"
    logger.info(f"[ACTION] Registering user: {user_data['memberEmail']}")
    try:
        response = session.post(url, json=user_data, headers=HEADERS, timeout=10)
        response_data = response.json() # 로깅 전에 json 파싱 시도
        logger.info(f"[RESPONSE /signup {response.status_code}] {json.dumps(response_data, indent=2)}")
        response.raise_for_status() # 2xx 아니면 예외 발생
        logger.info("[SUCCESS] Registration successful.")
        return response_data # 응답 데이터 반환
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if e.response is not None else "N/A"
        error_text = e.response.text if e.response is not None else str(e)
        logger.error(f"[FAILURE] Registration failed! Status: {status_code}, Error: {error_text}")
        return None
    except json.JSONDecodeError:
        logger.error(f"[FAILURE] Failed to decode JSON response: {response.text}")
        return None

def login_user(session: requests.Session, email: str, password: str):
    """로그인 API 호출"""
    url = f"{BASE_URL}/login"
    payload = {"memberEmail": email, "memberPassword": password}
    logger.info(f"[ACTION] Logging in user: {email}")
    try:
        response = session.post(url, json=payload, headers=HEADERS, timeout=10)
        response_data = response.json()
        logger.info(f"[RESPONSE /login {response.status_code}] {json.dumps(response_data, indent=2)}")
        response.raise_for_status()
        # 로그인 성공 시 세션에 쿠키가 자동으로 저장됨
        logger.info("[SUCCESS] Login successful. Auth cookie set in session.")
        return response_data # 응답 데이터 반환 (멤버 정보 포함)
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if e.response is not None else "N/A"
        error_text = e.response.text if e.response is not None else str(e)
        logger.error(f"[FAILURE] Login failed! Status: {status_code}, Error: {error_text}")
        return None
    except json.JSONDecodeError:
        logger.error(f"[FAILURE] Failed to decode JSON response: {response.text}")
        return None


def update_user_profile(session: requests.Session, update_data: dict, file_path: str | None = None):
    """회원 정보 수정 API 호출"""
    url = f"{BASE_URL}/update"
    logger.info(f"[ACTION] Updating user profile with data: {update_data}")
    files = None
    # 파일 경로가 주어지면 파일 준비
    if file_path and os.path.exists(file_path):
        files = {'memberImage': (os.path.basename(file_path), open(file_path, 'rb'))}
        logger.info(f"           Attaching file: {file_path}")
        # 파일 업로드 시 Content-Type은 multipart/form-data 이므로 헤더 제거
        # requests 라이브러리가 자동으로 설정해줌
        _headers = None
    else:
        _headers = HEADERS # JSON 데이터만 보낼 경우

    try:
        # 파일 유무에 따라 data 또는 json 파라미터 사용
        if files:
             # multipart/form-data 에서는 JSON 데이터를 data 파라미터로 보내야 할 수 있음
             # 서버 구현 확인 필요 (문자열 필드를 어떻게 받는지)
             # 여기서는 update_data 필드를 그대로 보내는 것으로 가정
             response = session.post(url, data=update_data, files=files, timeout=15)
        else:
             response = session.post(url, json=update_data, headers=_headers, timeout=10)

        response_data = response.json()
        logger.info(f"[RESPONSE /update {response.status_code}] {json.dumps(response_data, indent=2)}")
        response.raise_for_status()
        logger.info("[SUCCESS] Profile update successful.")
        return response_data
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if e.response is not None else "N/A"
        error_text = e.response.text if e.response is not None else str(e)
        logger.error(f"[FAILURE] Profile update failed! Status: {status_code}, Error: {error_text}")
        return None
    except json.JSONDecodeError:
        logger.error(f"[FAILURE] Failed to decode JSON response: {response.text}")
        return None
    finally:
        # 열었던 파일 닫기
        if files and 'memberImage' in files:
            files['memberImage'][1].close()

def logout_user(session: requests.Session):
    """로그아웃 API 호출"""
    url = f"{BASE_URL}/logout"
    logger.info("[ACTION] Logging out user")
    try:
        response = session.post(url, timeout=10)
        response_data = response.json()
        logger.info(f"[RESPONSE /logout {response.status_code}] {json.dumps(response_data, indent=2)}")
        response.raise_for_status()
        logger.info("[SUCCESS] Logout successful.")
        return response_data
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if e.response is not None else "N/A"
        error_text = e.response.text if e.response is not None else str(e)
        logger.error(f"[FAILURE] Logout failed! Status: {status_code}, Error: {error_text}")
        return None
    except json.JSONDecodeError:
        logger.error(f"[FAILURE] Failed to decode JSON response: {response.text}")
        return None

def delete_user_account(session: requests.Session):
    """회원 탈퇴 API 호출"""
    url = f"{BASE_URL}/delete"
    logger.info("[ACTION] Deleting user account")
    try:
        response = session.post(url, timeout=10)
        response_data = response.json()
        logger.info(f"[RESPONSE /delete {response.status_code}] {json.dumps(response_data, indent=2)}")
        response.raise_for_status()
        logger.info("[SUCCESS] Account deletion successful.")
        return response_data
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if e.response is not None else "N/A"
        error_text = e.response.text if e.response is not None else str(e)
        logger.error(f"[FAILURE] Account deletion failed! Status: {status_code}, Error: {error_text}")
        return None
    except json.JSONDecodeError:
        logger.error(f"[FAILURE] Failed to decode JSON response: {response.text}")
        return None


# --- 메인 실행 블록 ---
if __name__ == "__main__":
    logger.info("--- Starting Backend API Test ---")
    # 세션 생성 (쿠키 유지용)
    api_session = requests.Session()

    # 1. 사용자 데이터 생성
    new_user_info = generate_unique_user_data()

    # 2. 회원가입 테스트
    registered_data = register_user(api_session, new_user_info)
    if not registered_data:
        logger.critical("--- TEST FAILED: Registration ---") # 심각한 오류로 변경
        exit(1) # 회원가입 실패 시 종료

    # 3. 로그인 테스트
    login_data = login_user(api_session, new_user_info["memberEmail"], new_user_info["memberPassword"])
    if not login_data:
        logger.error("--- TEST FAILED: Login ---")
        # 탈퇴 시도 전에 종료할 수도 있지만, 여기서는 혹시 모르니 다음 단계 시도
        # exit(1)
    else:
        # 로그인 성공 시 사용자 정보 확인 (예시)
        logger.info("[VERIFY] Logged in user info:")
        logger.info(f"  Email: {login_data.get('member', {}).get('memberEmail')}")
        logger.info(f"  Nickname: {login_data.get('member', {}).get('memberNickname')}")

    # 4. 회원 정보 수정 테스트 (로그인 상태 유지 필요)
    if login_data: # 로그인이 성공했을 경우에만 시도
        update_payload = {
            "memberNickname": f"Updated_{str(uuid.uuid4())[:4]}",
            "memberPhone": "010-1234-5678" # 예시: 전화번호 필드가 있다면 추가
            # 수정할 다른 필드 추가 (MemberUpdateInput 타입 확인 필요)
        }
        # (선택적) 파일 업로드 테스트용 파일 생성 (실제 파일 경로 사용 권장)
        dummy_file_path = "test_image.png"
        try:
            with open(dummy_file_path, "w") as f:
                f.write("dummy image data")
            # 파일과 함께 업데이트
            updated_data_with_file = update_user_profile(api_session, update_payload, file_path=dummy_file_path)
            if updated_data_with_file:
                 logger.info("[VERIFY] Updated user info (with file):")
                 logger.info(f"  Nickname: {updated_data_with_file.get('memberNickname')}")
                 logger.info(f"  Image URL: {updated_data_with_file.get('memberImage')}") # 이미지 경로 확인
            os.remove(dummy_file_path) # 테스트 후 더미 파일 삭제

            # 파일 없이 업데이트
            update_payload_no_file = {"memberNickname": f"NoFileUpdate_{str(uuid.uuid4())[:4]}"}
            updated_data_no_file = update_user_profile(api_session, update_payload_no_file)
            if updated_data_no_file:
                 logger.info("[VERIFY] Updated user info (no file):")
                 logger.info(f"  Nickname: {updated_data_no_file.get('memberNickname')}")

        except Exception as e:
            logger.error(f"[ERROR] During profile update test: {e}")
            if os.path.exists(dummy_file_path):
                 os.remove(dummy_file_path)


    # 5. 로그아웃 테스트 (로그인 상태 유지 필요)
    if login_data:
        logout_result = logout_user(api_session)
        # 로그아웃 후에는 인증 필요한 API 호출이 실패해야 함 (예: 정보 수정 재시도)
        if logout_result:
             logger.info("[ACTION] Attempting update after logout (should fail)")
             update_after_logout = update_user_profile(api_session, {"memberNickname": "FailUpdate"})
             if not update_after_logout:
                  logger.info("[SUCCESS] Update failed after logout as expected.")
             else:
                  logger.warning("[FAILURE] Update unexpectedly succeeded after logout!") # 경고 레벨로 변경


    # 6. 회원 탈퇴 테스트 (다시 로그인 필요)
    #    주의: 탈퇴 후에는 해당 계정으로 더 이상 테스트 불가
    logger.info("--- Preparing for Account Deletion ---")
    # 다시 로그인 시도 (로그아웃되었으므로)
    final_login_data = login_user(api_session, new_user_info["memberEmail"], new_user_info["memberPassword"])
    if final_login_data:
        delete_result = delete_user_account(api_session)
        if delete_result:
             # 탈퇴 후 로그인 시도 (실패해야 함)
             logger.info("[ACTION] Attempting login after deletion (should fail)")
             login_after_delete = login_user(api_session, new_user_info["memberEmail"], new_user_info["memberPassword"])
             if not login_after_delete:
                  logger.info("[SUCCESS] Login failed after deletion as expected.")
             else:
                  logger.warning("[FAILURE] Login unexpectedly succeeded after deletion!") # 경고 레벨로 변경
        else:
             logger.warning("--- TEST WARNING: Account deletion failed ---") # 경고 레벨로 변경
    else:
        logger.warning("--- TEST WARNING: Could not log in again to test deletion ---") # 경고 레벨로 변경


    logger.info("--- Backend API Test Finished ---")