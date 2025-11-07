
import './Login.module.css';
import { auth, provider } from '../../FirebaseConfig';
import { signInWithPopup, GithubAuthProvider, type User, getAdditionalUserInfo } from 'firebase/auth';
import { type Dispatch, type SetStateAction } from 'react';
import { Navigate } from 'react-router-dom';

interface LoginProps {
    user: User | null;
    username: string | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    setToken: Dispatch<SetStateAction<string | undefined>>;
    setUsername: Dispatch<SetStateAction<string | null>>;
}

const Login = ({ user, setUser, setToken, username, setUsername } : LoginProps) => {

    const gitHubLogin = () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                const credential = GithubAuthProvider.credentialFromResult(result);
                const token = credential?.accessToken;
                const details = getAdditionalUserInfo(result);
                
                setUsername(details?.username ?? null)
                setUser(result.user);
                setToken(token);
                
            }). catch((error) => {
                console.log(error);
            })
    }

    const logOut = async () => {
        await auth.signOut();
        setUser(null);
        setToken(undefined);
    }

    return (
        <>
            <div className='Login'>
                {user ? (
                    <Navigate to='/chatlist' replace/>

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