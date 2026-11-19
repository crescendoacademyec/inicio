#!/bin/zsh
cd -- "$(dirname "$0")" || exit 1
printf 'AAC · Biblioteca Melodías. Cierra con Control+C.\n'
python3 tools/serve-melody-pilot.py --open
