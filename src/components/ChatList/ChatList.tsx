import { useState, useEffect } from "react";
import { type User } from 'firebase/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import styles from './ChatList.module.css';
import Modal from "../Modal/Modal";

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
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState<"add"|"create">("add");
    const [text, setText] = useState("");
    const [modalError, setModalError] = useState("");
    
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
    }, [gistChatFile, token]);

    const navigate = useNavigate();

    const openChat = (chat: ChatItem) => {
        navigate('/chat', {
            state: {
                chat,
                gistChatFile,
            }
        });
    }

    const gistExists = async (gist_id: string) => {
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

    const addChat = async(gist_id: string) => {
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

        const res = await fetch(gistChatFile, {
            method: 'POST',
            headers: {
                Authorization: `token ${token}`
            },
            body: JSON.stringify({ body: `${gist_id}\r\n${name}` })
        });

        const newComment = await res.json();

        setChatList(prev => [...prev,{
            id: gist_id,
            commentId: newComment.id,
            name: name
        }]);

        setShowModal(false);
        setText("");
        setModalError("");
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
        <div className={styles.chatlist}>
            <div className={styles.bar}>
                <div>Chats</div>
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
            { showModal && (
                <Modal
                    title={mode === 'add' ? "Enter Gist ID" : "Enter chat name"}
                    inputValue={text}
                    submitLabel={mode === 'add' ? "Add Chat" : "Create Chat"}
                    error={modalError}
                    onInputChange={setText}
                    onCancel={() => {
                        setShowModal(false);
                        setText("");
                        setModalError("");
                    }}
                    onSubmit={() => mode === 'add' ? addChat(text) : createChat(text)}
                />
            )}

        </div>
    )
}

export default ChatList;