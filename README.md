# GitHub API Messenger

A basic real-time messaging app built entirely with GitHub Gists. No backend required.

## Features

- GitHub OAuth authentication
- Real-time messaging using GitHub Gists
- Create and message on multiple chat rooms
- Share chat rooms via Gist ID

## Tech Stack

- React + TypeScript
- Firebase Authentication (GitHub OAuth)
- GitHub Gists API

## How It Works

This app uses GitHub Gists as a database, treating gists and comments as data storage:

### Architecture

1. **Master Gist**: A special Gist that stores your list of chats as comments
2. **Chats**: Each chat is a seperate GitHub Gist
3. **Messages**: Each message is stored as a comment on a chat's Gist.

### Data Flow
```
Login with GitHub → Get auth token → Find/Create Master Gist
                                          ↓
                        Fetch Chat list (comments on master gist)
                          ↓                                 ↓
                       Open Chat                     Create/Add Chat
                 (fetch gist comments)              (post comment to master gist)
                  ↓               ↓
            Send Message        Leave Chat
  (post comment to chat gist)  (delete comment from master)
```

### Real-time updates

Messages auto-update using polling
- Everything 5 seconds, the app fetches new comments from the current chat's Gist
- New messages appear automatically without refreshing the page
- Delay of 5 seconds when a user sends a message until others see it

### Rate Limits

- Rate limit for authenticated GitHub users is 5,000 request per hour
- Logging in is 2 requests
- Opening a chat is 1 + number of comments / 100 rounded up to next whole integer
- Sending a message is 1 request
- Polling is 1 request per 5 seconds so 720 per hour
- API usage should be reasonable and not hit that rate limit often

## Prerequisites

- Node.js (v18+)
- GitHub account
- Firebase project with GitHub OAuth enabled

## Setup

### 1. Clone the repository
```
git clone https://github.com/johnconstantinides/github-api-messenger.git
cd project
```

### 2. Install dependencies
```
npm install
```

### 3. Set up Firebase

**Create Firebase Project:**
1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project
2. Once created, click "Build" in the left sidebar, then "Authentication"
3. Enable "GitHub" as a sign-in provider
4. Copy the callback URL

**Create GitHub OAuth App:**
5. Go to [GitHub Developer Settings](https://github.com/settings/developers) and Register a new OAuth app 
6. Set Homepage URL to `http://localhost:5173` and Authorization callback URL to the callback URL from step 4, then regiser the application
7.  Copy the Client ID and generate a Client Secret

**Configure Firebase:**
8.  Go back to Firebase authentication from step 3
9.  Paste the Client ID and Client Secret

**Get Firebase Config:**
10.  Go to project settings
11.  Scroll down and click the web icon and regiser the app
12.  Copy the `firebaseConfig` values

13.  Create a `.env` file in the root directory and use the `firebaseConfig` values here:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Run the development server
```
npm run dev
```

## Usage

1. **Login**
  - Click "Login with GitHub" on the home page
  - Authorize the app to access your GitHub Account

2. **Create Chat**
  - Click the "Create Chat" button
  - Enter a name for the chat room and click "Create Chat"
  - A new private GitHub Gist will be created automatically

3. **Add an Existing Chat**
  - Click the "Add Chat" button
  - Enter the Gist ID for a current existing chat room
  - The chat will be added to your list

4. **Send Messages**
  - Click on a chat to open it
  - Type message then hit enter or click "Send"

5. **Share a Chat**
  - Click on that chat to open it
  - Gist ID is shown in the top right
  - Share that ID with others so they can join

### Notes

- Each chat is a secret Gist - anyone with the Gist ID can view and join it
- Messages appear as comments on the gist
- You can view/edit chats directly on GitHub Gists

## Future Improvements

- [ ] Implement message pagination, load only most recent messages when opening a chat, with the option to fetch older ones on scroll.

