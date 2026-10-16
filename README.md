# WareTrack

Egyszerű raktárkezelő (Node.js + Express). Az adatokat helyben, a `data/db.json` fájlban tárolja,
külső adatbázist és idegen fiókot nem használ.

**3D raktárjáték:** https://m00nsc0rched.github.io/waretrack/game/

**Raktárkezelő demó:** https://m00nsc0rched.github.io/waretrack/

A játék forrása a `WareTrack-main/` mappában van. A Beállítások menüben a felület
70–125% között méretezhető, és bekapcsolható a sötét mód; mindkettőt a böngésző megjegyzi.

A demó szerver nélkül, a GitHub Pages-en fut: a fiókok és a raktáradatok csak abban a böngészőben
tárolódnak, amelyben használod (localStorage), máshonnan nem látszanak.

## Push-deploy

Minden push a `main` ágra automatikusan újraépíti és élesíti a demót és a játékot
(`.github/workflows/pages.yml`, kb. 1 perc). Az állapotát a tároló **Actions** fülén látod.
A demót a `scripts/build-pages.js` állítja össze: a `public/` oldalaihoz hozzáadja a `demo/demo.js`-t,
amely a szerver helyett a böngészőben kezeli az adatokat. A játék `index.html` fájlját
az `_site/game/` mappába másolja, így az a fenti `/game/` linken indul.

Változtatás feltöltése ebből a mappából (a git hordozható változatával):

```powershell
$git = "$env:USERPROFILE\Tools\MinGit-2.56.0.2-64-bit\cmd\git.exe"
& $git add -A
& $git commit -m "Mit változtattam"
& $git push
```

## Indítás a saját gépen

1. Kell hozzá Node.js. Ezen a gépen a hordozható változat itt van:
   `%USERPROFILE%\Tools\node-v24.22.0-win-x64`
2. Kattints duplán a `start.cmd` fájlra, vagy futtasd ebben a mappában: `node server.js`
3. Nyisd meg a böngészőben: http://localhost:3000

A szerver csak erről a gépről érhető el (127.0.0.1). Más címhez vagy porthoz használd a
`HOST` és a `PORT` környezeti változót. Ha a szervert más néven éred el (például egy másik
gépről), a `PUBLIC_URL` változóval add meg azt a címet, amely a jelszó-visszaállító linkbe kerül.

Ha a `node_modules` hiányzik, telepítsd újra: `npm ci --ignore-scripts`

## Beállítások

Minden oldalon van egy **Settings** menü: az oldalsávban, vagy ahol oldalsáv nincs, a jobb felső sarokban.

- **Interface size**: a felület mérete 50 és 150% között (A− / A+ gombokkal vagy a csúszkával).
- **Dark mode**: a sötét mód be- és kikapcsolása.
- **Reset**: visszaállítja a 100%-os méretet és a világos módot.

A beállításokat a böngésző megjegyzi (localStorage), így újratöltés után is megmaradnak.

## Jelszó-visszaállító e-mail

Alapból nincs beállított e-mail-fiók. Ilyenkor a visszaállító link a szerver konzolján jelenik meg.
Valódi e-mail-küldéshez indítás előtt add meg a saját fiókod adatait környezeti változóként:

```powershell
$env:SMTP_USER = "sajat.cimed@gmail.com"
$env:SMTP_PASS = "gmail-alkalmazasjelszo"
node server.js
```

Jelszót soha ne írj bele a forráskódba.
