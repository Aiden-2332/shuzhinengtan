#!/bin/bash
set -Eeuo pipefail

REPORT_PORT=8001
COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
REPORT_DIR="${COZE_WORKSPACE_PATH}/report"

# Kill existing process on report port
kill_report_port() {
    local pids
    pids=$(ss -H -lntp 2>/dev/null | awk -v port="${REPORT_PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    if [[ -n "${pids}" ]]; then
        echo "Killing existing report backend PIDs: ${pids}"
        echo "${pids}" | xargs -I {} kill -9 {} 2>/dev/null || true
        sleep 1
    fi
}

echo "Starting Report Backend on port ${REPORT_PORT}..."
kill_report_port

cd "${REPORT_DIR}"

# Install dependencies if needed
pip3 install -r requirements.txt -q 2>/dev/null

# Start FastAPI server
python3 api_server.py
