import './Button.css';

const Button = ({ children, onClick, className = '', noDefault = false }) => {
    return (
        <button
            onClick={onClick}
            className={noDefault ? className : `custom-button ${className}`.trim()}
        >
            {children}
        </button>
    );
};

export default Button;
