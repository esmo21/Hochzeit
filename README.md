# Hochzeitsplaner

Eine produktionsnahe, mehrseitige Webanwendung zur Hochzeitsplanung mit semantischem HTML, modernem CSS, Vanilla JavaScript als ES-Module, Supabase Auth und Supabase PostgreSQL. Die App ist bewusst ohne Framework und ohne eigenen Server gebaut, damit sie lokal und über GitHub Project Pages funktioniert.

## Architektur

- `index.html`: geschützte Übersicht mit Kennzahlen und den nächsten offenen Aufgaben.
- `todos.html`: CRUD-Verwaltung für Aufgaben inklusive Status, Sortierung und überfälliger Markierung.
- `geschenke.html`: CRUD-Verwaltung für Geschenkwünsche inklusive Link-, Preis- und Prioritätsvalidierung.
- `gaeste.html`: CRUD-Verwaltung für Familien/Gästegruppen inklusive Summenberechnung.
- `budget.html`: CRUD-Budgetplanung mit Kostenschätzungen, tatsächlichen Kosten und Bezahlstatus.
- `login.html`: Supabase-E-Mail-/Passwort-Anmeldung.
- `js/supabase-client.js`: zentrale Supabase-Client-Instanz.
- `js/auth.js`: gemeinsame Authentifizierung, Session-Prüfung und Abmeldung.
- `supabase/schema.sql` und `supabase/policies.sql`: Datenmodell, Trigger, Indizes und Row Level Security.

## 1. Voraussetzungen

- Ein Supabase-Projekt.
- Ein GitHub-Repository, zum Beispiel `hochzeitsplaner`.
- Ein statischer lokaler Webserver. Öffne die Dateien nicht direkt per `file://`, weil ES-Module und Browser-Sicherheitsregeln sonst Probleme verursachen können.

## 2. Projekt lokal starten

Beispiel mit Python:

```bash
python3 -m http.server 8080
```

Danach öffnest du `http://localhost:8080/` im Browser.

## 3. Supabase-Projekt erstellen

1. Melde dich bei Supabase an.
2. Erstelle ein neues Projekt.
3. Notiere dir unter **Project Settings > API** die Project URL und den Publishable/anon Key.

## 4. SQL-Dateien in Supabase ausführen

1. Öffne in Supabase den **SQL Editor**.
2. Führe zuerst den Inhalt von `supabase/schema.sql` aus.
3. Führe danach den Inhalt von `supabase/policies.sql` aus.

## 5. E-Mail-/Passwort-Anmeldung aktivieren

Unter **Authentication > Providers** muss **Email** aktiviert sein. Für einen privaten Planer kann es sinnvoll sein, öffentliche Registrierungen zu deaktivieren und Benutzer manuell anzulegen.

## 6. Ersten Benutzer anlegen

Unter **Authentication > Users** kannst du einen Benutzer mit E-Mail-Adresse und Passwort anlegen. Mit diesen Daten meldest du dich später auf `login.html` an.

## 7. Supabase-URL und Publishable Key lokal konfigurieren

Kopiere die Beispieldatei:

```bash
cp js/config.example.js js/config.js
```

Trage anschließend deine Werte ein:

```js
export const SUPABASE_URL = "https://DEIN-PROJEKT.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "DEIN_PUBLISHABLE_ODER_ANON_KEY";
```

`js/config.js` ist in `.gitignore` eingetragen, damit keine projektspezifischen Werte versehentlich eingecheckt werden. Die Supabase Project URL und der Publishable beziehungsweise anon Key sind in einer Browser-App allerdings technisch öffentlich sichtbar und daher keine echten Geheimnisse. Sicher ist das nur, wenn du niemals den Service-Role-Key im Frontend nutzt und deine Supabase Row Level Security Policies korrekt greifen.

Für GitHub Pages erzeugt der Workflow `.github/workflows/deploy.yml` diese Datei während des Deployments aus GitHub Actions Secrets. Lege dafür in GitHub unter **Settings > Secrets and variables > Actions** zwei Repository-Secrets an:

- `SUPABASE_URL` mit deiner Supabase Project URL.
- `SUPABASE_PUBLISHABLE_KEY` mit deinem Publishable/anon Key.

