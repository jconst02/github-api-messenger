
import styles from './Chat.module.css';
import { auth, provider } from '../../FirebaseConfig';
import { type User } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import menu from "../../assets/menu-symbol-of-three-parallel-lines.svg";

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



    useEffect(() => {

        fetch('https://api.github.com/gists/506a5ed0fb1bb575dc9d0385f06290b9', {
            headers : {
                Authorization: `token ${token}`
            }
        }).then(res => res.json())
        .then(data => setChatName(data.files['gistfile1.txt'].content));

        const getMessages = async () => {
            try {
                const res = await fetch('https://api.github.com/gists/506a5ed0fb1bb575dc9d0385f06290b9/comments', {
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

        getMessages();

        let intervalId = setInterval(getMessages, 1000000);
        return () => clearInterval(intervalId);
    }, [token])



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
                {messages.map((messages, i) => (
                    <div className={styles.message} key={i}>{messages.body}</div>
                ))}
                </div>
                <div className={styles.inputBar}>
                    <input type="text" className={styles.input} />
                    <button className={styles.button}>Send</button>
                </div>
            </div>
        </>
    )
}

export default Chat;