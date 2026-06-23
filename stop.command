#!/bin/bash

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=============================="
echo "  Stock Manager 종료 중..."
echo "=============================="

STOPPED=0

# 백엔드 종료
if [ -f "$PROJECT_DIR/.backend.pid" ]; then
    BACKEND_PID=$(cat "$PROJECT_DIR/.backend.pid")
    if kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID"
        echo "  백엔드 종료 (PID: $BACKEND_PID)"
        STOPPED=1
    fi
    rm -f "$PROJECT_DIR/.backend.pid"
else
    echo "  백엔드: 실행 중이 아님"
fi

# 프론트엔드 종료
if [ -f "$PROJECT_DIR/.frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PROJECT_DIR/.frontend.pid")
    if kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID"
        echo "  프론트엔드 종료 (PID: $FRONTEND_PID)"
        STOPPED=1
    fi
    rm -f "$PROJECT_DIR/.frontend.pid"
else
    echo "  프론트엔드: 실행 중이 아님"
fi

echo ""
if [ $STOPPED -eq 1 ]; then
    echo "  모든 서버가 종료되었습니다."
else
    echo "  종료할 서버가 없습니다."
fi
echo "=============================="
echo ""
echo "이 창은 닫아도 됩니다."
sleep 2
