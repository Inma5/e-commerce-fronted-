import React from 'react';
import { GraduationCap, User, Clock, Handshake, CheckCircle2, XCircle } from 'lucide-react';
import { ProductCondition, OrderStatus, Role } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'gold';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-medium' : 'px-2.5 py-1 text-xs font-medium';

  const variantClasses = {
    primary: 'bg-paper-3 text-ink border border-rule',
    success: 'bg-status-success-subtle text-status-success border border-status-success/30',
    warning: 'bg-accent-subtle text-accent-ink dark:text-accent border border-accent/40',
    danger: 'bg-status-error-subtle text-status-error border border-status-error/30',
    neutral: 'bg-paper-2 text-ink-muted border border-rule',
    gold: 'bg-accent-subtle text-accent-ink dark:text-accent border border-accent/40',
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-control ${sizeClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};

export const ConditionBadge: React.FC<{ condition: ProductCondition }> = ({ condition }) => {
  const mapping: Record<ProductCondition, { label: string; variant: BadgeProps['variant'] }> = {
    NUEVO: { label: 'Nuevo', variant: 'success' },
    COMO_NUEVO: { label: 'Como nuevo', variant: 'primary' },
    USADO_BUENO: { label: 'Buen estado', variant: 'warning' },
    USADO_REGULAR: { label: 'Uso regular', variant: 'neutral' },
  };

  const current = mapping[condition] || { label: condition, variant: 'neutral' };

  return <Badge variant={current.variant}>{current.label}</Badge>;
};

export const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  if (role === 'VENDEDOR') {
    return (
      <Badge variant="warning">
        <GraduationCap size={13} className="shrink-0" />
        <span>Vendedor</span>
      </Badge>
    );
  }
  return (
    <Badge variant="primary">
      <User size={13} className="shrink-0" />
      <span>Estudiante</span>
    </Badge>
  );
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const mapping: Record<OrderStatus, { label: string; variant: BadgeProps['variant']; icon: React.ReactNode }> = {
    PENDING: { label: 'Pendiente', variant: 'warning', icon: <Clock size={12} className="shrink-0" /> },
    CONFIRMED: { label: 'Confirmado', variant: 'primary', icon: <Handshake size={12} className="shrink-0" /> },
    DELIVERED: { label: 'Entregado', variant: 'success', icon: <CheckCircle2 size={12} className="shrink-0" /> },
    CANCELLED: { label: 'Cancelado', variant: 'danger', icon: <XCircle size={12} className="shrink-0" /> },
  };

  const item = mapping[status] || { label: status, variant: 'neutral', icon: null };

  return (
    <Badge variant={item.variant}>
      {item.icon}
      <span>{item.label}</span>
    </Badge>
  );
};
