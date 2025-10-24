export interface MockRequest {
  id: string;
  churchId: string;
  userId: string;
  requestTypeId: string;
  title: string;
  body: string;
  isConfidential: boolean;
  createdAt: string;
  status: 'Pending' | 'InProgress' | 'Closed';
}

export const mockRequests: MockRequest[] = [
  {
    id: 'req-1',
    churchId: 'church-acc',
    userId: 'user-member-2',
    requestTypeId: 'req-type-2', // Benevolence
    title: 'Benevolence Request',
    body: 'Assistance needed with utility bills.',
    isConfidential: true,
    createdAt: '2024-07-28T10:00:00Z',
    status: 'Pending',
  },
  {
    id: 'req-2',
    churchId: 'church-acc',
    userId: 'user-member-3',
    requestTypeId: 'req-type-4', // Suggestion
    title: 'Youth Group Activity Suggestion',
    body: 'We should organize a hiking trip for the youth group next month.',
    isConfidential: false,
    createdAt: '2024-07-29T14:30:00Z',
    status: 'Pending',
  },
];
