
import styles from './Chat.module.css';
import { auth, provider } from '../../FirebaseConfig';
import { type User } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
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



    useEffect(() => {

        fetch('https://api.github.com/gists/506a5ed0fb1bb575dc9d0385f06290b9', {
            headers : {
                Authorization: `token ${token}`
            }
        }).then(res => res.json())
        .then(data => setChatName(data.files['gistfile1.txt'].content));

        getMessages();

        let intervalId = setInterval(getMessages, 500000000);
        return () => clearInterval(intervalId);
    }, [token])

    const getMessages = async () => {
        try {
            const res = await fetch('https://api.github.com/gists/506a5ed0fb1bb575dc9d0385f06290b9/comments', {
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
            const res = await fetch('https://api.github.com/gists/506a5ed0fb1bb575dc9d0385f06290b9/comments', {
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
                </div>
                <div className={styles.messages}>
                {messages.map((message, i) => (
                    // <div className={styles.message} key={i}>{messages.body}</div>
                    <Message 
                        key={i}
                        username={username}
                        message={message.body}
                        time={null}
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