
export enum RequestType {
  Prayer = 'PRAYER',
  Benevolence = 'BENEVOLENCE',
  Improvement = 'IMPROVEMENT',
  Suggestion = 'SUGGESTION',
}

export interface MockRequest {
  id: string;
  churchId: string;
  userId: string;
  type: RequestType;
  title: string;
  body: string;
  isConfidential: boolean;
  createdAt: string;
}

export const mockRequests: MockRequest[] = [
  {
    id: 'req-1',
    churchId: '1',
    userId: 'user-2',
    type: RequestType.Benevolence,
    title: 'Benevolence Request',
    body: 'Assistance needed with utility bills.',
    isConfidential: true,
    createdAt: '2024-07-28T10:00:00Z',
  },
  {
    id: 'req-2',
    churchId: '1',
    userId: 'user-3',
    type: RequestType.Suggestion,
    title: 'Youth Group Activity Suggestion',
    body: 'We should organize a hiking trip for the youth group next month.',
    isConfidential: false,
    createdAt: '2024-07-29T14:30:00Z',
  },
];
