# HelpDeskTicketSystem – Projekt zaliczeniowy (Backend + Frontend)

## 📌 Opis projektu

**HelpDeskTicketSystem** to kompletna aplikacja webowa typu **Help Desk / Ticket System**, zrealizowana jako **projekt zaliczeniowy z przedmiotu _Programowanie Zaawansowane_**.

Projekt został wykonany w architekturze **klient–serwer** i składa się z:

- **Backendu** (Django 5 + Django REST Framework)
- **Frontendu** (React SPA + MUI)

System umożliwia zgłaszanie, przeglądanie oraz obsługę zgłoszeń IT (ticketów) z wykorzystaniem **systemu ról, ORM oraz walidacji biznesowej**.

---

## 🎯 Realizacja tematu

Projekt **w całości realizuje wybrany temat**:

- użytkownicy mogą zgłaszać tickety powiązane z ich kontem
- technicy IT obsługują zgłoszenia, zmieniają ich status i przypisanie
- administrator posiada pełny dostęp do systemu
- dane przechowywane są w relacyjnej bazie danych SQL
- frontend komunikuje się z backendem przez REST API

---

## 🧱 Architektura i wzorce

### Architektura

- **Styl**: Klient–Serwer
- **Backend**: Django 5 + Django REST Framework
- **Frontend**: React (Vite) + Material UI (MUI)
- **Baza danych**: SQLite

Kod backendu posiada czytelny **podział na warstwy**:

- views (kontrolery API)
- serializers (walidacja i mapowanie danych)
- permissions (autoryzacja)
- services (logika biznesowa)

### ✅ Zastosowany wzorzec projektowy – Command Pattern

W projekcie zastosowano **wzorzec Polecenie (Command)** do obsługi zmiany statusu ticketu:

- `ChangeTicketStatusCommand`

Korzyści:

- oddzielenie logiki biznesowej od warstwy HTTP
- możliwość łatwej rozbudowy (np. historia zmian, notyfikacje)
- czytelniejsze i prostsze widoki API

Wzorzec jest użyty **świadomie i adekwatnie do skali projektu**.

---

## 👥 Role użytkowników

System obsługuje **trzy role**, których działanie jest odczuwalne w aplikacji:

| Rola | Uprawnienia |
|-----|-------------|
| **USER** | Tworzy tickety, widzi tylko własne zgłoszenia, dodaje publiczne komentarze |
| **TECHNICIAN** | Widzi wszystkie tickety, może je przypisywać, zmieniać status, widzi komentarze wewnętrzne |
| **ADMIN** | Pełny dostęp: użytkownicy, kategorie, tickety, usuwanie komentarzy |

Uprawnienia realizowane są przy użyciu:

- systemu użytkowników Django
- własnych klas permissions w Django REST Framework

---

## 🗃️ Modele i relacje (ORM)

Projekt wykorzystuje **Django ORM** w sposób zaawansowany.

### Modele:

- **User** (wbudowany model Django)
- **Ticket**
- **Category**
- **Comment**

### Relacje:

- Ticket → User (`created_by`)
- Ticket → User (`assigned_to`)
- Ticket → Category
- Comment → Ticket
- Comment → User (`author`)

ORM wykorzystywany jest do:

- CRUD
- filtrowania i sortowania
- złożonych zapytań (`select_related`, `annotate`, `Count`)
- statystyk i agregacji danych

---

## ✅ Walidacja danych (logika biznesowa)

Projekt zawiera **pełny zestaw walidatorów biznesowych**, m.in.:

- minimalna długość tytułu i opisu ticketu
- `due_date` nie może być w przeszłości
- zamknięty ticket (`CLOSED`) nie może zostać ponownie otwarty
- walidacja przypisania ticketu tylko do TECHNICIAN / ADMIN
- walidacja treści komentarzy
- komentarze wewnętrzne widoczne tylko dla techników i administratorów

Walidacja realizowana jest głównie na poziomie **serializerów DRF**.

---

## 🖥 Frontend (React)

