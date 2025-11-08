import { renderHook, act, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUrlState } from '../use-url-state';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('useUrlState', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });
  });

  describe('Reading State', () => {
    it('should return default value when param not in URL', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useUrlState('page', 1));

      expect(result.current[0]).toBe(1);
    });

    it('should return URL value when param exists', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('page=5'));

      const { result } = renderHook(() => useUrlState('page', 1));

      expect(result.current[0]).toBe('5');
    });

    it('should handle string values', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('search=john'));

      const { result } = renderHook(() => useUrlState('search', ''));

      expect(result.current[0]).toBe('john');
    });

    it('should handle null default', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useUrlState<string | null>('filter', null));

      expect(result.current[0]).toBeNull();
    });
  });

  describe('Setting State', () => {
    it('should add param to URL when setting value', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useUrlState('page', 1));

      act(() => {
        result.current[1](5);
      });

      expect(mockPush).toHaveBeenCalledWith('?page=5');
    });

    it('should update existing param', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('page=1'));

      const { result } = renderHook(() => useUrlState('page', 1));

      act(() => {
        result.current[1](2);
      });

      expect(mockPush).toHaveBeenCalledWith('?page=2');
    });

    it('should preserve other params when setting', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('search=john&sort=name'));

      const { result } = renderHook(() => useUrlState('page', 1));

      act(() => {
        result.current[1](3);
      });

      expect(mockPush).toHaveBeenCalledWith('?search=john&sort=name&page=3');
    });

    it('should remove param when setting to default value', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('page=5'));

      const { result } = renderHook(() => useUrlState('page', 1));

      act(() => {
        result.current[1](1);
      });

      expect(mockPush).toHaveBeenCalledWith('?');
    });

    it('should remove param when setting to null', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('filter=active'));

      const { result } = renderHook(() => useUrlState<string | null>('filter', null));

      act(() => {
        result.current[1](null);
      });

      expect(mockPush).toHaveBeenCalledWith('?');
    });

    it('should remove param when setting to empty string with empty default', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('search=test'));

      const { result } = renderHook(() => useUrlState('search', ''));

      act(() => {
        result.current[1]('');
      });

      expect(mockPush).toHaveBeenCalledWith('?');
    });
  });

  describe('Options', () => {
    it('should use replace mode when specified', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useUrlState('page', 1, { replace: true }));

      act(() => {
        result.current[1](5);
      });

      expect(mockReplace).toHaveBeenCalledWith('?page=5');
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should use shallow mode (default behavior)', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useUrlState('page', 1, { shallow: true }));

      act(() => {
        result.current[1](5);
      });

      expect(mockPush).toHaveBeenCalled();
    });

    it('should serialize values with custom serializer', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() =>
        useUrlState(
          'data',
          { count: 0 },
          {
            serialize: value => JSON.stringify(value),
            deserialize: value => JSON.parse(value),
          }
        )
      );

      act(() => {
        result.current[1]({ count: 5 });
      });

      expect(mockPush).toHaveBeenCalledWith('?data=%7B%22count%22%3A5%7D');
    });

    it('should deserialize values with custom deserializer', () => {
      (useSearchParams as jest.Mock).mockReturnValue(
        new URLSearchParams('data=%7B%22count%22%3A10%7D')
      );

      const { result } = renderHook(() =>
        useUrlState(
          'data',
          { count: 0 },
          {
            serialize: value => JSON.stringify(value),
            deserialize: value => JSON.parse(value),
          }
        )
      );

      expect(result.current[0]).toEqual({ count: 10 });
    });
  });

  describe('Functional Updates', () => {
    it('should support functional state updates', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('count=5'));

      const { result } = renderHook(() => useUrlState('count', 0));

      act(() => {
        result.current[1](prev => {
          const current = typeof prev === 'string' ? parseInt(prev, 10) : prev;
          return current + 1;
        });
      });

      expect(mockPush).toHaveBeenCalledWith('?count=6');
    });

    it('should handle functional update with default value', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useUrlState('count', 0));

      act(() => {
        result.current[1](prev => prev + 1);
      });

      expect(mockPush).toHaveBeenCalledWith('?count=1');
    });
  });

  describe('Browser Navigation', () => {
    it('should sync state with browser back/forward', async () => {
      let searchParams = new URLSearchParams('page=1');
      (useSearchParams as jest.Mock).mockReturnValue(searchParams);

      const { result, rerender } = renderHook(() => useUrlState('page', 1));

      expect(result.current[0]).toBe('1');

      // Simulate browser navigation
      searchParams = new URLSearchParams('page=2');
      (useSearchParams as jest.Mock).mockReturnValue(searchParams);
      rerender();

      await waitFor(() => {
        expect(result.current[0]).toBe('2');
      });
    });
  });

  describe('Type Safety', () => {
    it('should handle number types', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useUrlState<number>('page', 1));

      expect(typeof result.current[0]).toBe('number');
    });

    it('should handle string types', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useUrlState<string>('search', ''));

      expect(typeof result.current[0]).toBe('string');
    });

    it('should handle union types', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() =>
        useUrlState<'all' | 'active' | 'archived'>('status', 'all')
      );

      expect(result.current[0]).toBe('all');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in values', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useUrlState('search', ''));

      act(() => {
        result.current[1]('john & jane');
      });

      expect(mockPush).toHaveBeenCalledWith('?search=john+%26+jane');
    });

    it('should handle empty string as value', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('search='));

      const { result } = renderHook(() => useUrlState('search', ''));

      expect(result.current[0]).toBe('');
    });

    it('should handle rapid state changes', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useUrlState('count', 0));

      act(() => {
        result.current[1](1);
        result.current[1](2);
        result.current[1](3);
      });

      expect(mockPush).toHaveBeenCalledTimes(3);
      expect(mockPush).toHaveBeenLastCalledWith('?count=3');
    });

    it('should not update URL if value unchanged', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('page=1'));

      const { result } = renderHook(() => useUrlState('page', 1));

      act(() => {
        // Provide numeric value matching generic type instead of string to satisfy TS SetStateAction<number>
        result.current[1](1);
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
