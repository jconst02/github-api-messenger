import { useState, useEffect } from "react";
import { type User } from 'firebase/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import styles from './ChatList.module.css';

interface ChatItem {
    id: string;
    commentId: string;
    name: string
}

interface ChatListProps {
    user: User | null;
    token: string | undefined;
}

const ChatList = ({ user, token } : ChatListProps) => {
    if(!user) {
        return <Navigate to="/login" replace />;
    }
    
    const [chatList, setChatList] = useState<ChatItem[]>([]);
    const [gistChatFile, setGistChatFile] = useState<string|undefined>(undefined);
    const [updateCounter, setUpdateCounter] = useState(0);

    const [modal, setModal] = useState({ show: false, mode: "add" as "add" | "create", text: "", error: "" })
    
    useEffect(() => {
        if (!token) return;

        const fetchOrCreateGist = async () => {
            const res = await fetch('https://api.github.com/gists', {
                headers : { Authorization: `token ${token}` }
            })
    
            const data = await res.json();

            const gist = data.find((gist: any) => gist.description === 'gitmessagefile');

            if (gist) {
                setGistChatFile(gist.comments_url);
            }
            else {
                const createRes = await fetch('https://api.github.com/gists', {
                    method: 'POST',
                    headers : { Authorization: `token ${token}` },
                    body: JSON.stringify({
                        description: "gitmessagefile",
                        public: false,
                        files: {
                            "gistfile1.txt": {
                                content: "gitmessagefile"
                            }
                        }
                    })
                });
                const newGist = await createRes.json();
                setGistChatFile(newGist.comments_url);
            }
        }

        fetchOrCreateGist();
    }, [token]);

    useEffect(() => {
        if (!gistChatFile || !token) return;

        fetch(gistChatFile, {
            cache: 'no-store',
            headers : { Authorization: `token ${token}` }
        }).then(res => res.json())
        .then(data => {
            const mapped = data.map((comment: any) => {
                const [id, name] = comment.body.split(/\r?\n/)
                return { 
                    id: id, 
                    commentId: comment.id, 
                    name: name
                }
            });
            setChatList(mapped);
        })
    }, [gistChatFile, token, updateCounter]);

    const navigate = useNavigate();

    const openChat = (chat: ChatItem) => {
        navigate('/chat', {
            state: {
                chat,
                gistChatFile,
            }
        });
    }

    const gistExists = async (gist_id: String) => {
        const res = await fetch(`https://api.github.com/gists/${gist_id}`, {
            headers : { Authorization: `token ${token}` }
        });

        if (!res.ok) {
            return { exists: false, name: null };
        }

        const data = await res.json();

        return {
            exists: true,
            name: data.files[Object.keys(data.files)[0]].content
        }
    }

    const addChat = async(gist_id: String) => {
        if (!gistChatFile || !token) return;

        const { exists, name } = await gistExists(gist_id);

        if (!exists) {
            setModal(prev => ({...prev, error: "Gist with that ID does not exist"}));
            return;
        }
        
        if (chatList.some((chat) => chat.id === gist_id)){
            setModal(prev => ({...prev, error: "Chat is already added"}));
            return;
        }

        await fetch(gistChatFile, {
            method: 'POST',
            headers: {
                Authorization: `token ${token}`
            },
            body: JSON.stringify({ body: `${gist_id}\r\n${name}` })
        });

        setModal(prev => ({...prev, show: false, text: "", error: ""}))
        setUpdateCounter(prev => prev + 1);
    }

    const createChat = async(chatName: string) => {
        if (!gistChatFile || !token) return;
        const createRes = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers : { Authorization: `token ${token}` },
            body: JSON.stringify({
                description: chatName,
                public: false,
                files: {
                    "gistfile1.txt": {
                        content: chatName
                    }
                }
            })
        });

        const newGist = await createRes.json();
        addChat(newGist.id);
    }


    return (
        <>
            <div className={styles.chatlist}>
                <div className={styles.bar}>
                    <div>
                        Chats
                    </div>
                    <button className={styles.addChatButton} onClick={() => { 
                        setModal(prev => ({...prev, show: true, mode: "add"}));
                    }}>
                        Add Chat
                    </button>
                    <button className={styles.createChatButton} onClick={() => {
                        setModal(prev => ({...prev, show: true, mode: "create"}));
                    }}>
                        Create Chat
                    </button>
                </div>
                <div className={styles.chatlistbody}>
                    {chatList.map(chat => (
                        <div
                            key={chat.commentId}
                            className={styles.chatpreview}
                            onClick={() => openChat(chat)}
                        >
                            {chat.name}
                        </div>
                    ))}
                </div>
                { modal.show && (
                    <div className={styles.modal}>
                        <div className={styles.modalcontent}>
                            <div>
                                {modal.mode === 'add' ? "Enter Gist ID" : "Enter chat name"}
                            </div>
                            <input 
                                value={modal.text}
                                onChange={(e) => setModal(prev => ({...prev, text: e.target.value}))}
                            >
                            </input>
                            <div className={styles.buttonRow}>
                                <button onClick={() => {
                                    setModal(prev => ({...prev, show: false, text: "", error: ""}))
                                }}>Cancel
                                </button>
                                {modal.mode === 'add' && (
                                    <button onClick={() => {
                                        addChat(modal.text);
                                    }}>
                                        Add Chat
                                    </button>
                                )}
                                {modal.mode === 'create' && (
                                    <button 
                                    disabled={!modal.text}
                                    onClick={() => {
                                        createChat(modal.text);
                                    }}>
                                        Create Chat
                                    </button>
                                )}
                            </div>
                            {modal.error && 
                                <div className={styles.error}>
                                    {modal.error}
                                </div>
                            }
                        </div>
                    </div>
                )}

            </div>
        </>
    )
}

export default ChatList;