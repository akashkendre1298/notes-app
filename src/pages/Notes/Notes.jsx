import { useEffect, useState, useRef } from 'react';
import Button from '../../components/Button/Button';
import './Notes.css';
import NoteEditor, { extractImageUrl } from './NoteEditor';


// This function removes the first image markdown (e.g., ![alt](url)) from the beginning of the note content.
function stripImageMarkdown(content) {
    return content.replace(/^[\s]*!\[[^\]]*\]\([^)]+\)[\s]*\n?/, '');
}

// Custom React hook for debouncing a callback function

function useDebouncedCallback(callback, delay, deps) {
    const handler = useRef();
    useEffect(() => {
        if (handler.current) clearTimeout(handler.current); // Clear previous timer if any
        handler.current = setTimeout(callback, delay);      // Set new timer
        return () => clearTimeout(handler.current);         // Cleanup on unmount or deps change
        // eslint-disable-next-line
    }, deps);
}

// Loads notes from either Electron (if available) or localStorage
const getNotesFromStorage = async () => {
    if (window.electronAPI?.getNotes) {
        // Electron: fetch notes from backend (file/db)
        return await window.electronAPI.getNotes();
    }
    // Fallback: browser localStorage
    const raw = localStorage.getItem('notes');
    return raw ? JSON.parse(raw) : [];
};

// Saves notes to either Electron (if available) or localStorage
const saveNotesToStorage = (notes) => {
    if (window.electronAPI?.saveNotes) {
        // Electron: save notes via backend
        window.electronAPI.saveNotes(notes);
    } else {
        // Fallback: browser localStorage
        localStorage.setItem('notes', JSON.stringify(notes));
    }
};

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [activeNoteId, setActiveNoteId] = useState(null);
    const [search, setSearch] = useState('');
    const [darkMode, setDarkMode] = useState(true); 
    const [tagFilter, setTagFilter] = useState('all');
    const [pendingContent, setPendingContent] = useState('');
    const [pendingTitle, setPendingTitle] = useState('');

    useEffect(() => {
        getNotesFromStorage().then(setNotes);
    }, []);

    useEffect(() => {
        saveNotesToStorage(notes);
    }, [notes]);

    // Debounced save for content
    useDebouncedCallback(() => {
        if (activeNoteId !== null && pendingContent !== '') {
            const updated = notes.map((note) =>
                note.id === activeNoteId ? { ...note, content: pendingContent } : note
            );
            setNotes(updated);
        }
    }, 1000, [pendingContent]);

    // Debounced save for title
    useDebouncedCallback(() => {
        if (activeNoteId !== null && pendingTitle !== '') {
            const updated = notes.map((note) =>
                note.id === activeNoteId ? { ...note, title: pendingTitle } : note
            );
            setNotes(updated);
        }
    }, 1000, [pendingTitle]);

    const createNote = () => {
        const newNote = {
            id: Date.now(),
            title: 'Untitled Note',
            content: '',
            tags: [],
        };
        const updated = [newNote, ...notes];
        setActiveNoteId(newNote.id);
        setNotes(updated);
    };

    const deleteNote = (id) => {
        const updated = notes.filter((n) => n.id !== id);
        setActiveNoteId(null);
        setNotes(updated);
    };

    // For immediate UI update, but debounced save
    const updateContent = (val) => {
        setPendingContent(val);
        setNotes(notes =>
            notes.map((note) =>
                note.id === activeNoteId ? { ...note, content: val } : note
            )
        );
    };

    const updateTitle = (val) => {
        setPendingTitle(val);
        setNotes(notes =>
            notes.map((note) =>
                note.id === activeNoteId ? { ...note, title: val } : note
            )
        );
    };

    // Tag management
    const addTag = (tag) => {
        if (!tag.trim()) return;
        setNotes(notes =>
            notes.map(note =>
                note.id === activeNoteId && !note.tags.includes(tag)
                    ? { ...note, tags: [...note.tags, tag] }
                    : note
            )
        );
    };
    const removeTag = (tag) => {
        setNotes(notes =>
            notes.map(note =>
                note.id === activeNoteId
                    ? { ...note, tags: note.tags.filter(t => t !== tag) }
                    : note
            )
        );
    };

    const activeNote = notes.find((n) => n.id === activeNoteId);

    // Collect all unique tags for the dropdown
    const allTags = Array.from(new Set(notes.flatMap(n => n.tags || [])));

    const filtered = notes.filter(
        (n) =>
            (tagFilter === 'all' || (n.tags && n.tags.includes(tagFilter))) &&
            (
                n.title.toLowerCase().includes(search.toLowerCase()) ||
                n.content.toLowerCase().includes(search.toLowerCase()) ||
                (n.tags && n.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
            )
    );

    // Dark mode toggle
    useEffect(() => {
        document.body.classList.toggle('dark-mode', darkMode);
    }, [darkMode]);

    return (
        <div className={`app-container${darkMode ? ' dark' : ''}`}>
            {/* Sidebar */}
            <div className="sidebar">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Button onClick={createNote}>New Note</Button>
                    <Button onClick={() => setDarkMode(d => !d)}>
                        {darkMode ? '☀️ Light' : '🌙 Dark'}
                    </Button>
                </div>
                {/* Tag filter dropdown */}
                <select
                    value={tagFilter}
                    onChange={e => setTagFilter(e.target.value)}
                    style={{ marginBottom: '0.5rem', padding: '0.25rem', borderRadius: 6 }}
                >
                    <option value="all">All Notes</option>
                    {allTags.map(tag => (
                        <option key={tag} value={tag}>
                            {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </option>
                    ))}
                </select>
                <input
                    placeholder="Search..."
                    className="search-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="note-list">
                    {filtered.map((note) => {
                        const imgUrl = extractImageUrl(note.content);
                        const contentWithoutImg = stripImageMarkdown(note.content);
                        return (
                            <div
                                key={note.id}
                                onClick={() => setActiveNoteId(note.id)}
                                className={`note-item ${note.id === activeNoteId ? 'active' : ''}`}
                            >
                                <div className="note-header-row">
                                    {imgUrl && (
                                        <img
                                            src={imgUrl}
                                            alt="preview"
                                            style={{
                                                width: 32,
                                                height: 32,
                                                objectFit: 'cover',
                                                marginRight: 8,
                                                borderRadius: 4,
                                                verticalAlign: 'middle',
                                                display: 'inline-block',
                                                flexShrink: 0
                                            }}
                                        />
                                    )}
                                    <div className="note-title">{note.title}</div>
                                </div>
                                <div className="note-content">{contentWithoutImg}</div>
                                <div className="note-tags">
                                    {note.tags && note.tags.map(tag => (
                                        <span key={tag} className="note-tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Editor */}
            <div className="editor">
                {activeNote ? (
                    <NoteEditor
                        note={activeNote}
                        updateTitle={updateTitle}
                        updateContent={updateContent}
                        addTag={addTag}
                        removeTag={removeTag}
                        deleteNote={deleteNote}
                    />
                ) : (
                    <div className="empty-message">Select or create a note to begin</div>
                )}
            </div>
        </div>
    );
};

export default Notes;
