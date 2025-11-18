
import styles from './Chat.module.css';
import { auth, provider } from '../../FirebaseConfig';
import { type User } from 'firebase/auth';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import menu from "../../assets/menu-symbol-of-three-parallel-lines.svg";
import Message from '../Message/Message';

interface ChatProps {
    user: User | null;
    username: string | null;
    token: string | undefined;
}

const Chat = ({ user, token, username } : ChatProps) => {
    
    if(!user) {
        return <Navigate to="/login" replace />;
    }

    const [messages, setMessages] = useState<any[]>([]);
    const [chatName, setChatName] = useState<string | null>(null);
    const [textValue, setTextValue] = useState('');
    const messagesRef = useRef<HTMLDivElement | null>(null);

    const location = useLocation();
    const chat =  location.state?.chat;



    useEffect(() => {

        fetch(`https://api.github.com/gists/${chat.id}`, {
            headers : {
                Authorization: `token ${token}`
            }
        }).then(res => res.json())
        .then(data => setChatName(data.files['gistfile1.txt'].content));

        getMessages();

        let intervalId = setInterval(getMessages, 500000000);
        return () => clearInterval(intervalId);
    }, [token])


    //TODO: update this so just used once at the start not everytime after message sent.
    useLayoutEffect(() => {
        if (messagesRef.current){
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages]);

    const getMessages = async () => {
        try {
            const res = await fetch(`https://api.github.com/gists/${chat.id}/comments`, {
                cache: 'no-store',
                headers : {
                    Authorization: `token ${token}`
                }
            });
            const data = await res.json();
            console.log(data)
            setMessages(data);
        } catch(error) {
            console.log(error);
        }

    };

    const sendMessage = async () => {
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
            console.log("Sent message:", data)
            await getMessages();
        } catch(error) {
            console.log(error);
        }
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTextValue(event.target.value);
    }

    return (
        <>
            <div className={styles.chat}>
                <div className={styles.bar}>
                    <button>
                        <img src={menu} alt='' />
                    </button>
                    <div>
                        {chatName}
                    </div>
                    <div className={styles.chatId}>
                        Chat ID: {chat.id}
                    </div>
                </div>
                <div className={styles.messages} ref={messagesRef}>
                {messages.map((message, i) => (
                    // <div className={styles.message} key={i}>{messages.body}</div>
                    <Message 
                        key={i}
                        username={username}
                        message={message.body}
                        time={`${new Date(message.created_at).getHours()}:${new Date(message.created_at).getMinutes().toString().padStart(2, "0")}`}
                        isOwn={message.user.login === username}

                    />
                ))}
                </div>
                <div className={styles.inputBar}>
                    <input type="text" className={styles.input} onChange={handleInputChange} value={textValue}/>
                    <button 
                    className={styles.button}
                    disabled={textValue.trim() === ''}
                    onClick={sendMessage}
                    >Send</button>
                </div>
            </div>
        </>
    )
}

export default Chat;