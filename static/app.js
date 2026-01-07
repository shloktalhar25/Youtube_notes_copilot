// Application State
let currentSessionId = null;
let currentSuggestion = null;
let isLoadingSuggestion = false;

// DOM Elements
const youtubeUrlInput = document.getElementById('youtubeUrl');
const createSessionBtn = document.getElementById('createSessionBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const noteEditor = document.getElementById('noteEditor');
const suggestionBox = document.getElementById('suggestionBox');
const suggestionText = document.getElementById('suggestionText');
const sessionList = document.getElementById('sessionList');
const statusMessage = document.getElementById('statusMessage');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Utility Functions
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
    statusMessage.style.display = 'block';

    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, 5000);
}

function setLoading(isLoading) {
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        createSessionBtn.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        createSessionBtn.disabled = false;
    }
}

// API Functions
async function createSession(youtubeUrl) {
    try {
        setLoading(true);
        showStatus('Fetching video transcript and creating embeddings...', 'info');

        const response = await fetch('/api/create-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ youtube_url: youtubeUrl }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create session');
        }

        const data = await response.json();
        currentSessionId = data.session_id;

        showStatus(`Session created! Video: ${data.video_title}`, 'success');
        noteEditor.disabled = false;
        noteEditor.focus();

        // Clear input
        youtubeUrlInput.value = '';

        // Refresh sessions list
        await loadSessions();

        return data;
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
        console.error('Error creating session:', error);
    } finally {
        setLoading(false);
    }
}

async function getAutocomplete(currentText, cursorPosition) {
    if (!currentSessionId || isLoadingSuggestion) {
        return null;
    }

    try {
        isLoadingSuggestion = true;

        const response = await fetch('/api/autocomplete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: currentSessionId,
                current_text: currentText,
                cursor_position: cursorPosition,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to get autocomplete');
        }

        const data = await response.json();
        return data.suggestion;
    } catch (error) {
        console.error('Error getting autocomplete:', error);
        return null;
    } finally {
        isLoadingSuggestion = false;
    }
}

async function loadSessions() {
    try {
        const response = await fetch('/api/sessions');
        const data = await response.json();

        if (data.sessions.length === 0) {
            sessionList.innerHTML = `
                <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">
                    No active sessions. Create one by entering a YouTube URL above.
                </p>
            `;
            return;
        }

        sessionList.innerHTML = data.sessions.map(session => `
            <div class="session-item ${session.session_id === currentSessionId ? 'active' : ''}" 
                 data-session-id="${session.session_id}">
                <div class="session-info">
                    <h3>${session.video_title}</h3>
                    <p>Video ID: ${session.video_id}</p>
                </div>
                <div class="session-actions">
                    <button class="icon-btn delete-session" data-session-id="${session.session_id}" 
                            title="Delete session">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners to session items
        document.querySelectorAll('.session-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-session')) {
                    const sessionId = item.dataset.sessionId;
                    switchSession(sessionId);
                }
            });
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-session').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const sessionId = btn.dataset.sessionId;
                await deleteSession(sessionId);
            });
        });
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
}

async function deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this session?')) {
        return;
    }

    try {
        const response = await fetch(`/api/session/${sessionId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete session');
        }

        showStatus('Session deleted successfully', 'success');

        if (currentSessionId === sessionId) {
            currentSessionId = null;
            noteEditor.value = '';
            noteEditor.disabled = true;
            hideSuggestion();
        }

        await loadSessions();
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
        console.error('Error deleting session:', error);
    }
}

function switchSession(sessionId) {
    currentSessionId = sessionId;
    noteEditor.disabled = false;
    noteEditor.value = '';
    noteEditor.focus();
    hideSuggestion();

    // Update active state in UI
    document.querySelectorAll('.session-item').forEach(item => {
        item.classList.toggle('active', item.dataset.sessionId === sessionId);
    });

    showStatus('Switched to session', 'info');
}

const ghostTextOverlay = document.getElementById('ghostTextOverlay');

// Suggestion Functions
function showSuggestion(suggestion) {
    currentSuggestion = suggestion;
    updateGhostText();
}

function hideSuggestion() {
    currentSuggestion = null;
    updateGhostText();
}

function updateGhostText() {
    const text = noteEditor.value;
    if (currentSuggestion) {
        const endsWithWhitespace = /\s$/.test(text);
        const spacer = (text && !endsWithWhitespace) ? ' ' : '';
        ghostTextOverlay.innerHTML = escapeHTML(text) + `<span class="ghost-text-suggestion">${escapeHTML(spacer + currentSuggestion)}</span>`;
    } else {
        ghostTextOverlay.innerHTML = escapeHTML(text);
    }
    ghostTextOverlay.scrollTop = noteEditor.scrollTop;
}

function escapeHTML(str) {
    return str.replace(/[&<>"']/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[tag] || tag));
}

function acceptSuggestion() {
    if (!currentSuggestion) return;

    const text = noteEditor.value;
    const endsWithWhitespace = /\s$/.test(text);
    const spacer = (text && !endsWithWhitespace) ? ' ' : '';

    const newText = text + spacer + currentSuggestion;
    noteEditor.value = newText;

    hideSuggestion();
    noteEditor.focus();
    updateGhostText();
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Event Listeners
createSessionBtn.addEventListener('click', async () => {
    const url = youtubeUrlInput.value.trim();
    if (!url) {
        showStatus('Please enter a YouTube URL', 'error');
        return;
    }
    await createSession(url);
});

youtubeUrlInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const url = youtubeUrlInput.value.trim();
        if (url) {
            await createSession(url);
        }
    }
});

// Note editor event listeners
noteEditor.addEventListener('scroll', () => {
    ghostTextOverlay.scrollTop = noteEditor.scrollTop;
});

noteEditor.addEventListener('keydown', async (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();

        if (currentSuggestion) {
            acceptSuggestion();
        } else {
            const currentText = noteEditor.value;
            const cursorPos = noteEditor.selectionStart;

            if (currentText.trim().length > 5) {
                showStatus('Generating suggestion...', 'info');
                const suggestion = await getAutocomplete(currentText, cursorPos);

                if (suggestion) {
                    showSuggestion(suggestion);
                } else {
                    showStatus('Could not generate suggestion.', 'error');
                }
            }
        }
    }

    if (e.key === 'Escape') {
        hideSuggestion();
    }
});

const autoSuggest = debounce(async () => {
    if (!currentSessionId || currentSuggestion) return;

    const currentText = noteEditor.value;
    const cursorPos = noteEditor.selectionStart;

    if (currentText.trim().length > 30) {
        const lines = currentText.split('\n');
        const lastLine = lines[lines.length - 1];

        if (lastLine.length > 20 && !lastLine.endsWith('.')) {
            const suggestion = await getAutocomplete(currentText, cursorPos);
            if (suggestion) {
                showSuggestion(suggestion);
            }
        }
    }
}, 2000);

noteEditor.addEventListener('input', () => {
    if (currentSuggestion) {
        hideSuggestion();
    }
    updateGhostText();
    autoSuggest();
});

// Clear button
clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all notes?')) {
        noteEditor.value = '';
        hideSuggestion();
        noteEditor.focus();
    }
});

// Download button
downloadBtn.addEventListener('click', () => {
    const text = noteEditor.value;
    if (!text.trim()) {
        showStatus('No notes to download', 'error');
        return;
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-notes-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showStatus('Notes downloaded successfully', 'success');
});

// Load sessions on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSessions();
});
