import Login from './components/Login/Login'
import { useState } from 'react';
import { type User } from 'firebase/auth';
import { auth } from './FirebaseConfig';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import Chat from './components/Chat/Chat';

function App() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState<string | null>(null);

  return (
    <Router>
      <Routes>
        <Route path="*" element={<Login user={user} setUser={setUser} setToken={setToken} username={username} setUsername={setUsername}/>} />
        <Route path="/login" element={<Login user={user} setUser={setUser} setToken={setToken} username={username} setUsername={setUsername}/>} />
        <Route path="/chat" element={<Chat user={user} username={username} token={token}/>} />
      </Routes>
    </Router>
  )
}

export default App
