import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, X } from 'lucide-react';

interface SearchProps {
  /** Placeholder text for the search input */
  placeholder?: string;

  /** Debounce delay in milliseconds before triggering search (default: 300ms) */
  debounceTime?: number;

  /** Controlled value from parent */
  value?: string;

  /** Initial uncontrolled value */
  initialValue?: string;

  /** Controlled onChange handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /** Live-search callback, called after debounce on every keystroke */
  onSearch?: (value: string) => void;

  /** Optional class name for the wrapper */
  className?: string;

  /** Auto-focus on mount */
  autoFocus?: boolean;
}

/**
 * Live Search component — triggers `onSearch` on every keystroke (with debounce).
 * Includes a red clear button (X) to reset the search input.
 */
const Search: React.FC<SearchProps> = ({
  placeholder = 'Cari...',
  debounceTime = 300,
  initialValue = '',
  value,
  onChange,
  onSearch,
  className = '',
  autoFocus = false,
}) => {
  const isControlled = value !== undefined;
  const [inputValue, setInputValue] = useState(isControlled ? value : initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  // Sync controlled value changes
  useEffect(() => {
    if (isControlled) {
      setInputValue(value);
    }
  }, [value, isControlled]);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Live search: debounce on every keystroke, skip the very first render
  useEffect(() => {
    if (!onSearch) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onSearch(inputValue as string);
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [inputValue, debounceTime, onSearch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    } else {
      setInputValue(e.target.value);
    }
  };

  const handleClear = () => {
    if (onChange) {
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' },
      } as ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    } else {
      setInputValue('');
    }

    if (onSearch) {
      onSearch('');
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const hasValue = isControlled ? !!value : !!inputValue;

  return (
    <div className={`w-full ${className}`}>
      <div className="relative flex items-center w-full">
        <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={isControlled ? value : inputValue}
          onChange={handleChange}
          className="pl-9 pr-10 w-full"
          autoComplete="off"
        />
        {hasValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 h-full px-3 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Search;
