import { renderHook, act } from '@testing-library/react';
import { useToast } from '../use-toast';

describe('useToast', () => {
  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => useToast());
    act(() => {
      // Clear all toasts
      while (result.current.toasts.length > 0) {
        result.current.dismiss(result.current.toasts[0].id);
      }
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Adding Toasts', () => {
    it('should add a success toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Success message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        message: 'Success message',
        variant: 'success',
      });
    });

    it('should add an error toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('Error message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        message: 'Error message',
        variant: 'error',
      });
    });

    it('should add an info toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Info message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        message: 'Info message',
        variant: 'info',
      });
    });

    it('should add a warning toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.warning('Warning message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        message: 'Warning message',
        variant: 'warning',
      });
    });

    it('should generate unique IDs for each toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Toast 1');
        result.current.info('Toast 2');
        result.current.info('Toast 3');
      });

      const ids = result.current.toasts.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });
  });

  describe('Toast Queue Management', () => {
    it('should limit toasts to maxToasts (default 3)', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Toast 1');
        result.current.info('Toast 2');
        result.current.info('Toast 3');
        result.current.info('Toast 4');
      });

      expect(result.current.toasts).toHaveLength(3);
      expect(result.current.toasts[0].message).toBe('Toast 2');
      expect(result.current.toasts[2].message).toBe('Toast 4');
    });

    it('should respect custom maxToasts option', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Toast 1', { maxToasts: 5 });
        result.current.info('Toast 2');
        result.current.info('Toast 3');
        result.current.info('Toast 4');
        result.current.info('Toast 5');
        result.current.info('Toast 6');
      });

      expect(result.current.toasts).toHaveLength(5);
      expect(result.current.toasts[0].message).toBe('Toast 2');
    });
  });

  describe('Auto-dismiss', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should auto-dismiss after default duration (3000ms)', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Auto-dismiss toast');
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should respect custom duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Custom duration toast', { duration: 5000 });
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should not auto-dismiss when duration is 0', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Persistent toast', { duration: 0 });
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(result.current.toasts).toHaveLength(1);
    });
  });

  describe('Manual Dismiss', () => {
    it('should dismiss specific toast by id', () => {
      const { result } = renderHook(() => useToast());

      let toastId: string;
      act(() => {
        result.current.info('Toast 1');
        toastId = result.current.info('Toast 2');
        result.current.info('Toast 3');
      });

      expect(result.current.toasts).toHaveLength(3);

      act(() => {
        result.current.dismiss(toastId!);
      });

      expect(result.current.toasts).toHaveLength(2);
      expect(result.current.toasts.find(t => t.id === toastId)).toBeUndefined();
    });

    it('should dismiss all toasts when no id provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Toast 1');
        result.current.info('Toast 2');
        result.current.info('Toast 3');
      });

      expect(result.current.toasts).toHaveLength(3);

      act(() => {
        result.current.dismiss();
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should handle dismissing non-existent toast gracefully', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Toast 1');
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.dismiss('non-existent-id');
      });

      expect(result.current.toasts).toHaveLength(1);
    });
  });

  describe('Toast Options', () => {
    it('should include custom title', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Message', { title: 'Custom Title' });
      });

      expect(result.current.toasts[0].title).toBe('Custom Title');
    });

    it('should include action button', () => {
      const { result } = renderHook(() => useToast());
      const mockAction = jest.fn();

      act(() => {
        result.current.info('Message', {
          action: { label: 'Undo', onClick: mockAction },
        });
      });

      expect(result.current.toasts[0].action).toEqual({
        label: 'Undo',
        onClick: mockAction,
      });
    });

    it('should handle closable option', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Message', { closable: false });
      });

      expect(result.current.toasts[0].closable).toBe(false);
    });
  });

  describe('Return Value', () => {
    it('should return toast id when adding toast', () => {
      const { result } = renderHook(() => useToast());

      let id: string;
      act(() => {
        id = result.current.info('Message');
      });

      expect(id!).toBeTruthy();
      expect(result.current.toasts[0].id).toBe(id!);
    });
  });

  describe('Multiple Instances', () => {
    it('should share state across multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useToast());
      const { result: result2 } = renderHook(() => useToast());

      act(() => {
        result1.current.info('Shared toast');
      });

      expect(result1.current.toasts).toHaveLength(1);
      expect(result2.current.toasts).toHaveLength(1);
      expect(result1.current.toasts[0].id).toBe(result2.current.toasts[0].id);
    });

    it('should allow dismissal from different instances', () => {
      const { result: result1 } = renderHook(() => useToast());
      const { result: result2 } = renderHook(() => useToast());

      let toastId: string;
      act(() => {
        toastId = result1.current.info('Shared toast');
      });

      act(() => {
        result2.current.dismiss(toastId);
      });

      expect(result1.current.toasts).toHaveLength(0);
      expect(result2.current.toasts).toHaveLength(0);
    });
  });
});
