import { PastoralCareClientPage } from './client-page';
import { PageHeader } from '@/components/ui/page-header';

export default async function PastoralCareDashboard() {
  // Demo data for static export
  const tickets = [
    {
      id: '1',
      title: 'Prayer Request for Healing',
      description: 'Please pray for my grandmother who is in the hospital.',
      status: 'NEW' as const,
      priority: 'NORMAL' as const,
      type: 'Pastoral Care',
      author: {
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      },
      createdAt: '2024-01-10T10:00:00Z',
      comments: [],
    },
    {
      id: '2',
      title: 'Counseling Session Request',
      description: 'I would like to schedule a counseling session.',
      status: 'ASSIGNED' as const,
      priority: 'HIGH' as const,
      type: 'Pastoral Care',
      author: {
        profile: {
          firstName: 'Jane',
          lastName: 'Smith',
        },
      },
      createdAt: '2024-01-12T14:00:00Z',
      comments: [],
    },
  ];

  const requests = [
    {
      id: '3',
      title: 'Baptism Preparation',
      description: 'I am interested in learning more about baptism.',
      type: 'Baptism',
      status: 'NEW',
      createdAt: '2024-01-11T09:00:00Z',
    },
  ];

  const requestTypes = [
    {
      id: '1',
      name: 'Baptism',
      description: 'Baptism preparation and scheduling',
      churchId: 'demo-church',
      status: 'active' as const,
      isBuiltIn: true,
      displayOrder: 1,
      hasConfidentialField: false,
    },
    {
      id: '2',
      name: 'Counseling',
      description: 'Pastoral counseling sessions',
      churchId: 'demo-church',
      status: 'active' as const,
      isBuiltIn: true,
      displayOrder: 2,
      hasConfidentialField: true,
    },
    {
      id: '3',
      name: 'Prayer Request',
      description: 'Prayer requests and support',
      churchId: 'demo-church',
      status: 'active' as const,
      isBuiltIn: true,
      displayOrder: 3,
      hasConfidentialField: false,
    },
  ];

  const combinedData = [...tickets, ...requests];

  return (
    <main>
      <PageHeader title="Pastoral Care" />
      <div className="container mx-auto p-4">
        <PastoralCareClientPage data={combinedData} requestTypes={requestTypes} />
      </div>
    </main>
  );
}
