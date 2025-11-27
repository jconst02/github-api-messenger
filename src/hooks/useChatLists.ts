import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { ChatItem } from "../types/ChatItem";

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
                
                //getGistComments
                const res = await fetch(`https://api.github.com/gists/${gistId}/comments`, {
                    cache: 'no-store',
                    headers : { Authorization: `token ${token}` }
                });
    
                if (!res.ok) throw Error(`Failed to fetch gist comments: ${res.status}`);
    
                const data = await res.json();
    
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