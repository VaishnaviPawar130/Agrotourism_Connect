# Chatbot runtime verification

Backend: http://localhost:5002/api/v1/chat
Model: openrouter/free
MongoDB: agrotourism_connect; 41 public records.

All six HTTP requests returned 200. OpenRouter returned 429 at classification, selection and generation (including SDK retries). Each answer therefore used deterministic intent recovery, live RAG retrieval, intent-safe evidence filtering and extractive generation fallback. No database records were changed. The temporary verification server was stopped.

Validation: npm run build passed; npm test passed (209 tests); npm run rag:test-retrieval passed (41 synced records, zero missing/outdated).

## What is this project about?

Intent: ABOUT_SERVICES
Evidence selection: deterministic fallback
HTTP status: 200

Retrieved records:

- About Agrotourism Connect (company:overview)
- Agrotourism Connect — Core Services (service:core-services)
- Land Development (service:land-development)
- Project Development Services (service:project-development)
- Development Support (service:development-support)

Selected records:

- About Agrotourism Connect (company:overview)
- Agrotourism Connect — Core Services (service:core-services)
- Land Development (service:land-development)
- Project Development Services (service:project-development)
- Development Support (service:development-support)

Exact final response:

Agrotourism Connect is a platform for the complete journey of turning land into a tourism asset, from land submission through feasibility, planning, investment, development and tourism operations. It brings together landowners, investors, agro tourism developers, resort operators, tourism consultants, farmers and service providers to track progress and collaborate.

Agrotourism Connect focuses on tourism development through Land Development, Resort Development and Agro Tourism. Its core services include Land Advisory, Project Planning, Approvals & Legal, Development Support, Marketing & Sales, and Operations Support. Project planning includes feasibility studies, DPR, concept planning and designing.

Agrotourism Connect helps owners of agricultural or open land with tourism potential submit land details, location and infrastructure information, upload photos, videos and land documents, and track review status through development. Landowners can connect with investors and developers once their project is ready.

## How can I contact you?

Intent: CONTACT
Evidence selection: deterministic fallback
HTTP status: 200

Retrieved records:

- Contact Agrotourism Connect (contact:website-form)
- Public Email and Location (contact:email-location)
- Sending an Enquiry (contact:enquiry-process)
- Instagram (contact:instagram)
- About Agrotourism Connect (company:overview)

Selected records:

- Contact Agrotourism Connect (contact:website-form)
- Public Email and Location (contact:email-location)
- Sending an Enquiry (contact:enquiry-process)
- Instagram (contact:instagram)

Exact final response:

For land, investment, partnership or tourism development enquiries, users can contact Agrotourism Connect through the contact form on the website.

The Contact page lists info@agrotourismconnect.com as the public email address for Agrotourism Connect and gives its location as India. It also provides a contact form for enquiries.

At /contact, the Send Us a Message form asks for full name, mobile, email, city, requirement and message. Requirement examples include land acquisition, investment, partnership and resort development. Submit using Send Message; successful submission displays an acknowledgement that the enquiry was received.

## How do I register here?

Intent: LOGIN_AUTH
Evidence selection: deterministic fallback
HTTP status: 200

Retrieved records:

- How to Register (auth:registration)
- Login and Account Access (auth:login)
- Forgot Password (auth:recovery)
- About Agrotourism Connect (company:overview)
- Contact Agrotourism Connect (contact:website-form)

Selected records:

- How to Register (auth:registration)
- Login and Account Access (auth:login)
- Forgot Password (auth:recovery)

Exact final response:

Open /register or choose a registration link such as List Your Land or Become an Investor. Provide full name, email, mobile and a password, and choose Landowner or Investor under I am a. City and state are optional. Public self-registration offers Landowner and Investor roles.

Open /login and enter your registered email and password to sign in. The login form includes Forgot password? and an option to switch to registration. Enter account credentials only in the website authentication form, not in the chatbot.

Choose Forgot password? on the login form or open /forgot-password and submit your email. The form says that if the email exists, a password reset link has been generated, and advises contacting support for help completing the reset. It does not promise email delivery.

## How can I invest here?

Intent: INVESTMENT
Evidence selection: deterministic fallback
HTTP status: 200

Retrieved records:

- Expressing Investment Interest (investment:express-interest)
- Investment Platform Services (service:investment-platform)
- Investor Facilitation (service:investor-facilitation)
- Contact Agrotourism Connect (contact:website-form)
- About Agrotourism Connect (company:overview)

Selected records:

- Expressing Investment Interest (investment:express-interest)
- Investment Platform Services (service:investment-platform)
- Investor Facilitation (service:investor-facilitation)

Exact final response:

After signing in as an Investor, the dashboard shows Investment Opportunities with published projects and an action to express interest. My Interests lets investors track their submitted interests, including project, action, status and submission date. This describes account features, not a guarantee of available opportunities or returns.

The Agrotourism Connect investment page displays published agro tourism and resort projects for investment discussions and provides registration to express interest. Financial details are shared with registered, authorized investors. Investment structures and returns are not guaranteed and require independent legal and financial due diligence. This describes the platform service; it does not establish that any specific investment opportunity is currently available.

The Services page describes investor facilitation as connecting vetted investors with planned projects. This is a service description, not confirmation of a particular opportunity or financial terms.

## What is Knowledge Center here?

Intent: KNOWLEDGE_CENTER
Evidence selection: deterministic fallback
HTTP status: 200

Retrieved records:

- Knowledge Center (knowledge:center-overview)
- Knowledge Center Topics and Contents (knowledge:center-topics)
- About Agrotourism Connect (company:overview)
- Mission and Vision (company:mission)
- Land Development (service:land-development)

Selected records:

- Knowledge Center (knowledge:center-overview)
- Knowledge Center Topics and Contents (knowledge:center-topics)

Exact final response:

The Knowledge Center at /knowledge-center is the Agrotourism Connect resources section for guides and articles on agro tourism and land development. It currently displays topic cards under Guides & Articles and states: Detailed articles will be published here soon. Full articles and downloadable guides are not provided on this page yet.

The Knowledge Center contains six topic cards: Agro Tourism Basics; Land Development Process; Resort Planning Fundamentals; Understanding Investment Models; Tourism Activity Planning; and Working With Agrotourism Connect. These are displayed topics, not currently published full articles or courses.

## How can I contact someone to invest here?

Intent: CONTACT
Evidence selection: deterministic fallback
HTTP status: 200

Retrieved records:

- Contact Agrotourism Connect (contact:website-form)
- Sending an Enquiry (contact:enquiry-process)
- Public Email and Location (contact:email-location)
- Instagram (contact:instagram)
- About Agrotourism Connect (company:overview)

Selected records:

- Contact Agrotourism Connect (contact:website-form)
- Sending an Enquiry (contact:enquiry-process)
- Public Email and Location (contact:email-location)
- Instagram (contact:instagram)

Exact final response:

For land, investment, partnership or tourism development enquiries, users can contact Agrotourism Connect through the contact form on the website.

At /contact, the Send Us a Message form asks for full name, mobile, email, city, requirement and message. Requirement examples include land acquisition, investment, partnership and resort development. Submit using Send Message; successful submission displays an acknowledgement that the enquiry was received.

The Contact page lists info@agrotourismconnect.com as the public email address for Agrotourism Connect and gives its location as India. It also provides a contact form for enquiries.
