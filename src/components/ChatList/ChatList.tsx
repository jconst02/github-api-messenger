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
    }, [gistChatFile, token]);
    const navigate = useNavigate();
    const openChat = (chat: ChatItem) => {
        navigate('/chat', {
            state: {
                chat
            }
        });
    }

    return (
        <>
            <div className={styles.chatlist}>
                <div className={styles.bar}>
                    <div>
                        Chats
                    </div>
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
            </div>
        </>
    )
}

export default ChatList;