Frontend jest oddzielną aplikacją SPA:

- React + Vite
- Material UI (MUI)
- komunikacja z backendem przez REST API

Zaimplementowane widoki:

- Login Page
- Lista ticketów (tabela z sortowaniem)
- Filtrowanie „Moje przypisane” dla techników
- Szczegóły ticketu (edycja statusu, priorytetu, przypisania)
- Sekcja komentarzy (publiczne + wewnętrzne)
- Panel użytkownika
---

## 🚀 Jak uruchomić projekt (od zera)

### 1️⃣ Klonowanie repozytorium

```bash
git clone https://github.com/OverDoxeE/HelpDeskTicketSystem.git
cd HelpDeskTicketSystem
```

---

### 2️⃣ Utworzenie wirtualnego środowiska

```bash
python -m venv venv
```

Aktywacja:

**Windows (PowerShell)**
```bash
venv\Scripts\Activate
```

**Linux / macOS**
```bash
source venv/bin/activate
```

---

### 3️⃣ Instalacja zależności backendu

```bash
pip install -r requirements.txt
```

> Katalog `venv`, plik `db.sqlite3` oraz pliki środowiskowe są ignorowane przez git i tworzone lokalnie.

---

### 4️⃣ Migracje bazy danych

```bash
python manage.py migrate
```

---

### 5️⃣ Utworzenie konta administratora

```bash
python manage.py createsuperuser
```

---

### 6️⃣ (Opcjonalnie) Dane testowe

```bash
python manage.py seed_demo_data
```

Tworzy przykładowych użytkowników, kategorie, tickety i komentarze.

---
tworzone są przykładowe konta użytkowników wraz z przypisanymi rolami:

**Dane logowania (demo):**

-  **ADMIN**: `admin_demo` / `admin@example.com` — hasło: `admin1234`
-  **TECHNICIAN**: `tech_demo` / `tech@example.com` — hasło: `tech1234`
-  **USER**: `user_demo` / `user@example.com` — hasło: `user1234`

---
Jak uruchomić FRONTEND na nowym sprzęcie

### 1️⃣ Przejdź do katalogu projektu

```bash
cd HelpDeskTicketSystem
```

### 2️⃣ Wejdź do folderu frontend

```bash
cd frontend
```

### 3️⃣ Zainstaluj zależności

Jeśli masz **Node.js + npm**:

```bash
npm install
```

> Jeśli ktoś nie ma Node.js → trzeba zainstalować:
> [https://nodejs.org/](https://nodejs.org/)
> (wersja LTS wystarczy)

---

### 4️⃣ Uruchom projekt

```bash
npm run dev
```


### 7️⃣ Uruchomienie serwera

```bash
python manage.py runserver
```

Aplikacja dostępna pod adresem:

```
http://127.0.0.1:8000/
```

Endpoint testowy:

```
GET /api/health/
```

---

## 🔗 Przegląd API (wybrane endpointy)

### Autoryzacja

- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`

### Tickety

- `GET /api/tickets/`
- `POST /api/tickets/`
- `GET /api/tickets/{id}/`
- `PATCH /api/tickets/{id}/status/`
- `PATCH /api/tickets/{id}/assign/`

### Kategorie

- `GET /api/categories/`
- `POST /api/categories/`

### Komentarze

- `GET /api/tickets/{ticket_id}/comments/`
- `POST /api/tickets/{ticket_id}/comments/`
- `DELETE /api/comments/{id}/` *(ADMIN)*

### Statystyki

- `GET /api/tickets/stats/` *(TECHNICIAN / ADMIN)*

---

## 🧠 Podsumowanie

Projekt spełnia **wszystkie kryteria zaliczeniowe**:

- wykorzystuje ORM i relacyjną bazę danych
- posiada system użytkowników i ról
- stosuje walidację biznesową
- realizuje temat w całości
- wykorzystuje poprawny wzorzec architektoniczny

---

## ✍️ Autorzy

- **Frontend**: @OverDoxeE
- **Backend**: @GregorySVD

