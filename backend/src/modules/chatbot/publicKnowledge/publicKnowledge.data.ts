import type { IKnowledgeChunk } from '../knowledge/knowledge.types';

export type PublicKnowledgeRecord = Pick<IKnowledgeChunk,
    'sourceType' | 'sourceName' | 'title' | 'category' | 'content' | 'metadata'> & { sourceId: string };

function service(id: string, title: string, content: string, sourcePath: string, sourceFile: string, section = title): PublicKnowledgeRecord {
    return {
        sourceType: 'SERVICE', sourceId: `service:${id}`, sourceName: 'Agrotourism Connect',
        category: 'SERVICES', title, content,
        metadata: { sourcePath, sourceFile: `frontend/src/pages/public/${sourceFile}.tsx`, section, managedBy: 'public-website-sync' },
    };
}

// Curated from the named public pages; these describe capabilities, not live listings.
export const PUBLIC_KNOWLEDGE: PublicKnowledgeRecord[] = [
    {
        sourceType: 'COMPANY',
        sourceId: 'company:overview',
        sourceName: 'Agrotourism Connect',
        category: 'ABOUT_SERVICES',
        title: 'About Agrotourism Connect',
        content:
            'Agrotourism Connect is a platform for the complete journey of turning land into a tourism asset, from land submission through feasibility, planning, investment, development and tourism operations. It brings together landowners, investors, agro tourism developers, resort operators, tourism consultants, farmers and service providers to track progress and collaborate.',
        metadata: {
            sourcePath: '/about',
            sourceFile: 'frontend/src/pages/public/AboutPage.tsx',
            section: 'Our Story',
            managedBy: 'public-website-sync',
        },
    },

    {
        sourceType: 'SERVICE',
        sourceId: 'service:land-evaluation',
        sourceName: 'Agrotourism Connect',
        category: 'SERVICES',
        title: 'Land Advisory and Land Evaluation',
        content:
            'Agrotourism Connect provides land advisory to identify, evaluate and acquire suitable land for agro tourism projects. Its project feasibility process includes site evaluation and feasibility analysis.',
        metadata: {
            sourcePath: '/',
            sourceFile: 'frontend/src/pages/public/HomePage.tsx',
            section: 'Core Services / Project Feasibility',
            managedBy: 'public-website-sync',
        },
    },

    service('core-services', 'Agrotourism Connect — Core Services',
        'Agrotourism Connect focuses on tourism development through Land Development, Resort Development and Agro Tourism. Its core services include Land Advisory, Project Planning, Approvals & Legal, Development Support, Marketing & Sales, and Operations Support. Project planning includes feasibility studies, DPR, concept planning and designing.',
        '/', 'HomePage', 'Core Services / heroServiceCards'),
    service('land-development', 'Land Development',
        'Agrotourism Connect helps owners of agricultural or open land with tourism potential submit land details, location and infrastructure information, upload photos, videos and land documents, and track review status through development. Landowners can connect with investors and developers once their project is ready.',
        '/land-development', 'LandDevelopmentPage'),
    service('resort-development', 'Resort Development',
        'Resort development on Agrotourism Connect covers farm stays, eco resorts, villa resorts and wellness resorts, planned around the land\'s natural strengths, connectivity and tourism potential. The public page showcases premium cottages, A-frame cottages, POD/prefab cottages, pools, landscaping and landscaped gazebos.',
        '/resort-development', 'ResortDevelopmentPage'),
    service('agro-tourism', 'Agro Tourism',
        'Agrotourism Connect describes agro tourism as combining agriculture, tourism, hospitality, nature, activities, food, culture and wellness. Its concept is Grow + Stay + Experience + Earn: farming and plantation, stays in cottages, villas or farm stays, and visitor experiences. Examples on the public page include farm tours, fruit picking, nature trails, bird watching, yoga and farm-to-table food.',
        '/agro-tourism', 'AgroTourismPage'),
    service('feasibility-planning', 'Tourism Feasibility and Project Planning',
        'Agrotourism Connect provides project planning including feasibility studies, DPR, concept planning and designing. Project feasibility involves site evaluation and feasibility analysis, followed by planning and concept development for tourism projects.',
        '/', 'HomePage', 'Project Planning / Project Feasibility / Plan & Design'),
    service('approvals-legal', 'Approvals & Legal',
        'Agrotourism Connect offers documentation, legal compliance and regulatory approvals support as part of its tourism development services.',
        '/', 'HomePage', 'Core Services'),
    service('development-support', 'Development Support',
        'Agrotourism Connect offers infrastructure, amenities and landscaping development assistance for tourism projects.',
        '/', 'HomePage', 'Core Services'),
    service('marketing-sales', 'Marketing & Sales',
        'Agrotourism Connect offers project branding, digital marketing and sales support.',
        '/', 'HomePage', 'Core Services'),
    service('operations-support', 'Operations Support',
        'Agrotourism Connect offers operational guidance, revenue optimization and ongoing support.',
        '/', 'HomePage', 'Core Services'),
    service('investment-platform', 'Investment Platform Services',
        'The Agrotourism Connect investment page displays published agro tourism and resort projects for investment discussions and provides registration to express interest. Financial details are shared with registered, authorized investors. Investment structures and returns are not guaranteed and require independent legal and financial due diligence. This describes the platform service; it does not establish that any specific investment opportunity is currently available.',
        '/investments', 'InvestmentsPage'),
    {
        sourceType: 'CONTACT',
        sourceId: 'contact:website-form',
        sourceName: 'Agrotourism Connect',
        category: 'CONTACT',
        title: 'Contact Agrotourism Connect',
        content:
            'For land, investment, partnership or tourism development enquiries, users can contact Agrotourism Connect through the contact form on the website.',
        metadata: {
            sourcePath: '/contact',
            sourceFile: 'frontend/src/pages/public/ContactPage.tsx',
            section: 'Contact Form',
            managedBy: 'public-website-sync',
        },
    },
];
