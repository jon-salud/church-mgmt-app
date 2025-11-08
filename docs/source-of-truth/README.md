# Source of Truth Documentation

This folder contains the **authoritative system documentation** for the Church Management Platform. These documents define the "source of truth" for system design, architecture, requirements, and data structure.

**Version:** 1.0.0  
**Last Updated:** 8 November 2025  
**Scope:** System design, architecture, requirements, and data definitions

---

## 📖 Authoritative Documents

### 1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** (317 lines)
**Purpose:** System architecture, component design, and technical decisions.

**Covers:**
- Frontend architecture (web client, admin application)
- Backend architecture (NestJS, service layer, data access)
- UI/Design system architecture (Tailwind CSS, Flowbite, design tokens)
- Database architecture (multi-tenant, schema separation)
- Security architecture (RBAC, authentication, authorization)
- API architecture (REST, error handling, versioning)
- Observability architecture (logging, tracing, metrics)
- Deployment architecture (containerization, multi-region considerations)

**Authoritative For:**
- System-level architectural decisions
- Component interactions and dependencies
- Technology choices at a high level

**Key Sections:**
- Section 2.1: Client Application (`web`)
- Section 2.2: System Administration Application (`admin`)
- Section 2.3: UI/Design System Architecture
- Section 3: Backend Architecture
- Section 4: Database Architecture

**When to Update:**
- Major architectural changes or refactoring
- New systems added (e.g., messaging, notification service)
- Technology stack changes
- Security model changes

**Last Updated:** 6 November 2025

---

### 2. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**
**Purpose:** Complete database schema, relationships, and data definitions.

**Covers:**
- All database tables and their fields
- Data types and constraints
- Relationships (foreign keys, one-to-many, many-to-many)
- Indexes and performance considerations
- Migration strategy and versioning
- Multi-tenant schema separation (system vs. tenant schemas)
- Audit trail fields (createdAt, updatedAt, deletedAt, deletedBy)

**Authoritative For:**
- Database table definitions
- Data types and validation
- Relationships between entities
- Schema migrations

**Synchronizes With:**
- `api/prisma/schema.prisma` (system schema)
- `api/prisma/tenant-schema.prisma` (tenant schema)

**When to Update:**
- New tables or fields added
- Schema migrations applied
- Relationships changed
- Data validation rules updated

---

### 3. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**
**Purpose:** Complete REST API documentation with all endpoints and schemas.

**Covers:**
- All REST API endpoints (GET, POST, PATCH, DELETE, etc.)
- Request and response schemas with field descriptions
- Query parameters and path parameters
- Error responses with status codes and messages
- Authentication and authorization requirements
- Rate limiting and pagination
- Example requests and responses
- Backward compatibility notes

**Authoritative For:**
- API endpoint specifications
- Request/response contracts
- Field definitions and validation rules
- Error handling and status codes

**Synchronizes With:**
- `api/src/modules/*/controller.ts` (endpoint implementations)
- Generated Swagger/OpenAPI documentation

**When to Update:**
- New endpoints added
- Request/response schemas change
- Error handling changes
- Field validations updated

---

### 4. **[API_REFERENCE.md](./API_REFERENCE.md)**
**Purpose:** Quick reference guide for API endpoints (condensed version of API_DOCUMENTATION.md).

**Covers:**
- Endpoint list with methods and paths
- Quick parameter/response summaries
- Status codes reference
- Common error responses
- Authentication requirements
- Rate limiting summary

**Use Case:** Quick lookup when you already know which endpoint you need

**Synchronizes With:**
- `api/src/modules/*/controller.ts` (endpoint implementations)

---

### 5. **[BUSINESS_REQUIREMENTS.md](./BUSINESS_REQUIREMENTS.md)**
**Purpose:** Business context, goals, and requirements that drive the product.

**Covers:**
- Business goals and vision
- User personas and their needs
- Market context and competitive analysis
- Key requirements and priorities
- Success metrics and KPIs
- Constraints and dependencies
- Risk factors and mitigation strategies

**Authoritative For:**
- Business justification for features
- User personas and their needs
- Priorities and trade-offs

**When to Update:**
- Business strategy changes
- New user personas identified
- Market conditions change
- Success metrics change

---

### 6. **[FUNCTIONAL_REQUIREMENTS.md](./FUNCTIONAL_REQUIREMENTS.md)**
**Purpose:** Complete feature specifications and functional requirements.

