
import React from 'react';
import Input, { InputProps } from '../atoms/Input';

interface FormFieldProps extends InputProps {
  label: string;
  error?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="grid w-full items-center gap-1.5 mb-4">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
        <Input ref={ref} {...props} />
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);
FormField.displayName = "FormField";

export default FormField;
