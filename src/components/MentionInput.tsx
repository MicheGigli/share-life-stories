import { useState, useRef, useEffect } from 'react';
import { Textarea } from './ui/textarea';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  nickname: string;
  user_id: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const MentionInput = ({ value, onChange, placeholder, className }: MentionInputProps) => {
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      setCursorPosition(textarea.selectionStart);
    }
  }, [value]);

  const fetchUserSuggestions = async (query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('nickname, user_id')
      .ilike('nickname', `%${query}%`)
      .limit(5);

    if (error) {
      console.error('Error fetching user suggestions:', error);
      return;
    }

    setSuggestions(data || []);
    setShowSuggestions((data || []).length > 0);
    setSelectedIndex(0);
  };

  const handleTextChange = (newValue: string) => {
    onChange(newValue);
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const queryAfterAt = textBeforeCursor.substring(atIndex + 1);
      if (!queryAfterAt.includes(' ') && !queryAfterAt.includes('\n')) {
        fetchUserSuggestions(queryAfterAt);
        return;
      }
    }
    
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const insertMention = (nickname: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const textAfterCursor = value.substring(cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const newValue = 
        value.substring(0, atIndex) + 
        `@${nickname} ` + 
        textAfterCursor;
      
      onChange(newValue);
      setShowSuggestions(false);
      setSuggestions([]);
      
      // Set focus back to textarea
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = atIndex + nickname.length + 2;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        insertMention(suggestions[selectedIndex].nickname);
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSuggestions([]);
        break;
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => handleTextChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        rows={3}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-40 overflow-y-auto">
          {suggestions.map((profile, index) => (
            <div
              key={profile.user_id}
              className={`px-3 py-2 cursor-pointer text-sm hover:bg-accent ${
                index === selectedIndex ? 'bg-accent' : ''
              }`}
              onClick={() => insertMention(profile.nickname)}
            >
              @{profile.nickname}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};