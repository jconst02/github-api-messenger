export const checkGistExists = async (
    token: string,
    gist_id: string
) => {
    const res = await fetch(`https://api.github.com/gists/${gist_id}`, {
        headers : { Authorization: `token ${token}` }
    });

    if (!res.ok) {
        return { exists: false, name: null };
    }

    const data = await res.json();

    return {
        exists: true,
        name: data.files[Object.keys(data.files)[0]].content
    };
};

export const getGistComments = async (
    token: string,
    gist_id: string,
    per_page: number = 100,
    page: number = 1
) => {
    const params = new URLSearchParams({
        per_page: per_page.toString(),
        page: page.toString()
    });

    const res = await fetch(`https://api.github.com/gists/${gist_id}/comments?${params.toString()}`, {
        cache: 'no-store',
        headers : { Authorization: `token ${token}` },
    });

    if (!res.ok) throw Error(`Failed to fetch gist comments: ${res.status}`);

    return res.json();
};


//comment text can be message or chat info
export const addGistComment = async (
    token: string,
    gist_id: string,
    commentText: string
) => {
    const res = await fetch(`https://api.github.com/gists/${gist_id}/comments`, {
        method: 'POST',
        headers : {
            'Content-Type': 'application/json',
            Authorization: `token ${token}`
        },
        body: JSON.stringify({ body: commentText })
    });

    if (!res.ok) throw Error(`Failed to add comment: ${res.status}`);

    return res.json();
};

export const createGist = async (
    token: string,
    gist_name: string
) => {
    const createRes = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers : { Authorization: `token ${token}` },
        body: JSON.stringify({
            description: gist_name,
            public: false,
            files: {
                "gistfile1.txt": {
                    content: gist_name
                }
            }
        })
    });
    
    if (!createRes.ok) throw Error(`Failed to create gist: ${createRes.status}`);

    return createRes.json();
};


export const deleteGistComment = async (
    token: string,
    gist_id: string,
    comment_id: string
) => {
    //check this works.
    const res = await fetch(`https://api.github.com/gists/${gist_id}/comments/${comment_id}`, {
        method: 'DELETE',
        headers : {
            Authorization: `token ${token}`
        },
    });

    if (!res.ok) throw Error(`Failed to delete: ${res.status}`);
};


export const getGistName = async (
    token: string,
    gist_id: string
) => {
    const res = await fetch(`https://api.github.com/gists/${gist_id}`, {
        headers : { Authorization: `token ${token}` }
    });

    if (!res.ok) throw new Error(`Failed: ${res.status}`);

    const data = await res.json();
    const filename = Object.keys(data.files)[0];

    return data.files[filename].content;
};


export const getGists = async(
    token: string, 
    page: number = 1, 
    per_page: number = 200
) => {
    const params = new URLSearchParams({
        per_page: per_page.toString(),
        page: page.toString()
    });

    const res = await fetch(`https://api.github.com/gists?${params.toString()}`, {
        headers : { Authorization: `token ${token}` }
    });

    if (!res.ok) throw Error(`Failed to fetch gists: ${res.status}`);

    return res.json();
};

export const getGistByDescription = async (
    token: string,
    description: string
) => {
    const per_page = 100;
    let page = 1;
    let gist = null;

    while (!gist) {
        const data = await getGists(token, page, per_page);

        if (!data.length) break;

        gist = data.find((gist: any) => gist.description === description);

        if (data.length < per_page) break;

        page += 1;
    };

    return gist;
};
