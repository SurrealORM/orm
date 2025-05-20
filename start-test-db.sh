#!/bin/bash

# Check if surreal is installed
if ! command -v surreal &> /dev/null; then
    echo "Error: SurrealDB is not installed or not in your PATH"
    echo "Please install SurrealDB from https://surrealdb.com/install"
    exit 1
fi

echo "Starting SurrealDB for testing..."
surreal start --log trace --user root --pass root memory

# This script will keep running until manually stopped with Ctrl+C 