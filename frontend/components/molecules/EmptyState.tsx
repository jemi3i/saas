
import React from 'react';
import { LucideIcon } from 'lucide-react';
import Button from '../atoms/Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 border rounded-2xl bg-card border-dashed animate-in fade-in zoom-in duration-500">
      <div className="p-4 bg-muted rounded-full mb-4">
        <Icon className="h-10 w-10 text-muted-foreground opacity-50" />
      </div>
      <h3 className="text-xl font-bold tracking-tight">{title}</h3>
      <p className="text-muted-foreground text-center max-w-xs mt-2 mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="shadow-lg shadow-primary/20">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
