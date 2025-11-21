
import styles from './Chat.module.css';
import { type User } from 'firebase/auth';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import menu from "../../assets/menu-symbol-of-three-parallel-lines.svg";
import Message from '../Message/Message';

interface ChatProps {
    user: User | null;
    username: string | null;
    token: string | undefined;
}

const Chat = ({ user, token, username } : ChatProps) => {
    if(!user) return <Navigate to="/login" replace />;


    const navigate = useNavigate();
    const location = useLocation();
    const {chat, gistChatFile } = location.state;

    const [messages, setMessages] = useState<any[]>([]);
    const [chatName, setChatName] = useState<string | null>(null);
    const [textValue, setTextValue] = useState('');
    const messagesRef = useRef<HTMLDivElement | null>(null);


    useEffect(() => {
        const fetchChatName = async () => {
            try {
                const res = await fetch(`https://api.github.com/gists/${chat.id}`, {
                    headers : { Authorization: `token ${token}` }
                });
                const data = await res.json();
                const filename = Object.keys(data.files)[0];
                setChatName(data.files[filename].content);
            } catch (error) {
                console.error("Error getting chat name:", error);
            }

        }
        
        fetchChatName();
    }, [chat.id, token])


    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch(`https://api.github.com/gists/${chat.id}/comments`, {
                    cache: 'no-store',
                    headers : { Authorization: `token ${token}` }
                });
                const data = await res.json();
                setMessages(prev => {
                    if (prev.length === 0 && data.length === 0) return prev;
                    if (prev[prev.length - 1]?.id === data[data.length - 1]?.id) return prev;
                    return data;
                });
            } catch(error) {
                console.error("Unable to retrieve messages:", error);
            }
            
        };

        fetchMessages();
        let intervalId = setInterval(fetchMessages, 5000000);
        return () => clearInterval(intervalId);
    }, [chat.id, token])

    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (textValue.trim() === '') return;
        
        try {
            const res = await fetch(`https://api.github.com/gists/${chat.id}/comments`, {
                method: 'POST',
                headers : {
                    'Content-Type': 'application/json',
                    Authorization: `token ${token}`
                },
                body: JSON.stringify({ body: textValue })
            })
            setTextValue('');
            const data = await res.json();
            setMessages(prev => [...prev, data]);
        } catch(error) {
            console.error("Error sending message:", error);
        }
    }
    

    //TODO: make sure this works
    useLayoutEffect(() => {
        if (messagesRef.current){
            if (messagesRef.current?.scrollHeight - (messagesRef.current?.scrollTop + messagesRef.current?.clientHeight) < 150){
                messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
            }
        }
    }, [messages]);

    const leaveChat = async() =>  {
        const res = await fetch(`${gistChatFile}/${chat.commentId}`, {
            method: 'DELETE',
            headers : {
                Authorization: `token ${token}`
            },
        });
        if (res.ok) {
            navigate('/chatlist');
        }
    }

    return (
        <>
            <div className={styles.chat}>
                <div className={styles.bar}>
                    <button className={styles.backbutton}>
                        <img src={menu} alt='' />
                    </button>
                    <div>{chatName}</div>
                    <div className={styles.chatId}>Chat ID: {chat.id}</div>
                    <button className={styles.leavebutton} onClick={leaveChat}>
                        Leave chat
                    </button>
                </div>
                <div className={styles.messages} ref={messagesRef}>
                {messages.map((message) => (
                    <Message 
                        key={message.id}
                        username={message.user.login}
                        message={message.body}
                        time={`${new Date(message.created_at).getHours()}:${new Date(message.created_at)
                            .getMinutes()
                            .toString()
                            .padStart(2, "0")}`}
                        isOwn={message.user.login === username}

                    />
                ))}
                </div>
                <form className={styles.inputBar} onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        className={styles.input}
                        placeholder='Message'
                        onChange={e => setTextValue(e.target.value)} 
                        value={textValue}
                    />
                    <button className={styles.button} type='submit' disabled={textValue.trim() === ''}
                    >
                        Send
                    </button>
                </form>
            </div>
        </>
    )
}

export default Chat;