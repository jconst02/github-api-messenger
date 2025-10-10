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
                <div className={styles.ownmessage}>
                   <div className={styles.ownmessagecontent}>{message}</div>
                   <div className={styles.timeown}>{time}</div>
                </div>
            ) :
                <div className={styles.message}>
                    <div className={styles.messagecontent}>{message}</div>
                    <div className={styles.time}>{username} | {time}</div>
                </div>
            }
        </>
    )
}

export default Message;