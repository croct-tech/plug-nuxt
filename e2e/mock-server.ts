import {createServer, type IncomingMessage, type ServerResponse} from 'http';
import {MOCK_SERVER_PORT, TENANT_NAME, TENANT_CREDENTIALS} from './constants';

const PORT = MOCK_SERVER_PORT;

const SLOT_CONTENT: Record<string, object> = {
    'home-hero': {
        content: {
            _component: 'hero@1',
            headline: 'Mock Headline',
            tagline: 'Mock tagline',
        },
        metadata: {
            version: '1.0',
            contentSource: 'mock',
        },
    },
};

const LOCALIZED_SLOT_CONTENT: Record<string, Record<string, object>> = {
    'home-hero': {
        'pt-br': {
            content: {
                _component: 'hero@1',
                headline: 'Título Simulado',
                tagline: 'Tagline simulada',
            },
            metadata: {
                version: '1.0',
                contentSource: 'mock',
            },
        },
    },
};

const EVALUATION_RESULTS: Record<string, unknown> = {
    now: '2026-01-01T00:00:00.000000',
};

// Credentials served as if they lived in an external secrets service, keyed by
// tenant. Used by the credentials resolver in the playground app.
const CREDENTIALS_BY_TENANT: Record<string, object> = {
    [TENANT_NAME]: TENANT_CREDENTIALS,
};

type Route = (body: Record<string, unknown>, url: URL) => {status: number, data: unknown};

const routes: Record<string, Route> = {
    track: () => ({status: 200, data: {}}),
    credentials: (_, url) => {
        const tenant = url.searchParams.get('tenant') ?? '';
        const credentials = CREDENTIALS_BY_TENANT[tenant];

        if (credentials !== undefined) {
            return {status: 200, data: credentials};
        }

        return {status: 404, data: {error: `Unknown tenant "${tenant}".`}};
    },
    evaluate: body => {
        const query = String(body.query ?? '');
        const result = EVALUATION_RESULTS[query];

        if (result !== undefined) {
            return {status: 200, data: result};
        }

        return {
            status: 400,
            data: {
                title: 'Invalid query',
                type: 'https://croct.help/api/evaluation#invalid-query',
                detail: `Syntax error in query: "${query}"`,
                status: 400,
            },
        };
    },
    content: (body, url) => {
        const slotId = String(body.slotId ?? url.searchParams.get('slotId') ?? '');
        const baseSlotId = slotId.split('@')[0];
        const locale = typeof body.preferredLocale === 'string' ? body.preferredLocale : undefined;
        const content = (locale !== undefined ? LOCALIZED_SLOT_CONTENT[baseSlotId]?.[locale] : undefined)
            ?? SLOT_CONTENT[baseSlotId];

        if (content !== undefined) {
            return {status: 200, data: content};
        }

        return {
            status: 404,
            data: {
                title: 'Resource not found',
                type: 'https://croct.help/api/admin#resource-not-found',
                detail: `No slot found with ID "${slotId}".`,
                status: 404,
            },
        };
    },
};

function handleRequest(request: IncomingMessage, response: ServerResponse): void {
    const url = new URL(request.url ?? '/', `http://${request.headers.host}`);
    const body: Buffer[] = [];

    request.on('data', (chunk: Buffer) => body.push(chunk));

    request.on('end', () => {
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.setHeader('Access-Control-Allow-Headers', '*');

        if (request.method === 'OPTIONS') {
            response.writeHead(204);
            response.end();

            return;
        }

        const rawBody = Buffer.concat(body).toString();
        const requestBody = rawBody !== '' ? JSON.parse(rawBody) : {};

        const route = resolveRoute(url.pathname);

        if (route === null) {
            response.writeHead(404);
            response.end(JSON.stringify({error: 'Not found'}));

            return;
        }

        const {status, data} = route(requestBody, url);

        response.writeHead(status);
        response.end(JSON.stringify(data));
    });
}

function resolveRoute(pathname: string): Route | null {
    for (const [name, handler] of Object.entries(routes)) {
        if (pathname.endsWith(`/${name}`) || pathname.endsWith(`/web/${name}`)) {
            return handler;
        }
    }

    return null;
}

const server = createServer(handleRequest);

server.listen(PORT, () => {
    process.stdout.write(`Mock Croct API running on http://localhost:${PORT}\n`);
});

export default server;
