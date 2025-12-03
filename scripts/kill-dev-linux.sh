#!/bin/bash
# This script kills processes listening on common dev/preview ports (Linux)
# Adjust ports as needed for your project

PORTS=(3000 5173 8080 5000)

for PORT in "${PORTS[@]}"; do
  PIDS=$(lsof -ti tcp:$PORT)
  if [ -n "$PIDS" ]; then
    echo "Killing processes on port $PORT: $PIDS"
    kill -9 $PIDS
  else
    echo "No process found on port $PORT"
  fi
done
