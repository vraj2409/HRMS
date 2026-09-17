import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(
  ({ label, error, helperText, options = [], className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={className}>
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-ink">
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none rounded-md border bg-surface py-2 pl-3 pr-10 text-sm text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-soft ${
              error
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-line focus:border-primary-500'
            }`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown className="h-4 w-4 text-ink-faint" />
          </div>
        </div>
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

Select.displayName = 'Select';
export default Select;
