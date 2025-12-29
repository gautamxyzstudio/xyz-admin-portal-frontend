interface ButtonProps {
  label: string;
  type?: 'button' | 'reset' | 'submit' | undefined;
  className?: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  type,
  label,
  className,
  onClick,
  isLoading
}) => {
  return (
    <button onClick={onClick} type={type} className={className}>
      {label}
    </button>
  );
};

export default Button;
