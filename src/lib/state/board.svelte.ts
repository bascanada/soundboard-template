const STORAGE_KEY = 'boards';

export interface SavedBoard {
    id: string;
    name: string;
    clips: string[];
    createdAt: number;
}

interface BoardData {
    current: string[];
    saved: SavedBoard[];
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

function loadBoards(): BoardData {
    if (typeof localStorage === 'undefined') return { current: [], saved: [] };
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // ignore error
    }
    return { current: [], saved: [] };
}

function saveBoards(data: BoardData) {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
}

function createBoardState() {
    const initialData = loadBoards();
    let currentClips = $state<string[]>(initialData.current);
    let savedBoards = $state<SavedBoard[]>(initialData.saved);

    function persist() {
        saveBoards({ current: currentClips, saved: savedBoards });
    }

    return {
        // Current board (in progress)
        get clipIds() {
            return currentClips;
        },
        get count() {
            return currentClips.length;
        },
        get isEmpty() {
            return currentClips.length === 0;
        },
        add(id: string) {
            if (!currentClips.includes(id)) {
                currentClips = [...currentClips, id];
                persist();
            }
        },
        remove(id: string) {
            currentClips = currentClips.filter(cid => cid !== id);
            persist();
        },
        toggle(id: string) {
            if (currentClips.includes(id)) {
                this.remove(id);
            } else {
                this.add(id);
            }
        },
        isInBoard(id: string) {
            return currentClips.includes(id);
        },
        clear() {
            currentClips = [];
            persist();
        },

        // Saved boards
        get saved() {
            return savedBoards;
        },
        saveCurrentAs(name: string) {
            if (currentClips.length === 0) return null;
            const newBoard: SavedBoard = {
                id: generateId(),
                name,
                clips: [...currentClips],
                createdAt: Date.now()
            };
            savedBoards = [...savedBoards, newBoard];
            currentClips = [];
            persist();
            return newBoard;
        },
        deleteBoard(id: string) {
            savedBoards = savedBoards.filter(b => b.id !== id);
            persist();
        },
        loadBoard(id: string) {
            const board = savedBoards.find(b => b.id === id);
            if (board) {
                currentClips = [...board.clips];
                persist();
            }
        },

        // Update a saved board
        updateBoard(id: string, clips: string[]) {
            const index = savedBoards.findIndex(b => b.id === id);
            if (index !== -1) {
                if (clips.length === 0) {
                    // Delete board if empty
                    savedBoards = savedBoards.filter(b => b.id !== id);
                } else {
                    savedBoards = savedBoards.map(b =>
                        b.id === id ? { ...b, clips } : b
                    );
                }
                persist();
            }
        },
        getBoard(id: string) {
            return savedBoards.find(b => b.id === id);
        },

        // URL generation
        generateUrl(clips?: string[], boardId?: string) {
            const clipsToEncode = clips || currentClips;
            if (clipsToEncode.length === 0) return '';
            const base = typeof window !== 'undefined' ? window.location.origin : '';
            const data: { clips: string[]; id?: string } = { clips: clipsToEncode };
            if (boardId) data.id = boardId;
            const encoded = btoa(JSON.stringify(data));
            return `${base}/board?b=${encoded}`;
        },
        encodeBoard(clips?: string[], boardId?: string) {
            const clipsToEncode = clips || currentClips;
            const data: { clips: string[]; id?: string } = { clips: clipsToEncode };
            if (boardId) data.id = boardId;
            return btoa(JSON.stringify(data));
        }
    };
}

export const boardState = createBoardState();
