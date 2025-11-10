import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useMembersQueryState } from '../../../lib/hooks/use-members-query-state';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(''),
  useRouter: () => ({ push: jest.fn() }),
}));

describe('useMembersQueryState', () => {
  it('initialises with defaults', () => {
    const { result } = renderHook(() => useMembersQueryState());
    expect(result.current.queryState.page).toBe(1);
    expect(result.current.queryState.limit).toBe(25);
  });

  it('updates search and resets page', () => {
    const { result } = renderHook(() => useMembersQueryState());
    act(() => {
      result.current.updateQuery({ search: 'john' });
    });
    expect(result.current.queryState.search).toBe('john');
  });
});
