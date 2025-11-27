import { useState } from "react";
import { type User } from 'firebase/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import styles from './ChatList.module.css';
import Modal from "../Modal/Modal";
import useGistId from "../../hooks/useGistId";
import useChatLists from "../../hooks/useChatLists";
import type { ChatItem } from "../../types/ChatItem";
import { addGistComment, checkGistExists, createGist } from "../../api/gists";

interface ChatListProps {
    user: User | null;
    token: string | undefined;
}

const ChatList = ({ user, token } : ChatListProps) => {
    if(!user) {
        return <Navigate to="/login" replace />;
    }
    
    const [gistId, gistError] = useGistId(token);
    const [chatList, setChatList, chatListError]  = useChatLists(gistId, token);


    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState<"add"|"create">("add");
    const [text, setText] = useState("");
    const [modalError, setModalError] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    const navigate = useNavigate();

    const openChat = (chat: ChatItem) => {
        navigate('/chat', {
            state: {
                chat,
                gistId,
            }
        });
    };

    const addChat = async(gist_id: string) => {
        if (!gistId || !token) return;

        try {
            setIsLoading(true);

            //checkGistExists
            const { exists, name } = await checkGistExists(token, gist_id);

            if (!exists) {
                setModalError("Gist with that ID does not exist");
                return;
            }
            
            if (chatList.some((chat: ChatItem) => chat.id === gist_id)){
                setModalError("Chat is already added");
                return;
            }
            //addGistComment: Done
            const newComment = await addGistComment(token, gistId, `${gist_id}\r\n${name}`);

            setChatList(prev => [...prev,{
                id: gist_id,
                commentId: newComment.id,
                name: name
            }]);

            setShowModal(false);
            setText("");
            setModalError("");
        } catch(error) {
            console.error(error);
            setModalError("Failed to add chat. Try again.");
        } finally {
            setIsLoading(false);
        }
    }

    const createChat = async(chatName: string) => {
        if (!gistId || !token) return;

        try {
            setIsLoading(true);
            //createGist: Done
            const newGist = await createGist(token, chatName);
            addChat(newGist.id);
        } catch(error) {
            console.error(error);
            setModalError("Failed to create chat. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.chatlist}>
            {(gistError || chatListError) ? (
                <div className={styles.pageError}>
                    <p>{gistError ? gistError : chatListError}</p>
                    <button onClick={() => window.location.reload()}>Refresh Page</button>
                    </div>
            ) : (
                <>
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
                            isLoading={isLoading}
                            onInputChange={(value) => {
                                setText(value);
                                if (modalError) setModalError("");
                            }}
                            onCancel={() => {
                                setShowModal(false);
                                setText("");
                                setModalError("");
                            }}
                            onSubmit={() => mode === 'add' ? addChat(text) : createChat(text)}
                        />
                    )}
                </>
            )}

        </div>
    )
}

export default ChatList;