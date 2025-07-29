import './Login.module.css';
import { auth, provider } from '../../FirebaseConfig';
import { signInWithPopup, GithubAuthProvider, type User } from 'firebase/auth';
import { useState } from 'react';

const Login = () => {
    const [user, setUser] = useState<User | null>(auth.currentUser);

    const gitHubLogin = () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                const credential = GithubAuthProvider.credentialFromResult(result);
                const token = credential?.accessToken;

                setUser(result.user);
            }). catch((error) => {
                console.log(error);
            })
    }

    const logOut = async () => {
        await auth.signOut();
        setUser(null);
    }

    return (
        <>
            <div className='Login'>
                {user ? (
                    <>
                        <h1>{user.displayName}</h1>
                        <button 
                            className='btn'
                            onClick={logOut}
                        >Sign out</button>
                    </>
                ) :
                <button 
                    className='btn'
                    onClick={gitHubLogin}
                >Login with Github</button>
                }
            </div>
        </>
    )
}

export default Login;