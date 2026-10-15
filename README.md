# WareTrack

Egyszerű raktárkezelő (Node.js + Express). Az adatokat helyben, a `data/db.json` fájlban tárolja,
külső adatbázist és idegen fiókot nem használ.

## Indítás

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
