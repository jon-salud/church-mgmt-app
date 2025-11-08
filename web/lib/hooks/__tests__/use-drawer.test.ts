import { renderHook, act, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDrawer } from '../use-drawer';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('useDrawer', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });
  });

  describe('Basic State Management', () => {
    it('should return closed state when no drawer param in URL', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useDrawer());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.drawerId).toBeNull();
    });

    it('should return open state when drawer param exists', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('drawer=member-123'));

      const { result } = renderHook(() => useDrawer());

      expect(result.current.isOpen).toBe(true);
      expect(result.current.drawerId).toBe('member-123');
    });

    it('should detect specific drawer by id', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('drawer=member-123'));

      const { result } = renderHook(() => useDrawer('member-123'));

      expect(result.current.isOpen).toBe(true);
      expect(result.current.drawerId).toBe('member-123');
    });

    it('should return closed for non-matching drawer id', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('drawer=member-123'));

      const { result } = renderHook(() => useDrawer('member-456'));

      expect(result.current.isOpen).toBe(false);
      expect(result.current.drawerId).toBeNull();
    });
  });

  describe('Opening Drawers', () => {
    it('should add drawer param to URL when opening', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useDrawer());

      act(() => {
        result.current.open('member-123');
      });

      expect(mockPush).toHaveBeenCalledWith('?drawer=member-123');
    });

    it('should preserve existing params when opening drawer', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('search=john&page=2'));

      const { result } = renderHook(() => useDrawer());

      act(() => {
        result.current.open('member-123');
      });

      expect(mockPush).toHaveBeenCalledWith('?search=john&page=2&drawer=member-123');
    });

    it('should replace existing drawer param', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('drawer=member-123'));

      const { result } = renderHook(() => useDrawer());

      act(() => {
        result.current.open('member-456');
      });

      expect(mockPush).toHaveBeenCalledWith('?drawer=member-456');
    });

    it('should use replace mode when specified', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useDrawer());

      act(() => {
        result.current.open('member-123', { replace: true });
      });

      expect(mockReplace).toHaveBeenCalledWith('?drawer=member-123');
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Closing Drawers', () => {
    it('should remove drawer param from URL when closing', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('drawer=member-123'));

      const { result } = renderHook(() => useDrawer());

      act(() => {
        result.current.close();
      });

      expect(mockPush).toHaveBeenCalledWith('?');
    });

    it('should preserve other params when closing drawer', () => {
      (useSearchParams as jest.Mock).mockReturnValue(
        new URLSearchParams('drawer=member-123&search=john&page=2')
      );

      const { result } = renderHook(() => useDrawer());

      act(() => {
        result.current.close();
      });

      expect(mockPush).toHaveBeenCalledWith('?search=john&page=2');
    });

    it('should do nothing if drawer is already closed', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useDrawer());

      act(() => {
        result.current.close();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should use replace mode when specified', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('drawer=member-123'));

      const { result } = renderHook(() => useDrawer());

      act(() => {
        result.current.close({ replace: true });
      });

      expect(mockReplace).toHaveBeenCalledWith('?');
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Browser Navigation', () => {
    it('should handle browser back button', async () => {
      let searchParams = new URLSearchParams('drawer=member-123');
      (useSearchParams as jest.Mock).mockReturnValue(searchParams);

      const { result, rerender } = renderHook(() => useDrawer());

      expect(result.current.isOpen).toBe(true);

      // Simulate browser back
      searchParams = new URLSearchParams('');
      (useSearchParams as jest.Mock).mockReturnValue(searchParams);
      rerender();

      await waitFor(() => {
        expect(result.current.isOpen).toBe(false);
      });
    });

    it('should handle browser forward button', async () => {
      let searchParams = new URLSearchParams('');
      (useSearchParams as jest.Mock).mockReturnValue(searchParams);

      const { result, rerender } = renderHook(() => useDrawer());

      expect(result.current.isOpen).toBe(false);

      // Simulate browser forward
      searchParams = new URLSearchParams('drawer=member-123');
      (useSearchParams as jest.Mock).mockReturnValue(searchParams);
      rerender();

      await waitFor(() => {
        expect(result.current.isOpen).toBe(true);
      });
    });
  });

  describe('Toggle Functionality', () => {
    it('should open drawer when closed', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useDrawer());

      act(() => {
        result.current.toggle('member-123');
      });

      expect(mockPush).toHaveBeenCalledWith('?drawer=member-123');
    });

    it('should close drawer when open', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('drawer=member-123'));

      const { result } = renderHook(() => useDrawer('member-123'));

      act(() => {
        result.current.toggle('member-123');
      });

      expect(mockPush).toHaveBeenCalledWith('?');
    });

    it('should switch to different drawer when toggling with different id', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('drawer=member-123'));

      const { result } = renderHook(() => useDrawer());

      act(() => {
        result.current.toggle('member-456');
      });

      expect(mockPush).toHaveBeenCalledWith('?drawer=member-456');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty drawer id', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useDrawer());

      act(() => {
        result.current.open('');
      });

      expect(mockPush).toHaveBeenCalledWith('?drawer=');
    });

    it('should handle special characters in drawer id', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useDrawer());

      act(() => {
        result.current.open('member-123/edit');
      });

      expect(mockPush).toHaveBeenCalledWith('?drawer=member-123%2Fedit');
    });

    it('should handle multiple rapid opens', () => {
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

      const { result } = renderHook(() => useDrawer());

      act(() => {
        result.current.open('member-1');
        result.current.open('member-2');
        result.current.open('member-3');
      });

      // Should only push the last one
      expect(mockPush).toHaveBeenCalledTimes(3);
      expect(mockPush).toHaveBeenLastCalledWith('?drawer=member-3');
    });
  });
});
