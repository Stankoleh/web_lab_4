# Lab 4 — Django + React Music Playlist CRUD

Функціонал:
- login/logout;
- ролі користувачів;
- users listing + CRUD;
- playlists list/filter/details/create/delete;
- додавання музики/треків у плейлист;
- красивіший дизайн у стилі третьої лабораторної: sidebar, cards, badges, playlist cards.

## Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver 3001
```

Якщо база вже була створена зі старої версії:
```bash
del db.sqlite3
python manage.py migrate
python manage.py seed_data
python manage.py runserver 3001
```

## Frontend
```bash
cd frontend
npm install
npm run dev
```

## Demo login
```text
admin / admin
```
