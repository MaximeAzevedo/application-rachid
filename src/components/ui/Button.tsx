'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'class';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'btn-modern';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary', 
    ghost: 'btn-ghost',
    class: 'class-button'
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-2 min-h-[36px]',
    md: 'text-sm px-4 py-2 min-h-[44px]',
    lg: 'text-base px-6 py-3 min-h-[52px]'
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    size !== 'md' && sizeClasses[size], // md est dans btn-modern par défaut
    fullWidth && 'w-full',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  return (
    <button 
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="loading-modern" />
      )}
      
      {!loading && Icon && iconPosition === 'left' && (
        <Icon size={18} />
      )}
      
      {children}
      
      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={18} />
      )}
    </button>
  );
} 