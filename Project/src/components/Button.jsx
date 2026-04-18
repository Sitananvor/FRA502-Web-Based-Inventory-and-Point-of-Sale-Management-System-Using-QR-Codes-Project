import "./Button.css";

const Button = ({ label = "Submit", onClick, disabled, style }) => {
  return (
    <button
      className={"button"}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {label}
    </button>
  );
};

export default Button;
