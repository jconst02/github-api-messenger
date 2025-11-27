import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { ChatItem } from "../types/ChatItem";
import { getGistComments } from "../api/gists";

export default function useChatLists(gistId: string | undefined, token: string | undefined) : [
    chatList: ChatItem[],
    setChatLists: Dispatch<SetStateAction<ChatItem[]>>,
    error: string
] {
    const [chatList, setChatLists] = useState<ChatItem[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!gistId || !token) return;

        const fetchChats = async() => {
            try {

                //getGistComments: Done
                const data = await getGistComments(token, gistId);
    
                const mapped = data.map((comment: any) => {
                    const [id, name] = comment.body.split(/\r?\n/);
                    return { 
                        id: id, 
                        commentId: comment.id, 
                        name: name
                    }
                });
                setChatLists(mapped);
            } catch(error) {
                console.error(error);
                setError("Failed to load chats. Please refresh.");
            };
        };
        
        fetchChats();
    }, [gistId, token]);

    return [chatList, setChatLists, error];
};