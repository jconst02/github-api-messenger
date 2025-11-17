import { useState, useEffect } from "react";
import { type User } from 'firebase/auth';
import { Navigate, data, useNavigate } from 'react-router-dom';
import styles from './ChatList.module.css';

interface ChatItem {
    id: string;
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
    const [text, setText] = useState("");
    const [updateCounter, setUpdateCounter] = useState(0);
    const [modalError, setModalError] = useState("");

    useEffect(() => {
        fetch('https://api.github.com/gists', {
            headers : {
                Authorization: `token ${token}`
            }
        }).then(res => res.json())
        .then(data => {
            console.log(data);
            const gist = data.filter((gist: any) => gist.description === 'gitmessagefile');
            if (gist.length !== 0) {
                setGistChatFile(gist[0].comments_url);
                console.log(gist[0].comments_url);
            }
            //TODO: Create gist if not found
        });
    }, [])

    useEffect(() => {
        if (!gistChatFile || !token) return;

        fetch(gistChatFile, {
            headers : {
                Authorization: `token ${token}`
            }
        }).then(res => res.json())
        .then(data => {
            console.log(data)
            const mapped = data.map((comment: any) => {
                const [id, name] = comment.body.split("\r\n")
                console.log(comment.body.split("\r\n"));
                return { id: id, name: name}
            })
            setChatList(mapped);
            console.log(mapped);
        })
    }, [gistChatFile, token, updateCounter]);

    const navigate = useNavigate();
    const openChat = (chat: ChatItem) => {
        navigate('/chat', {
            state: {
                chat
            }
        });
    }

    const gistExists = async (gist_id: String) => {
        const res = await fetch(`https://api.github.com/gists/${gist_id}`, {
            headers : {
                Authorization: `token ${token}`
            }
        });

        return res.ok;
    }

    const addChat = async(gist_id: String) => {
        if (!gistChatFile || !token) return;
        const exists = await gistExists(gist_id);
        if (!exists) {
            setModalError("Gist with that ID does not exist");
            return;
        }

        await fetch(gistChatFile, {
            method: 'POST',
            headers: {
                Authorization: `token ${token}`
            },
            body: JSON.stringify({ body: `${gist_id}\r\nchat name` })
        });
        setShowModal(false);
        setText("");
        setModalError("");
        setUpdateCounter(prev => prev + 1);
    }

    return (
        <>
            <div className={styles.chatlist}>
                <div className={styles.bar}>
                    <div>
                        Chats
                    </div>
                    <button onClick={() => setShowModal(true)}>
                        Add Chat
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
                                Enter Gist ID
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
                                <button onClick={() => {
                                    addChat(text);
                                }}>
                                    Add Chat
                                </button>
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