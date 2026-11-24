import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
 */
const Search: React.FC<SearchProps> = ({
  placeholder = 'Cari',
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

  useEffect(() => {
    if (isControlled) {
      setInputValue(value);
    }
  }, [value, isControlled]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

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
    <search className={cn('block w-full', className)}>
      <div className="relative flex w-full items-center">
        <SearchIcon
          className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={isControlled ? value : inputValue}
          onChange={handleChange}
          className="w-full pl-9 pr-9"
          autoComplete="off"
        />
        {hasValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0.5 h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={handleClear}
            aria-label="Hapus pencarian"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        )}
      </div>
    </search>
  );
};

export default Search;
