#!/bin/bash

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=============================="
echo "  Stock Manager 시작 중..."
echo "=============================="

# 백엔드 시작
echo "[1/2] 백엔드 (FastAPI) 시작..."
cd "$PROJECT_DIR/backend"
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
echo "$BACKEND_PID" > "$PROJECT_DIR/.backend.pid"
echo "      PID: $BACKEND_PID"

# 프론트엔드 시작
echo "[2/2] 프론트엔드 (React/Vite) 시작..."
cd "$PROJECT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
echo "$FRONTEND_PID" > "$PROJECT_DIR/.frontend.pid"
echo "      PID: $FRONTEND_PID"

echo ""
echo "=============================="
echo "  실행 완료!"
echo "  프론트엔드: http://localhost:5173"
echo "  백엔드 API: http://localhost:8000"
echo "  API 문서:   http://localhost:8000/docs"
echo "=============================="
echo ""
echo "이 창을 닫으면 서버가 종료됩니다."
echo "종료하려면 stop.command 를 실행하거나 Ctrl+C 를 누르세요."
echo ""

wait