**Covers:**
- Feature requirements for each module (FR-USERS, FR-EVENTS, FR-GROUPS, etc.)
- Use cases and workflows
- Business rules and validation rules
- Data requirements
- Integration requirements
- User experience expectations
- Accessibility requirements (A11Y)
- Performance requirements

**Authoritative For:**
- Feature specifications
- User workflows
- Business logic and rules
- Acceptance criteria

**References:**
- Each requirement is numbered (e.g., FR-USER-001) for traceability
- Cross-references to personas and business goals

**When to Update:**
- New features planned
- Feature specifications change
- Business rules change
- Performance/accessibility requirements updated

---

### 7. **[personas/](./personas/)** Directory
**Purpose:** User persona definitions and role specifications.

**Contains:**
- `church-administrator.md` - Full-time church admin
- `church-leader.md` - Pastoral leaders and staff
- `church-staff.md` - Administrative staff
- `members.md` - Regular church members
- `household-leaders.md` - Household coordinators
- `non-members.md` - Prospective/external users
- `board-of-trustees.md` - Governance board members
- `non-fulltime-church-leaders.md` - Part-time leaders
- `non-fulltime-coordinators.md` - Volunteer coordinators
- `super-admin.md` - System administrator
- And more...

**Covers per Persona:**
- Name and description
- Goals and needs
- Typical workflows
- Permissions and access levels
- Pain points
- Feature priorities

**Authoritative For:**
- User roles and responsibilities
- Access control requirements
- Feature prioritization by persona
- Workflow design

**When to Update:**
- New user roles identified
- User needs or goals change
- Access requirements updated

---

## 🔄 Synchronization Matrix

| Document | Synchronizes With | Update Trigger |
|----------|-------------------|-----------------|
| ARCHITECTURE.md | System design decisions, ADRs | Major refactoring, new systems |
| DATABASE_SCHEMA.md | Prisma schemas, migrations | Schema changes, new tables |
| API_DOCUMENTATION.md | Controller implementations, Swagger | Endpoint changes |
| API_REFERENCE.md | API_DOCUMENTATION.md | When APIDOC changes |
| BUSINESS_REQUIREMENTS.md | Product strategy, personas | Strategy changes |
| FUNCTIONAL_REQUIREMENTS.md | Feature specifications, tickets | Feature changes |
| personas/ | User research, access control | User needs change |

---

## 🎯 How to Use This Documentation

### **I Need to Understand...**

#### **System Architecture**
→ Read [ARCHITECTURE.md](./ARCHITECTURE.md)

#### **How the Database is Structured**
→ Read [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

#### **What API Endpoints Exist**
→ Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) or [API_REFERENCE.md](./API_REFERENCE.md)

#### **Why We're Building This Feature**
→ Read [BUSINESS_REQUIREMENTS.md](./BUSINESS_REQUIREMENTS.md)

#### **What a Feature Should Do**
→ Read [FUNCTIONAL_REQUIREMENTS.md](./FUNCTIONAL_REQUIREMENTS.md)

#### **What a User Role Can Do**
→ Read [personas/](./personas/)

---

## ✅ Quality Standards

All source-of-truth documents must:
- ✅ Be **authoritative** - single source of truth, not subjective
- ✅ Be **comprehensive** - cover all relevant details
- ✅ Be **accurate** - match actual implementation
- ✅ Be **current** - updated when systems change
- ✅ Be **structured** - organized logically with clear navigation
- ✅ Use **consistent terminology** - same terms used throughout
- ✅ Include **examples** - real examples from the codebase
- ✅ Link to **related docs** - cross-references to other documentation

---

## 🔍 Verification Checklist

When updating these documents:

- [ ] Changes match actual implementation (code, database, API)
- [ ] Cross-references to other docs still valid
- [ ] Terminology consistent with rest of codebase
- [ ] Examples are current and accurate
- [ ] No broken links within documentation
- [ ] Structure and format follow existing patterns
- [ ] Summary/overview updated with changes
- [ ] Last Updated date changed to current date

---

## 📞 Questions?

- **Architecture questions:** See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Database questions:** See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- **API questions:** See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Feature questions:** See [FUNCTIONAL_REQUIREMENTS.md](./FUNCTIONAL_REQUIREMENTS.md)
- **Business context:** See [BUSINESS_REQUIREMENTS.md](./BUSINESS_REQUIREMENTS.md)
- **User role questions:** See [personas/](./personas/)

---

**Navigation:**
[← Back to Docs](../README.md) | [Back to Root](..)
