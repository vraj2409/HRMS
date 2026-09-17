import { forwardRef } from 'react';

const Input = forwardRef(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={className}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-soft ${
            error
              ? 'border-rose-500 focus:border-rose-500'
              : 'border-line focus:border-primary-500'
          }`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-ink-faint">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
