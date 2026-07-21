## 실행 방법

### 1. 가상환경 생성

python -m venv .venv

### 2. 활성화

Windows:
.venv\Scripts\activate

### 3. 패키지 설치

pip install -r requirements.txt

### 4. 서버 실행

uvicorn main:app --reload --host 0.0.0.0 --port 5000
