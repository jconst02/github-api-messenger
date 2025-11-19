import { useState, useEffect } from "react";
import { type User } from 'firebase/auth';
import { Navigate, data, useNavigate } from 'react-router-dom';
import styles from './ChatList.module.css';

interface ChatItem {
    id: string;
    commentId: string;
    name: string
}

interface ChatListProps {
    user: User | null;
    username: string | null;
    token: string | undefined;
}

const ChatList = ({ user, token, username } : ChatListProps) => {
    if(!user) {
        return <Navigate to="/login" replace />;
    }
    
    const [chatList, setChatList] = useState<ChatItem[]>([]);
    const [gistChatFile, setGistChatFile] = useState<string|undefined>(undefined);
    const [showModal, setShowModal] = useState<Boolean>(false);
    const [mode, setMode] = useState<"add"|"create">("add");
    const [text, setText] = useState("");
    const [updateCounter, setUpdateCounter] = useState(0);
    const [modalError, setModalError] = useState("");

    useEffect(() => {
        const fetchOrCreateGist = async () => {
            const res = await fetch('https://api.github.com/gists', {
                headers : {
                    Authorization: `token ${token}`
                }
            })
    
            const data = await res.json();
            const gist = data.find((gist: any) => gist.description === 'gitmessagefile');
            if (gist) {
                setGistChatFile(gist.comments_url);
                console.log(gist.comments_url);
            }
            else {
                const createRes = await fetch('https://api.github.com/gists', {
                    method: 'POST',
                    headers : {
                        Authorization: `token ${token}`
                    },
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
    }, []);

    useEffect(() => {
        if (!gistChatFile || !token) return;

        fetch(gistChatFile, {
            cache: 'no-store',
            headers : {
                Authorization: `token ${token}`
            }
        }).then(res => res.json())
        .then(data => {
            console.log(data)
            const mapped = data.map((comment: any) => {
                const [id, name] = comment.body.split("\r\n")
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
            headers : {
                Authorization: `token ${token}`
            }
        });

        if (!res.ok) {
            return { exists: false, name: null };
        }
        const data = await res.json();
        console.log("added",data);

        return {
            exists: true,
            name: data.description
        }
    }

    const addChat = async(gist_id: String) => {
        if (!gistChatFile || !token) return;
        const { exists, name } = await gistExists(gist_id);
        if (!exists) {
            setModalError("Gist with that ID does not exist");
            return;
        }
        
        if (chatList.some((chat) => chat.id === gist_id)){
            setModalError("Chat is already added");
            return;
        }

        await fetch(gistChatFile, {
            method: 'POST',
            headers: {
                Authorization: `token ${token}`
            },
            body: JSON.stringify({ body: `${gist_id}\r\n${name}` })
        });
        setShowModal(false);
        setText("");
        setModalError("");
        setUpdateCounter(prev => prev + 1);
    }

    const createChat = async(chatName: string) => {
        if (!gistChatFile || !token) return;
        const createRes = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers : {
                Authorization: `token ${token}`
            },
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
        console.log(newGist);
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
                        setShowModal(true);
                        setMode("add");
                    }}>
                        Add Chat
                    </button>
                    <button className={styles.createChatButton} onClick={() => {
                        setShowModal(true);
                        setMode("create")
                    }}>
                        Create Chat
                    </button>
                </div>
                <div className={styles.chatlistbody}>
                    {chatList.map((chat, i) => (
                        <div
                            key={i}
                            className={styles.chatpreview}
                            onClick={() => openChat(chat)}
                        >
                            {chat.name}
                        </div>
                    ))}
                </div>
                { showModal && (
                    <div className={styles.modal}>
                        <div className={styles.modalcontent}>
                            <div>
                                {mode === 'add' ? "Enter Gist ID" : "Enter chat name"}
                            </div>
                            <input onChange={(e) => 
                                setText(e.target.value)}
                            >
                            </input>
                            <div className={styles.buttonRow}>
                                <button onClick={() => {
                                    setShowModal(false);
                                    setText("");
                                    setModalError("");
                                }}>Cancel
                                </button>
                                {mode === 'add' && (
                                    <button onClick={() => {
                                        addChat(text);
                                    }}>
                                        Add Chat
                                    </button>
                                )}
                                {mode === 'create' && (
                                    <button 
                                    disabled={!text}
                                    onClick={() => {
                                        createChat(text);
                                    }}>
                                        Create Chat
                                    </button>
                                )}

                            </div>
                            {modalError && 
                                <div className={styles.error}>
                                    {modalError}
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