Die Datei `js/config.js` bleibt lokal und im Git-Repository ignoriert, wird aber im GitHub-Pages-Artefakt zur Laufzeit erstellt.

## 8. Warum niemals der Service-Role-Key verwendet werden darf

Der Service-Role-Key umgeht Row Level Security und besitzt administrative Rechte. Da diese Anwendung vollständig im Browser läuft, wäre ein Service-Role-Key für jeden Besucher sichtbar. Verwende deshalb niemals den Service-Role-Key im Frontend, sondern nur die Project URL und den Publishable/anon Key. Der Datenschutz wird über Supabase Auth und RLS-Policies erzwungen.

## 9. Projekt zu GitHub pushen

```bash
git init
git add .
git commit -m "Initial wedding planner"
git branch -M main
git remote add origin https://github.com/BENUTZERNAME/hochzeitsplaner.git
git push -u origin main
```

## 10. GitHub Pages aktivieren

Öffne dein Repository bei GitHub und gehe zu **Settings > Pages**. Wähle als Source **GitHub Actions**.

## 11. Automatisches Deployment

Der Workflow `.github/workflows/deploy.yml` deployt die Seite automatisch, wenn Änderungen auf den Branch `main` gepusht werden. Du kannst ihn zusätzlich manuell über **Actions > Deploy GitHub Pages > Run workflow** starten.

## 12. Erwartete URL

Bei einem Repository `hochzeitsplaner` lautet die Project-Pages-URL typischerweise:

```text
https://BENUTZERNAME.github.io/hochzeitsplaner/
```

Die Anwendung nutzt relative Pfade wie `todos.html`, `css/styles.css` und `js/todos.js`. Dadurch funktioniert sie auch unter einem Project-Pages-Unterpfad.

## 13. Eigene Domain verbinden

Optional kannst du unter **Settings > Pages > Custom domain** eine eigene Domain eintragen. Passe anschließend die DNS-Einträge bei deinem Domainanbieter gemäß GitHub-Dokumentation an.

## 14. Typische Fehler beheben

- **404 auf GitHub Pages:** Prüfe, ob Pages auf `main` und `/ (root)` zeigt und ob die Datei wirklich im Repository liegt.
- **CSS oder JS lädt nicht:** Prüfe, dass keine Pfade mit `/` beginnen. Diese App verwendet relative Pfade.
- **Login lädt nicht:** Prüfe, ob `js/config.js` existiert und gültige Supabase-Werte enthält.
- **Daten bleiben leer:** Prüfe, ob du angemeldet bist und ob `schema.sql` sowie `policies.sql` ausgeführt wurden.
- **RLS-Fehler:** Prüfe, ob `supabase/policies.sql` zuletzt im Supabase SQL Editor ausgeführt wurde. Die Policies sind für eine private Nutzung so eingestellt, dass alle angemeldeten Benutzer denselben Planungsbereich sehen und bearbeiten können.
- **Ungültige Links:** Geschenkwunsch-Links müssen mit `http://` oder `https://` beginnen.

## 15. Datenbank und RLS testen

1. Lege zwei Benutzer in Supabase Auth an.
2. Melde dich als Benutzer A an und erstelle Aufgaben, Wünsche und Gästegruppen.
3. Melde dich ab und als Benutzer B an.
4. Benutzer B muss die Daten von Benutzer A sehen, bearbeiten und löschen können.
5. Öffne die App ohne Login oder nach dem Abmelden: Anonyme Besucher dürfen keine Planungsdaten sehen.

## Manuelle Schritte nach der Codegenerierung

1. Supabase-Projekt erstellen.
2. `supabase/schema.sql` ausführen.
3. `supabase/policies.sql` ausführen.
4. E-Mail-/Passwort-Login aktivieren.
5. Mindestens einen Benutzer in Supabase Auth anlegen.
6. `js/config.example.js` nach `js/config.js` kopieren und Project URL sowie Publishable/anon Key eintragen.
7. Lokal mit `python3 -m http.server 8080` testen.
8. Repository zu GitHub pushen.
9. GitHub Pages mit Source **GitHub Actions** aktivieren und die Repository-Secrets `SUPABASE_URL` sowie `SUPABASE_PUBLISHABLE_KEY` anlegen.
10. Die veröffentlichte URL testen und besonders Login, Navigation, CRUD, RLS und mobile Ansicht prüfen.
