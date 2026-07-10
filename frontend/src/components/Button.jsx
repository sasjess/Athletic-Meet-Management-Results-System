import React from "react";
import "./Button.css";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  onClick,
  disabled,
  className = "",
  fullWidth = false,
  ...props
}) => {
  const classes = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? "btn-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
