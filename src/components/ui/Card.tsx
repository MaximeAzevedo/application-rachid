'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'stat' | 'interactive';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  iconColor?: string;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({
  children,
  className,
  variant = 'default',
  padding = 'md',
  hover = true,
  ...props
}: CardProps) {
  const baseClasses = variant === 'stat' ? 'card-stat' : 'card-premium';
  
  const classes = cn(
    baseClasses,
    variant === 'interactive' && 'interactive',
    !hover && '[&:hover]:transform-none [&:hover]:shadow-md',
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  icon: Icon,
  iconColor = 'var(--green-600)',
  ...props
}: CardHeaderProps) {
  const classes = cn(
    'flex items-center gap-3 mb-4',
    className
  );

  return (
    <div className={classes} {...props}>
      {Icon && (
        <div style={{ color: iconColor }}>
          <Icon size={24} />
        </div>
      )}
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: CardContentProps) {
  const classes = cn('flex-1', className);

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: CardFooterProps) {
  const classes = cn(
    'flex items-center justify-between mt-4 pt-4',
    'border-t border-gray-200',
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

// Export du compound component
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter; 