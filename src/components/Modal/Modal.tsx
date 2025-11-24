import styles from './Modal.module.css';
import { type Dispatch, type SetStateAction } from 'react';

interface ModalProps {
    title: string;
    input: string;
    submitLabel: string;
    error: string;
    setText: Dispatch<SetStateAction<string>>;
    onCancel: () => void;
    onSubmit: () => void;
}

const Modal = ({ 
    title,
    input,
    submitLabel,
    error,
    setText,
    onCancel,
    onSubmit 
}: ModalProps) => {


    return (
        <>
            <div className={styles.modal}>
                <div className={styles.modalcontent}>
                    <div>{title}</div>
                    <input 
                        value={input}
                        onChange={(e) => setText(e.target.value)}
                    >
                    </input>
                    <div className={styles.buttonRow}>
                        <button onClick={onCancel}>Cancel</button>
                        <button disabled={!input} onClick={onSubmit}>{submitLabel}</button>
                    </div>
                    {error && <div className={styles.error}>{error}</div>}
                </div>
            </div>
        </>
    )
};

export default Modal;