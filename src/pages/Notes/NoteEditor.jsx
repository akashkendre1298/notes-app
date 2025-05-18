import { useRef, useState } from 'react';
import Button from '../../components/Button/Button';


function splitImageAndText(content) {
    // Only match image markdown at the start of the content (with optional whitespace/newlines)
    const match = content.match(/^\s*(!\[[^\]]*\]\([^)]+\))\s*\n?/);
    if (match) {
        const imgMarkdown = match[1];
        const text = content.slice(match[0].length);
        return { imgMarkdown, text };
    }
    return { imgMarkdown: '', text: content };
}

function renderImagesFromMarkdown(content) {
    return content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
        return `<img src="${url}" alt="${alt}" style="max-width:120px;max-height:120px;display:inline-block;margin:4px 0;" />`;
    });
}

const NoteEditor = ({
    note,
    updateTitle,
    updateContent,
    addTag,
    removeTag,
    deleteNote,
}) => {
    const textareaRef = useRef(null);
    const [tagInput, setTagInput] = useState('');

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(file => file.type.startsWith('image/'));
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imgMarkdown = `![image](${event.target.result})`;
                // Always prepend image at top
                const { text } = splitImageAndText(note.content);
                updateContent(imgMarkdown + '\n' + text);
            };
            reader.readAsDataURL(imageFile);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const { imgMarkdown, text } = splitImageAndText(note.content);

    return (
        <>
            <input
                value={note.title}
                onChange={(e) => updateTitle(e.target.value)}
                className="title-input"
            />
            <textarea
                className="content-area"
                value={text}
                onChange={(e) => updateContent((imgMarkdown ? imgMarkdown + '\n' : '') + e.target.value)}
                ref={textareaRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            />
            {/* image preview */}
            <div
                style={{ marginTop: 8, minHeight: 24 }}
                dangerouslySetInnerHTML={{ __html: renderImagesFromMarkdown(imgMarkdown) }}
            />
            <div className="tags-section">
                <div>
                    {note.tags && note.tags.map(tag => (
                        <span key={tag} className="note-tag">
                            {tag}
                            <button
                                className="remove-tag-btn"
                                onClick={() => removeTag(tag)}
                                title="Remove tag"
                                type="button"
                            >×</button>
                        </span>
                    ))}
                </div>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        addTag(tagInput.trim());
                        setTagInput('');
                    }}
                    style={{ marginTop: '0.5rem' }}
                >
                    <input
                        type="text"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        placeholder="Add tag"
                        className="tag-input"
                    />
                    <Button type="submit" style={{ marginLeft: 4 }}>Add</Button>
                </form>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
                <Button onClick={() => deleteNote(note.id)} className="delete-button" noDefault>
                    Delete
                </Button>
            </div>
        </>
    );
};

// Helper to extract image URL from markdown at the start of content
export function extractImageUrl(content) {
    const match = content.match(/^\s*!\[[^\]]*\]\(([^)]+)\)/);
    return match ? match[1] : null;
}

export default NoteEditor;
