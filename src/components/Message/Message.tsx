import styles from './Message.module.css';


interface MessageProps {
    username: string | null;
    message: string;
    time: string | null;
    isOwn: boolean;
}


const Message = ({ username, message, time, isOwn} : MessageProps) => {

    return (
        <>
            {isOwn ? (
                <div className={styles.ownmessage}>{message}</div>
            ) :
                <div className={styles.message}>{message}</div>
            }
        </>
    )
}

export default Message;