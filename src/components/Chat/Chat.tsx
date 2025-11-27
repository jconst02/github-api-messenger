
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
    const {chat, gistId } = location.state;

    const [messages, setMessages] = useState<any[]>([]);
    const [chatName, setChatName] = useState<string | null>(null);
    const [textValue, setTextValue] = useState('');
    const messagesRef = useRef<HTMLDivElement | null>(null);

    //getGistName
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

    const perPage = 100;
    let lastPage = 1;

    const fetchAllMessages = async () => {
        try {

            let allComments: any[] = []; 
            let page = 1;

            while (true) {

                const params = new URLSearchParams({
                    per_page: perPage.toString(),
                    page: page.toString()
                });
                //getGistComments
                const res = await fetch(`https://api.github.com/gists/${chat.id}/comments?${params.toString()}`, {
                    cache: 'no-store',
                    headers : { Authorization: `token ${token}` },
                });

                const data = await res.json();

                if (!data.length) return;

                allComments = [...allComments, ...data];

                if (data.length < perPage) break;

                page++;
            }

            setMessages(allComments);
            lastPage = page;
        } catch(error) {
            console.error("Unable to retrieve messages:", error);
        }
    }

    const fetchNewMessages = async () => {
        try {
            const params = new URLSearchParams({
                per_page: perPage.toString(),
                page: lastPage.toString()
            });
            //getGistComments
            const res = await fetch(`https://api.github.com/gists/${chat.id}/comments?${params.toString()}`, {
                cache: 'no-store',
                headers : { Authorization: `token ${token}` }
            });

            const data = await res.json();

            setMessages(prev => {
                if (data.length === 0) return prev;
                const currentMessages = new Set(prev.map(m => m.id));
                const newMessages = data.filter((m: any) => !currentMessages.has(m.id));
                if (newMessages.length === 0) return prev;
                return [...prev, ...newMessages];
            });

            if (data.length === perPage) lastPage++;

        } catch(error) {
            console.error("Unable to retrieve new messages:", error);
        }
    }

    useEffect(() => {

        fetchAllMessages();
        let intervalId = setInterval(fetchNewMessages, 5000);
        return () => clearInterval(intervalId);
    }, []);

    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (textValue.trim() === '') return;
        
        try {
            //addGistComment
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
            if (messagesRef.current?.scrollHeight - (messagesRef.current?.scrollTop + messagesRef.current?.clientHeight) < 300){
                messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
            }
        }
    }, [messages]);

    const leaveChat = async() =>  {
        //deleteGistComment
        const res = await fetch(`https://api.github.com/gists/${gistId}/comments/${chat.commentId}`, {
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