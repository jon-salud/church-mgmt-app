
export interface MockRequestType {
  id: string;
  name: string;
  description: string;
  churchId: string;
  status: 'active' | 'archived';
  isBuiltIn: boolean;
  displayOrder: number;
  hasConfidentialField: boolean;
}

export const mockRequestTypes: MockRequestType[] = [
  {
    id: 'req-type-1',
    name: 'Prayer',
    description: 'Share your prayer requests with the pastoral team. You can choose to share them publicly on the Prayer Wall.',
    churchId: '',
    status: 'active',
    isBuiltIn: true,
    displayOrder: 1,
    hasConfidentialField: true,
  },
  {
    id: 'req-type-2',
    name: 'Benevolence',
    description: 'If you are in need of financial assistance, please describe your situation. This request is confidential.',
    churchId: '',
    status: 'active',
    isBuiltIn: true,
    displayOrder: 2,
    hasConfidentialField: true,
  },
  {
    id: 'req-type-3',
    name: 'Improvement',
    description: 'Suggest an improvement for the church facilities or services.',
    churchId: '',
    status: 'active',
    isBuiltIn: true,
    displayOrder: 3,
    hasConfidentialField: false,
  },
  {
    id: 'req-type-4',
    name: 'Suggestion',
    description: 'Share a new idea or suggestion for the church.',
    churchId: '',
    status: 'active',
    isBuiltIn: true,
    displayOrder: 4,
    hasConfidentialField: false,
  },
];
