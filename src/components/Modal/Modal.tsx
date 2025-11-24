import styles from './Modal.module.css';

interface ModalProps {
    title: string;
    inputValue: string;
    submitLabel: string;
    error?: string;
    onInputChange: (value: string) =>  void;
    onCancel: () => void;
    onSubmit: () => void;
}

const Modal = ({ 
    title,
    inputValue,
    submitLabel,
    error,
    onInputChange,
    onCancel,
    onSubmit 
}: ModalProps) => {


    return (
        <div className={styles.modal}>
            <div className={styles.modalcontent}>
                <div>{title}</div>
                <input 
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                />
                <div className={styles.buttonRow}>
                    <button onClick={onCancel}>Cancel</button>
                    <button disabled={!inputValue} onClick={onSubmit}>{submitLabel}</button>
                </div>
                {error && <div className={styles.error}>{error}</div>}
            </div>
        </div>
    )
};

export default Modal;