import * as React from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ComboboxProps<T> {
  id: string;
  items: T[];
  /** Text shown in the input when the list is closed. */
  value: string;
  onSelect: (item: T) => void;
  itemKey: (item: T) => string;
  /** Text the item is matched against and shown as when selected. */
  itemText: (item: T) => string;
  renderItem?: (item: T) => React.ReactNode;
  /** Extra text to match on (description, organization, …). */
  itemSearchText?: (item: T) => string;
  isDisabled?: (item: T) => boolean;
  /** Accept typed text that matches no item; it is passed to `onInputChange`. */
  allowCustom?: boolean;
  onInputChange?: (text: string) => void;
  placeholder?: string;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  leading?: React.ReactNode;
  mono?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  /** Only this many matches are rendered; typing narrows the rest. */
  maxResults?: number;
}

/** A searchable select (WAI-ARIA combobox with a listbox popup). */
export function Combobox<T>({
  id, items, value, onSelect, itemKey, itemText, renderItem, itemSearchText, isDisabled,
  allowCustom, onInputChange, placeholder, loading, loadingText = 'Loading…', emptyText = 'No matches',
  leading, mono, invalid, disabled, maxResults = 50,
}: ComboboxProps<T>) {
  const listId = `${id}-listbox`;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);

  // Opening on an existing selection shows the full list, not just that item.
  const q = query.trim().toLowerCase();
  const showAll = !q || items.some((i) => itemText(i).toLowerCase() === q);
  const matches = showAll ? items : items.filter((i) =>
    `${itemText(i)} ${itemSearchText?.(i) ?? ''}`.toLowerCase().includes(q));
  const visible = matches.slice(0, maxResults);
  const optionId = (index: number) => `${id}-option-${index}`;

  React.useEffect(() => {
    if (open) listRef.current?.querySelector(`#${CSS.escape(optionId(active))}`)?.scrollIntoView({ block: 'nearest' });
  });

  const openList = () => {
    if (open || disabled) return;
    setQuery(allowCustom ? value : '');
    const selected = items.findIndex((i) => itemText(i) === value);
    setActive(allowCustom ? selected : Math.max(selected, 0));
    setOpen(true);
  };

  const choose = (item: T) => {
    if (isDisabled?.(item)) return;
    onSelect(item);
    setOpen(false);
  };

  const move = (delta: number) => {
    if (!visible.length) return;
    let next = active < 0 ? (delta > 0 ? -1 : 0) : active;
    for (let step = 0; step < visible.length; step++) {
      next = (next + delta + visible.length) % visible.length;
      if (!isDisabled?.(visible[next])) break;
    }
    setActive(next);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return openList();
      move(e.key === 'ArrowDown' ? 1 : -1);
    } else if (e.key === 'Home' && open) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End' && open) {
      e.preventDefault();
      setActive(Math.max(visible.length - 1, 0));
    } else if (e.key === 'Enter' && open) {
      e.preventDefault();
      // With nothing highlighted, Enter keeps the typed text (custom value).
      if (active >= 0 && visible[active]) choose(visible[active]);
      else setOpen(false);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      {leading && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex">{leading}</span>}
      <input
        ref={inputRef}
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && visible[active] ? optionId(active) : undefined}
        aria-invalid={invalid || undefined}
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        placeholder={placeholder}
        value={open ? query : value}
        // Select the current text so typing replaces it instead of editing it.
        onFocus={(e) => { openList(); e.currentTarget.select(); }}
        onClick={openList}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        onChange={(e) => {
          setQuery(e.target.value);
          // Free-text fields don't pre-highlight a match, so Enter keeps what was typed.
          setActive(allowCustom ? -1 : 0);
          setOpen(true);
          if (allowCustom) onInputChange?.(e.target.value);
        }}
        className={cn(
          'w-full h-9 rounded-lg border border-line bg-page-deep pr-8 text-sm text-ink placeholder:text-muted/70 outline-none transition-colors',
          'focus:border-acid/60 focus:ring-2 focus:ring-acid/15 focus-visible:outline-none disabled:opacity-60',
          leading ? 'pl-9' : 'pl-3', mono && 'font-mono', invalid && 'border-danger/60',
        )}
      />
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />}
      </span>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          // Keep focus in the input while clicking the list.
          onMouseDown={(e) => e.preventDefault()}
          className="absolute z-30 mt-1 w-full max-h-72 overflow-y-auto rounded-lg border border-line-strong bg-raised shadow-xl shadow-black/40 py-1"
        >
          {loading && !items.length ? (
            <li className="px-3 py-2.5 text-sm text-muted flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {loadingText}</li>
          ) : !visible.length ? (
            <li className="px-3 py-2.5 text-sm text-muted">
              {emptyText}{allowCustom && query.trim() && <> · press Enter to use <span className="font-mono text-ink">{query.trim()}</span></>}
            </li>
          ) : (
            visible.map((item, index) => {
              const itemDisabled = isDisabled?.(item) ?? false;
              const selected = itemText(item) === value;
              return (
                <li
                  key={itemKey(item)}
                  id={optionId(index)}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={itemDisabled || undefined}
                  onMouseEnter={() => !itemDisabled && setActive(index)}
                  onClick={() => choose(item)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm',
                    itemDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                    index === active && !itemDisabled && 'bg-hover',
                  )}
                >
                  <div className="flex-1 min-w-0">{renderItem ? renderItem(item) : itemText(item)}</div>
                  {selected && <Check className="w-4 h-4 text-acid shrink-0" />}
                </li>
              );
            })
          )}
          {matches.length > visible.length && (
            <li className="px-3 py-1.5 text-xs text-muted border-t border-line mt-1">
              Showing {visible.length} of {matches.length}. Keep typing to narrow.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
