import Spinner from "./Spinner";

const Button = ({
  children,
  onClick,
  isLoading = false,
  disabled = false,
  variant = "primary",
  ...props
}) => {
  const baseStyle =
    "btn flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "btn-primary text-white",
    secondary: "btn-outline text-gray-700",
    danger: "btn-error text-white",
  };

  const isDisabled = isLoading || disabled;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseStyle} ${variants[variant]}`}
      {...props}
    >
      {isLoading && <Spinner size={18} />}
      {children}
    </button>
  );
};

export default Button;
