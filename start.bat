@echo off
title 3D Low-Poly Character Viewer (Chibi Girl, Werewolf, Seer, Guard)
echo ========================================================
echo   3D Low-Poly Characters Viewer (Three.js)
echo   - 🌸 Chibi Girl   : http://localhost:8000/index.html
echo   - 🐺 Werewolf     : http://localhost:8000/wolf.html
echo   - 🔮 Seer (Mage)  : http://localhost:8000/seer.html
echo   - 🛡️ Guard (Knight): http://localhost:8000/guard.html
echo ========================================================
echo.
echo Dang khoi dong may chu cuc bo va mo trinh duyet...
echo.
start "" "http://localhost:8000/seer.html"
python -m http.server 8000
pause
