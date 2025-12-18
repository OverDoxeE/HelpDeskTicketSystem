# HelpDeskTicketSystem – Backend

## Opis projektu

HelpDeskTicketSystem to backendowa aplikacja webowa stworzona jako **projekt zaliczeniowy z przedmiotu *****Programowanie Zaawansowane***.\
System realizuje uproszczony **Help Desk / Ticket System** inspirowany narzędziami typu ServiceNow.

Backend odpowiada za:

- uwierzytelnianie i autoryzację użytkowników
- zarządzanie ticketami, kategoriami i komentarzami
- egzekwowanie reguł biznesowych i uprawnień
- udostępnianie REST API dla oddzielnego frontendu

Projekt został zaprojektowany w celu jednoznacznego zaprezentowania:

- architektury **klient–serwer**
- wykorzystania **ORM (Django ORM)** oraz relacyjnej bazy danych
- **systemu ról i uprawnień**
- zastosowania **wzorca projektowego (Command)**
- czytelnego podziału odpowiedzialności w kodzie

## 🧱 Architektura

- **Backend**: Django 5 + Django REST Framework
- **Styl architektoniczny**: Klient–Serwer, architektura warstwowa
- **Baza danych**: SQLite (wystarczająca dla projektu akademickiego)

### Zastosowane wzorce projektowe

#### ✅ Wzorzec Polecenie (Command Pattern)

W projekcie zastosowano wzorzec **Command** do obsługi zmiany statusu ticketu.

Zamiast modyfikować stan ticketu bezpośrednio w widoku, logika biznesowa została przeniesiona do klasy polecenia:

- `ChangeTicketStatusCommand`

Korzyści:

- rozdzielenie logiki biznesowej od warstwy HTTP
- łatwa rozbudowa (np. logowanie historii zmian, powiadomienia)
- uproszczone i czytelne widoki (kontrolery)

Wzorzec **Command** jest kluczowym elementem architektury projektu i spełnia wymagania kursu.

---

## 👥 Role użytkowników i uprawnienia

System obsługuje kilka ról użytkowników:

| Rola       | Opis                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| USER       | Może tworzyć tickety, przeglądać własne tickety, dodawać publiczne komentarze         |
| TECHNICIAN | Może przeglądać wszystkie tickety, zmieniać ich status, widzieć komentarze wewnętrzne |
| ADMIN      | Pełny dostęp, zarządzanie użytkownikami, usuwanie komentarzy                          |

Uprawnienia realizowane są przy użyciu:

- systemu uprawnień Django
- własnych klas permissions w Django REST Framework

---

## 🗃️ Modele i relacje w bazie danych

Główne encje:

- **User** (wbudowany model Django)
- **Ticket**
- **Category**
- **Comment**

Relacje:

- Ticket → User (`created_by`)
- Ticket → User (`assigned_to`)
- Ticket → Category
- Comment → Ticket
- Comment → User (`author`)

---

## ✅ Walidatory biznesowe

Projekt zawiera **walidację logiki biznesowej** na poziomie serializerów:

Przykłady:

- minimalna długość tytułu i opisu ticketu
- termin (`due_date`) nie może być w przeszłości
- zamknięty ticket nie może zostać ponownie otwarty
- walidacja treści komentarzy
- komentarze wewnętrzne dostępne tylko dla techników i administratorów

## 🚀 Jak uruchomić backend od zera (po `git clone`)

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

- **Windows (PowerShell)**

```bash
venv\Scripts\Activate
```

- **Linux / macOS**

```bash
source venv/bin/activate
```

---

### 3️⃣ Instalacja zależności

```bash
pip install -r requirements.txt
```

> ⚠️ Uwaga: katalog `venv`, plik `db.sqlite3` oraz pliki środowiskowe są ignorowane przez git i muszą zostać utworzone lokalnie.

---
### 4️⃣ Migracje bazy danych

```bash
python manage.py migrate
```

---

### 5️⃣ Utworzenie superusera (administrator)

```bash
python manage.py createsuperuser
```

Konto administratora umożliwia:

- logowanie do panelu Django Admin
- zarządzanie użytkownikami i rolami

---

### 6️⃣ (Opcjonalnie) Dane testowe / seed

Jeśli dostępna jest komenda seedująca dane:

```bash
python manage.py seed_demo_data
```

Komenda tworzy przykładowych:

- użytkowników
- tickety
- kategorie
- komentarze

---

### 7️⃣ Uruchomienie serwera developerskiego

```bash
python manage.py runserver
```

Backend będzie dostępny pod adresem:

```
http://127.0.0.1:8000/
```

Endpoint testowy:

```
GET /api/health/
```

---

## 🔗 Przegląd API (wybrane endpointy)

### Tickety

- `GET /api/tickets/`
- `POST /api/tickets/`
- `GET /api/tickets/{id}/`
- `PATCH /api/tickets/{id}/`
- `PATCH /api/tickets/{id}/status/`

### Kategorie

- `GET /api/categories/`
- `POST /api/categories/`

### Komentarze

- `GET /api/tickets/{ticket_id}/comments/`
- `POST /api/tickets/{ticket_id}/comments/`
- `DELETE /api/comments/{id}/` *(tylko ADMIN)*

### Statystyki / Dashboard

- `GET /api/tickets/stats/` *(TECHNICIAN / ADMIN)*

---
