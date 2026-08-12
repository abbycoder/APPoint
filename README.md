# APPoint

A desktop appointment tracker built with **Tauri 2**, **React**, **TypeScript**, and **Tailwind CSS**.

Tracks each appointment's date & time, visitor name, contact number,
organization/office, and reason for visit — grouped by day on a ledger-style
timeline, with desktop notifications 15 minutes before each appointment and
again when it starts.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- Tauri's platform dependencies for your OS — follow the official guide:
  https://tauri.app/start/prerequisites/

## Setup

```bash
npm install
```

## Run in development

```bash
npm run tauri dev
```

This starts the Vite dev server and opens the native app window. You can also
run `npm run dev` alone to preview the UI in a regular browser tab (data is
then kept in `localStorage` and notifications fall back to the Web
Notification API), which is handy for quick UI iteration without a Rust
rebuild.

## Build a production app

```bash
npm run tauri build
```

The installer/binary is written to `src-tauri/target/release/bundle/`.

## App icon

A simple placeholder icon is included at `src-tauri/icons/icon.png`. Before a
real release, generate the full platform icon set from your own artwork:

```bash
npm run tauri icon path/to/your-1024x1024-icon.png
```

## How data & notifications work

- **Storage**: appointments are persisted to disk via `@tauri-apps/plugin-store`,
  written as a JSON file in the app's data directory — no external database
  needed.
- **Notifications**: `@tauri-apps/plugin-notification` requests OS notification
  permission on launch. A scheduler (`src/store/useNotificationScheduler.ts`)
  checks every 20 seconds and fires:
  - a **reminder** notification 15 minutes before an appointment,
  - a **starting now** notification at the scheduled time.

## Project structure

```
src/
  components/     UI components (Sidebar, TimeRail, AppointmentCard, AppointmentForm...)
  store/          React hooks: appointment state, notification scheduler, clock
  lib/            Pure helpers: time formatting/grouping, storage, notifications
  types.ts        Appointment types
src-tauri/
  src/main.rs     Tauri entry point, plugin registration
  tauri.conf.json Window, bundle, CSP, and plugin configuration
  capabilities/   Permission grants for the notification & store plugins
```

## Customizing fields

Appointment fields live in `src/types.ts` (`Appointment` / `AppointmentDraft`).
To add a field, update the type, the form in
`src/components/AppointmentForm.tsx`, and where it's displayed in
`src/components/AppointmentCard.tsx`.
