"use client";
import React from "react";

export type ButtonVariant = "primary" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const CLASS_MAP: Record<ButtonVariant, string> = {
  primary: "psl-btn",
  danger: "psl-btn danger",
  ghost: "",
};

const BASE_STYLE_MAP: Record<ButtonVariant, React.CSSProperties> = {
  primary: {},
  danger: {},
  ghost: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-muted)",
    padding: 0,
    fontFamily: "inherit",
    fontSize: "inherit",
  },
};

export function Button({
  variant = "primary",
  className = "",
  style,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${CLASS_MAP[variant]} ${className}`.trim()}
      style={{
        ...BASE_STYLE_MAP[variant],
        ...(disabled ? { opacity: 0.3, cursor: "not-allowed" } : {}),
        ...style,
      }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        height: 34,
        fontSize: 13,
        fontWeight: 600,
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        transition: "all 0.2s",
        background: active ? "var(--text)" : "transparent",
        color: active ? "var(--bg)" : "var(--text-muted)",
      }}
    >
      {children}
    </button>
  );
}
