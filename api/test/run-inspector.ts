import { bootstrapTestApp } from './support/e2e-bootstrap';

async function inspectController(app: any, controllerPath: string, controllerName: string) {
  try {
    // dynamic import of source module to match transform identity
    // (favor src so in-process module identity aligns with the test module)
    const mod = await import(`../../src/modules/${controllerPath}`);
    const ControllerClass = mod?.[controllerName];
    console.log(
      `\n[inspector] Looking for ${controllerName} (token: ${controllerPath}.${controllerName})`
    );
    if (!ControllerClass) {
      console.log(`[inspector] ${controllerName} token not found in import`);
      return;
    }
    let instance: any = undefined;
    try {
      instance = app.get(ControllerClass as any, { strict: false });
    } catch (e) {
      console.warn(`[inspector] app.get(${controllerName}) threw`, (e as any)?.message || e);
    }
    console.log(`[inspector] ${controllerName} resolved?`, !!instance);
    if (instance) {
      const props = Object.getOwnPropertyNames(instance).filter(
        p => /service$/i.test(p) || /Service$/i.test(p) || p.endsWith('Service')
      );
      const snap: Record<string, string> = {};
      for (const p of props) snap[p] = instance[p] == null ? 'MISSING' : 'OK';
      console.log(`[inspector] ${controllerName} props ->`, snap);
    }
  } catch (err) {
    console.warn('[inspector] error inspecting', controllerName, (err as any)?.message || err);
  }
}

(async () => {
  try {
    const { app } = await bootstrapTestApp();

    // Inspect common controllers before any requests
    await inspectController(app, 'roles/roles.controller', 'RolesController');
    await inspectController(app, 'documents/documents.controller', 'DocumentsController');
    await inspectController(
      app,
      'pastoral-care/pastoral-care.controller',
      'PastoralCareController'
    );
    await inspectController(app, 'events/events.controller', 'EventsController');
    await inspectController(app, 'users/users.controller', 'UsersController');
    await inspectController(app, 'requests/requests.controller', 'RequestsController');

    // Now trigger a few endpoints to ensure any per-request wiring is exercised
    console.log('\n[inspector] issuing HTTP-like inject calls');
    const endpoints = [
      { method: 'GET', url: '/api/v1/roles', headers: { authorization: 'Bearer demo-admin' } },
      { method: 'GET', url: '/api/v1/documents', headers: { authorization: 'Bearer demo-admin' } },
      {
        method: 'POST',
        url: '/api/v1/pastoral-care/tickets',
        payload: { title: 'ti', description: 'desc' },
        headers: { authorization: 'Bearer demo-admin', 'content-type': 'application/json' },
      },
    ];

    for (const e of endpoints) {
      try {
        console.log(`[inspector] -> ${e.method} ${e.url}`);
        const res = await app.inject(e as any);
        console.log(`[inspector] response ${e.method} ${e.url} -> status=${res.statusCode}`);
        let body: any = undefined;
        try {
          body = res.json();
        } catch (_) {
          body = res.body;
        }
        console.log(`[inspector] body:`, body);
      } catch (err) {
        console.warn('[inspector] inject error', (err as any)?.message || err);
      }
    }

    // Inspect controllers again after requests
    console.log('\n[inspector] re-inspecting controllers after requests');
    await inspectController(app, 'roles/roles.controller', 'RolesController');
    await inspectController(app, 'documents/documents.controller', 'DocumentsController');
    await inspectController(
      app,
      'pastoral-care/pastoral-care.controller',
      'PastoralCareController'
    );

    // cleanup
    try {
      await app.close();
    } catch (_) {}
    // small delay before exit to flush console
    setTimeout(() => process.exit(0), 100);
  } catch (err) {
    console.error('run-inspector error', (err as any)?.message || err);
    process.exit(1);
  }
})();
