@echo off
title 3D Low-Poly Character Viewer (8 Characters)
echo ========================================================
echo   3D Low-Poly Characters Viewer (Three.js)
echo   - 🌸 Chibi Girl    : http://localhost:8000/index.html
echo   - 🐺 Werewolf      : http://localhost:8000/wolf.html
echo   - 🔮 Seer (Mage)   : http://localhost:8000/seer.html
echo   - 🛡️ Guard (Knight) : http://localhost:8000/guard.html
echo   - 🧙 Witch         : http://localhost:8000/witch.html
echo   - 🏹 Hunter        : http://localhost:8000/hunter.html
echo   - 🌺 Geisha        : http://localhost:8000/geisha.html
echo   - 🌓 Half-Werewolf : http://localhost:8000/half-werewolf.html
echo ========================================================
echo.
echo Dang khoi dong may chu cuc bo va mo trinh duyet...
echo.
start "" "http://localhost:8000/seer.html"
python -m http.server 8000
pause
