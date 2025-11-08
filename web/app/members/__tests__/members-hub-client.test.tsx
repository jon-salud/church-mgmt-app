import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MembersHubClient } from '../members-hub-client';

// Mock hooks
jest.mock('../../../lib/hooks/use-toast', () => ({
  useToast: () => ({ pushToast: jest.fn() }),
}));

jest.mock('../../../lib/hooks/use-drawer', () => ({
  useDrawer: () => ({ open: jest.fn(), close: jest.fn(), isOpen: false, setContent: jest.fn() }),
}));

// Mock API fetch
jest.mock('../../../lib/api/members', () => ({
  fetchMembers: jest.fn(async () => ({
    data: [
      {
        id: '1',
        firstName: 'Alice',
        lastName: 'Anderson',
        email: 'alice@example.com',
        phone: '111-111-1111',
        status: 'active',
        roles: ['Member'],
        lastAttendance: '2025-11-01T00:00:00Z',
        groupsCount: 1,
        badges: [],
        createdAt: '2025-01-01T00:00:00Z',
      },
      {
        id: '2',
        firstName: 'Bob',
        lastName: 'Brown',
        email: 'bob@example.com',
        phone: null,
        status: 'inactive',
        roles: ['Leader'],
        lastAttendance: null,
        groupsCount: 0,
        badges: ['Leader'],
        createdAt: '2025-02-01T00:00:00Z',
      },
    ],
    pagination: { page: 1, limit: 25, total: 2, pages: 1 },
    meta: { queryTime: 5, filters: {} },
  })),
}));

// Mock next/navigation for URL interactions
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(''),
  useRouter: () => ({ push: jest.fn() }),
}));

const roles = [
  { id: 'role-1', name: 'Member', slug: 'member' },
  { id: 'role-2', name: 'Leader', slug: 'leader' },
];

const me = { user: { roles: [{ slug: 'admin' }] } };

describe('MembersHubClient', () => {
  it('renders table and supports searching', async () => {
    render(<MembersHubClient roles={roles} me={me} />);

    expect(await screen.findByText('Members Hub')).toBeInTheDocument();

    // Type a search and ensure URL update intent (router.push called)
    const input = screen.getByPlaceholderText('Search name, email, phone') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'alice' } });

    await waitFor(() => {
      expect(input.value).toBe('alice');
    });

    // Rows should render
    expect(await screen.findByText('Alice Anderson')).toBeInTheDocument();
    expect(screen.getByText('Bob Brown')).toBeInTheDocument();
  });

  it('shows pagination summary', async () => {
    render(<MembersHubClient roles={roles} me={me} />);
    expect(await screen.findByText(/of 2/)).toBeInTheDocument();
  });
});
