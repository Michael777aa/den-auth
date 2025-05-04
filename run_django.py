import subprocess
import os
import sys

# 스크립트 파일의 위치를 기준으로 Django 프로젝트 디렉토리 경로 설정
# 이 스크립트가 워크스페이스 루트에 있다고 가정합니다.
script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.join(script_dir, 'django-javascript')
manage_py_script = os.path.join(project_dir, 'manage.py')
port = "8001"

# 운영체제에 따라 가상환경 내 Python 실행 파일 경로 설정
if sys.platform == "win32":
    python_executable = os.path.join(project_dir, '.venv', 'Scripts', 'python.exe')
else:
    # Linux, macOS, WSL 등
    python_executable = os.path.join(project_dir, '.venv', 'bin', 'python')

# 실행할 명령어 리스트 구성
command = [
    python_executable,
    manage_py_script,
    "runserver",
    f"0.0.0.0:{port}"  # 모든 인터페이스에서 접속 허용
]

print(f"Django 프로젝트 디렉토리: {project_dir}")
print(f"사용할 Python 실행 파일: {python_executable}")
print(f"실행 명령어: {' '.join(command)}")
print(f"Django 개발 서버를 시작합니다 (포트: {port})...")

try:
    # Django 프로젝트 디렉토리에서 명령어 실행
    process = subprocess.Popen(command, cwd=project_dir)
    process.wait()  # 프로세스가 종료될 때까지 대기
except FileNotFoundError:
    print(f"오류: Python 실행 파일({python_executable}) 또는 manage.py({manage_py_script})를 찾을 수 없습니다.")
    print("'.venv' 가상환경이 프로젝트 디렉토리에 존재하고 활성화 가능한지,")
    print("그리고 manage.py 파일이 프로젝트 디렉토리에 있는지 확인하십시오.")
except Exception as e:
    print(f"서버 실행 중 오류 발생: {e}")

print("Django 개발 서버가 종료되었습니다.") 