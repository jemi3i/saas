
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  variant = 'default',
  className 
}) => {
  const variantStyles = {
    default: 'border-border',
    success: 'border-emerald-500/20 bg-emerald-500/5',
    danger: 'border-rose-500/20 bg-rose-500/5',
    warning: 'border-amber-500/20 bg-amber-500/5',
    info: 'border-primary/20 bg-primary/5',
  };

  const iconStyles = {
    default: 'text-muted-foreground',
    success: 'text-emerald-500',
    danger: 'text-rose-500',
    warning: 'text-amber-500',
    info: 'text-primary',
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all hover:shadow-md", variantStyles[variant], className)}>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium tracking-tight text-muted-foreground">{title}</h3>
        <div className={cn("rounded-lg p-2 bg-background shadow-inner", iconStyles[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="pt-1">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
            {trend && (
              <span className={cn(
                "inline-flex items-center rounded-full px-1.5 py-0.5 font-bold",
                trend.isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
              )}>
                {trend.isUp ? "↑" : "↓"} {trend.value}%
              </span>
            )}
            {description}
          </p>
        )}
      </div>
      <div className={cn("absolute bottom-0 right-0 h-1 w-full opacity-20", 
        variant === 'success' ? 'bg-emerald-500' : 
        variant === 'danger' ? 'bg-rose-500' : 
        variant === 'warning' ? 'bg-amber-500' : 
        variant === 'info' ? 'bg-primary' : 'bg-transparent'
      )} />
    </div>
  );
};

export default StatCard;
