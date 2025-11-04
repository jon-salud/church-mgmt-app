import { api } from '../../../lib/api.server';
import { HouseholdDetailClient } from './household-detail-client';

export default async function HouseholdDetailPage({ params }: { params: { id: string } }) {
  try {
    const [household, children, deletedChildren, user] = await Promise.all([
      api.household(params.id),
      api.getChildren(params.id).catch(() => []),
      api.listDeletedChildren().catch(() => []),
      api
        .currentUser()
        .then(data => data?.user || null)
        .catch(() => null),
    ]);

    if (!household) {
      return <div>Household not found</div>;
    }

    return (
      <HouseholdDetailClient
        household={household}
        children={children}
        deletedChildren={deletedChildren}
        user={user}
      />
    );
  } catch {
    return (
      <div>
        Unable to load household details. Please try again or contact support if the problem
        persists.
      </div>
    );
  }
}
