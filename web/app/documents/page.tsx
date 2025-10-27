import { api } from '../../lib/api.server';
import { DocumentsClient } from './documents-client';

export default async function DocumentsPage() {
  const [documents, roles, me] = await Promise.all([
    api.documents(),
    api.roles(),
    api.currentUser(),
  ]);

  return <DocumentsClient documents={documents} roles={roles} me={me} />;
}
