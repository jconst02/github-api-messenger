import { useEffect, useState } from "react";
import { createGist, getGistByDescription } from "../api/gists";

export default function useGistId(token: string | undefined): [
    gistId: string | undefined,
    error: string
] {
    const [gistId, setGistId] = useState<string|undefined>(undefined);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) return;

        const fetchOrCreateGist = async () => {
            try {
                //getGistByDescription: Done
                const gist = await getGistByDescription(token, 'gitmessagefile');

                if (gist) {
                    setGistId(gist.id);
                }
                else {
                    //createGist: Done
                    const newGist = await createGist(token, "gitmessagefile");
                    setGistId(newGist.id);
                }
            } catch(error) {
                console.error(error);
                setError("Failed to initialize. Please refresh.");
            }
        };

        fetchOrCreateGist();
    }, [token]);

    return [gistId, error];
}