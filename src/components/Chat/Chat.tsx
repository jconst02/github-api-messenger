
import styles from './Chat.module.css';
import { type User } from 'firebase/auth';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import menu from "../../assets/menu-symbol-of-three-parallel-lines.svg";
import Message from '../Message/Message';
import { addGistComment, deleteGistComment, getGistComments, getGistName } from '../../api/gists';

interface ChatProps {
    user: User | null;
    username: string | null;
    token: string | undefined;
}

const Chat = ({ user, token, username } : ChatProps) => {
    if(!user || !token) return <Navigate to="/login" replace />;


    const navigate = useNavigate();
    const location = useLocation();
    const {chat, gistId } = location.state;

    const [messages, setMessages] = useState<any[]>([]);
    const [textValue, setTextValue] = useState('');
    const messagesRef = useRef<HTMLDivElement | null>(null);

    const perPage = 100;
    let lastPage = 1;

    const fetchAllMessages = async () => {
        try {
            let allComments: any[] = []; 
            let page = 1;

            //getGistComments: DONE
            while (true) {
                const data = await getGistComments(token, chat.id, perPage, page);

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
            //getGistComments: Done
            const data = await getGistComments(token, chat.id, perPage, lastPage);

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
            //addGistComment: Done
            const data = await addGistComment(token, chat.id, textValue);
            setTextValue('');
            setMessages(prev => [...prev, data]);
        } catch(error) {
            console.error("Error sending message:", error);
        }
    };
    

    //TODO: make sure this works
    useLayoutEffect(() => {
        if (messagesRef.current){
            if (messagesRef.current?.scrollHeight - (messagesRef.current?.scrollTop + messagesRef.current?.clientHeight) < 300){
                messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
            }
        }
    }, [messages]);

    const leaveChat = async() =>  {
        //deleteGistComment: Done
        try {
            await deleteGistComment(token, gistId, chat.commentId);
            navigate('/chatlist');
        } catch(error) {
            console.error("Failed to leave chat:", error);
        }
    };

    return (
        <>
            <div className={styles.chat}>
                <div className={styles.bar}>
                    <button className={styles.backbutton} onClick={() => navigate('/chatlist')}>
                        <img src={menu} alt='' />
                    </button>
                    <div>{chat.name}</div>
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
};

export default Chat;