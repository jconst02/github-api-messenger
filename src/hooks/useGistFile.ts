import { useEffect, useState } from "react";

export default function useGistFile(token: string | undefined): [
    gistChatFile: string | undefined,
    error: string
] {
    const [gistChatFile, setGistChatFile] = useState<string|undefined>(undefined);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) return;

        const fetchOrCreateGist = async () => {
            try {
                const per_page = 100;
                let page = 1;

                let gist = null;

                while (!gist){
                    const params = new URLSearchParams({
                        per_page: per_page.toString(),
                        page: page.toString()
                    });

                    const res = await fetch(`https://api.github.com/gists?${params.toString()}`, {
                        headers : { Authorization: `token ${token}` }
                    });
            
                    if (!res.ok) throw Error(`Failed to fetch gists: ${res.status}`);

                    const data = await res.json();

                    if (!data.length) break;

                    gist = data.find((gist: any) => gist.description === 'gitmessagefile');

                    if (data.length < per_page) break;

                    page += 1;
                }

                if (gist) {
                    setGistChatFile(gist.comments_url);
                }
                else {
                    const createRes = await fetch('https://api.github.com/gists', {
                        method: 'POST',
                        headers : { Authorization: `token ${token}` },
                        body: JSON.stringify({
                            description: "gitmessagefile",
                            public: false,
                            files: {
                                "gistfile1.txt": {
                                    content: "gitmessagefile"
                                }
                            }
                        })
                    });

                    if (!createRes.ok) throw Error(`Failed to create gists: ${createRes.status}`);

                    const newGist = await createRes.json();
                    setGistChatFile(newGist.comments_url);
                }
            } catch(error) {
                console.error(error);
                setError("Failed to initialize. Please refresh.");
            }
        };

        fetchOrCreateGist();
    }, [token]);

    return [gistChatFile, error];
}