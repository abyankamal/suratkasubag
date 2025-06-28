# Search Component

A reusable search component with debounce functionality for dynamic searching in React applications.

## Features

- Debounced search to improve performance
- Clear button to reset search
- Minimum character threshold option
- Auto-focus capability
- Customizable placeholder text
- Fully typed with TypeScript

## Usage

### Basic Usage

```tsx
import Search from '@/components/Search';

const MyComponent = () => {
  const handleSearch = (value: string) => {
    // Do something with the search value
    console.log('Search value:', value);
  };

  return (
    <Search 
      placeholder="Search items..." 
      onSearch={handleSearch} 
    />
  );
};
```

### With Minimum Characters

```tsx
<Search 
  placeholder="Search (min 3 characters)..." 
  minChars={3}
  onSearch={handleSearch} 
/>
```

### With Custom Debounce Time

```tsx
<Search 
  placeholder="Search..." 
  debounceTime={500} // 500ms debounce
  onSearch={handleSearch} 
/>
```

### With Auto-Focus

```tsx
<Search 
  placeholder="Search..." 
  autoFocus={true}
  onSearch={handleSearch} 
/>
```

### With Initial Value

```tsx
<Search 
  placeholder="Search..." 
  initialValue="initial search term"
  onSearch={handleSearch} 
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `'Search...'` | Placeholder text for the search input |
| `minChars` | `number` | `0` | Minimum characters required before triggering search |
| `debounceTime` | `number` | `300` | Debounce time in milliseconds |
| `initialValue` | `string` | `''` | Initial search value |
| `onSearch` | `(value: string) => void` | *required* | Callback function when search value changes |
| `className` | `string` | `''` | Optional class name for styling |
| `autoFocus` | `boolean` | `false` | Whether to auto-focus the input on mount |

## Example Implementation

See the `SearchDemo.tsx` page for examples of how to use the Search component in different scenarios:

1. Basic search that filters data as you type
2. Advanced search with minimum character requirement
3. Category filtering with badges

## Integration with Existing Pages

The Search component can be easily integrated into existing pages by replacing the current search implementation. For example, in the Departments page:

```tsx
// Before
<form onSubmit={handleSearchSubmit} className="relative flex-grow">
  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
  <Input
    ref={searchInputRef}
    type="text"
    placeholder="Cari departemen..."
    className="pl-8 pr-10"
    value={inputValue}
    onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
  />
  {inputValue && (
    <button
      type="button"
      onClick={() => setInputValue('')}
      className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
    >
      <X className="h-4 w-4" />
    </button>
  )}
</form>

// After
<Search
  placeholder="Cari departemen..."
  onSearch={handleSearch}
  initialValue={searchValue}
  autoFocus
/>
```
