#!/bin/bash
cd frontend && pnpm install && pnpm run dev
cd ../backend && pip install -r requirements.txt
