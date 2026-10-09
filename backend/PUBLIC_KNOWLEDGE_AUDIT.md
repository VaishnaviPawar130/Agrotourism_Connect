# Public chatbot knowledge audit

The existing canonical dataset was extended from 13 to 41 records (28 additions). Its compatibility export, schema, collection and public sync remain in use. No separate knowledge system was introduced.

## Coverage and provenance

Reviewed public pages, navigation, authentication forms, user dashboard features, frontend constants and API clients, backend routes/controllers, seed provenance, existing knowledge ingestion, retrieval and tests. Account feature descriptions contain no individual account data. Source-file provenance remains internal metadata and is excluded from evidence-selection and answer prompts.

Added records:

| Source ID | Topic |
| --- | --- |
| company:mission | Mission and vision |
| company:development-process | Tourism development stages |
| knowledge:center-overview | Knowledge Center and coming-soon publication status |
| knowledge:center-topics | Six displayed topic cards |
| website:sections | Public navigation |
| website:project-search | Project search, type filtering and sorting |
| website:project-types | Project type options |
| website:project-details | Detail tabs, sharing and enquiries |
| website:gallery | Gallery viewing |
| website:landowner-account | Land submission and status tracking |
| website:investor-profile | Investor profile functionality |
| investment:express-interest | Interest submission and tracking |
| auth:registration | Public registration |
| auth:login | Login |
| auth:recovery | Account recovery instructions |
| contact:email-location | Published email and country |
| contact:enquiry-process | Contact form |
| contact:instagram | Published Instagram link |
| careers:browsing | Careers browsing functionality |
| careers:application | Application process |
| service:farm-stay | Farm stay development |
| service:project-development | Project development services |
| service:investor-facilitation | Investor facilitation |
| service:relationship-management | Public CRM service description |
| service:farm-activities | Farm activities |
| service:nature-activities | Nature activities |
| service:wellness-activities | Wellness activities |
| service:food-experiences | Food experiences |

## Routing and conversation behavior

- Added `KNOWLEDGE_CENTER` and `PLATFORM_FEATURES`. Existing `ABOUT_SERVICES` covers the website overview, so a separate `WEBSITE_INFO` intent was unnecessary.
- Company answers still require public database retrieval, semantic evidence selection and a grounded answer. Supplemental retrieval uses the same synced collection, never unsynced constants.
- Up to six previous user questions are passed as untrusted topic context. Assistant replies are not submitted as evidence. The controller rejects oversized or malformed history.
- Unrelated questions receive a scope message. Related general tourism education remains supported.
- Missing evidence does not imply there are no jobs, projects or investment opportunities.

## Information deliberately excluded

- The placeholder telephone number and the YouTube channel explicitly marked as a placeholder.
- Owner/founder identity, pricing, training schedules, course details and fees: no verified public source was found.
- Full Knowledge Center articles, downloadable guides or certification claims: the page contains six topic cards and says detailed articles will be published soon.
- Named current projects, vacancies, investment terms and guaranteed returns were not fabricated from static page descriptions. Existing project retrieval remains separate from service descriptions.
- A working project status-filter claim: the frontend displays that control, but the public controller does not forward its status parameter.
- Public project document downloads: the detail page currently displays a no-public-documents message.
- Automatic password-reset email delivery: the UI only says a reset link has been generated and refers users to support.
- Credentials, seed administrator identity, environment values, private financial/account data, internal notes and proposed roadmap features.

## Files changed for this task

- `src/modules/chatbot/publicKnowledge/publicKnowledge.data.ts`
- `src/modules/chatbot/chatbot.intent.ts`
- `src/modules/chatbot/chatbot.evidence.ts`
- `src/modules/chatbot/chatbot.fallback.ts`
- `src/modules/chatbot/chatbot.service.ts`
- `src/modules/chatbot/chatbot.controller.ts`
- `src/modules/chatbot/retrieval/retrieval.service.ts`
- `src/scripts/testRetrieval.ts`
- `src/test/chatbot.test.ts`
- `src/test/chatbot.knowledge.test.ts`
- `../frontend/src/components/chatbot/PublicChatbot.tsx`
- `../frontend/src/services/chatbotService.ts`
- `PUBLIC_KNOWLEDGE_AUDIT.md`

Pre-existing changes in chatbot files were preserved. `src/server.ts` and the existing untracked `chatbot.response.ts` were not changed by this task.

## Validation

- Backend `npm run build`: passed.
- Frontend `npm run build`: passed; Vite reported its bundle-size advisory.
- `npx vitest run src/test/chatbot.test.ts`: 130 passed.
- `npx vitest run src/test/chatbot.knowledge.test.ts`: 35 passed.
- `npm test`: 172 passed across three files.
- `npm run rag:sync-public`: successfully synced 41 records.
- `npm run rag:test-retrieval`: passed; 41 records matched the dataset, zero missing or outdated. All 11 topic/service checks and the project-only evidence check passed. No project evidence was returned.

Unit tests mock classification and generation; live retrieval checks exercise the configured embedding/database path. These checks do not claim exhaustive live-model answer accuracy.
