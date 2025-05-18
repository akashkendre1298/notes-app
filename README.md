# Notes App

A cross-platform note-taking app built with React and Electron. Notes are stored locally (using Electron or browser localStorage) and support tags, markdown image previews, and dark mode.

---

## How to Run the App

### Prerequisites
- **Node.js** (v18 or newer recommended)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning the repo)

### 1. Install dependencies
Open a terminal in the project directory and run:
```bash
npm install
```
This will install all required dependencies for both React and Electron.

### 2. Start the app in development mode
To launch the app with hot-reloading for both the frontend and Electron:
```bash
npm run dev
```
- This starts the Vite development server for React.
- Open a separate terminal and run:
```bash
npm start
```
- This will launch the Electron app and open the Notes app window.

> **Tip:** You can also use `npm run start` directly, which will run both Vite and Electron together using `concurrently`.

### 3. Build for production
To create a production build and package the Electron app:
```bash
npm run build
```
- This will build the React app and then package the Electron app using `electron-builder`.
- The output can be found in the `dist/` or `build/` directory, ready for distribution.

---

## Features Implemented

### Notes CRUD
- **Create, edit, and delete notes** with instant UI updates.
- Each note has a title, content, and a list of tags.

### Tagging System
- Add and remove tags for each note.
- Filter notes by tag using a dropdown in the sidebar.
- All unique tags are automatically collected and shown for filtering.

### Search and Filter
- Search notes by title, content using the search bar.
- Search notes by tags using the dropdown.
- Filtering is case-insensitive and works in real time.

### Image Support
- Drag and drop images directly into the note editor.
- Images are embedded as markdown at the top of the note content.
- Image previews are rendered in the note list and editor.

### Dark Mode
- Toggle between light and dark themes with a single button.
- The UI updates instantly and persists until toggled again.

### Persistent Storage
- **Electron:** Notes are saved to a JSON file in the user's app data directory using IPC (see `main.js` and `preload.js`).
- **Browser:** Notes are saved in `localStorage` if Electron APIs are not available.
- The app automatically detects the environment and uses the appropriate storage method.

### Debounced Auto-Save
- Edits to note content and title are saved automatically after a short delay (debounced with a custom React hook).
- Prevents excessive writes and ensures a smooth user experience.

### Responsive UI
- Sidebar for navigation, tag filtering, and search.
- Main editor area for editing the selected note.
- Clean, modern design with CSS modules.

---

## Challenges Faced

### 1. Cross-Platform Storage
- Needed to support both Electron (desktop) and browser environments.
- Used Electron's IPC and Node.js `fs` module to read/write notes in a JSON file for desktop.
- Fallback to browser `localStorage` for web usage.
- Ensured seamless switching between storage methods without code duplication.

### 2. Image Handling
- Implemented drag-and-drop image upload using the FileReader API.
- Images are embedded as base64 data URLs in markdown format at the top of the note.
- Rendered image previews both in the note list and the editor using custom markdown parsing.


### 3. Debounced Updates
- Created a custom React hook (`useDebouncedCallback`) to debounce saves for both note content and title.
- Prevented excessive state updates and disk writes, especially during rapid typing.
- Ensured immediate UI feedback while saving changes in the background.

### 4. UI Consistency and Responsiveness
- Designed a sidebar and editor layout that works well on various screen sizes.
- Implemented dark mode with a simple toggle and ensured all components adapt their styles.
- Managed focus, selection, and keyboard accessibility for a smooth user experience.

### 5. Electron Integration
- Set up secure context bridging between Electron's main and renderer processes using `preload.js`.
- Used IPC handlers for reading and writing notes, ensuring data integrity and security.
- Handled file path resolution and ensured notes are stored in the correct user data directory.

---

## Project Structure

- `src/pages/Notes/Notes.jsx` — Main notes page, handles state, filtering, and UI logic
- `src/pages/Notes/NoteEditor.jsx` — Editor component for editing note content, title, tags, and images
- `public/main.js` — Electron main process, handles window creation and IPC for notes storage
- `public/preload.js` — Electron preload script, exposes safe APIs to the renderer
- `package.json` — Project configuration, scripts, and dependencies

---

## License

This project is for educational/demo purposes. Feel free to use and modify it for your own needs.
