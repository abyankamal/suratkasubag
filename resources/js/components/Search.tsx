import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, X } from 'lucide-react';

interface SearchProps {
  /**
   * Placeholder text for the search input
   */
  placeholder?: string;
  
  /**
   * Minimum characters required before triggering search
   */
  minChars?: number;
  
  /**
   * Debounce time in milliseconds
   */
  debounceTime?: number;
  
  /**
   * Current search value
   */
  value?: string;
  
  /**
   * Initial search value (deprecated, use value instead)
   */
  initialValue?: string;
  
  /**
   * Callback function when search value changes
   */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * Callback function when search value changes (deprecated, use onChange instead)
   */
  onSearch?: (value: string) => void;
  
  /**
   * Optional class name for styling
   */
  className?: string;
  
  /**
   * Whether to auto-focus the input on mount
   */
  autoFocus?: boolean;
}

/**
 * Reusable search component with debounce functionality
 */
const Search: React.FC<SearchProps> = ({
  placeholder = 'Search...',
  minChars = 0,
  debounceTime = 300,
  initialValue = '',
  value,
  onChange,
  onSearch,
  className = '',
  autoFocus = false,
}) => {
  // State for the input value (controlled or uncontrolled based on props)
  const [inputValue, setInputValue] = useState(value !== undefined ? value : initialValue);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);
  
  // Auto-focus input on component mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle input change with debounce (only for onSearch callback)
  useEffect(() => {
    if (!onSearch) return;
    
    const handler = setTimeout(() => {
      // Only trigger search if input meets minimum character requirement
      if (inputValue.trim().length >= minChars || inputValue.trim() === '') {
        onSearch(inputValue);
      }
    }, debounceTime);
    
    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, minChars, debounceTime, onSearch]);

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // If component is controlled via onChange
    if (onChange) {
      onChange(e);
    } else {
      // Otherwise use internal state
      setInputValue(e.target.value);
    }
  };

  // Handle clear button click
  const handleClear = () => {
    if (onChange) {
      // Create a synthetic event for onChange
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    } else {
      setInputValue('');
      if (onSearch) onSearch('');
    }
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(inputValue);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          value={value !== undefined ? value : inputValue}
          onChange={handleChange}
          className="pl-9 pr-10"
        />
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 h-full px-3"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
};

export default Search;
