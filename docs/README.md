# Church Management App - Documentation Hub

Welcome to the Church Management SaaS Platform documentation. This is your entry point to all project information, guides, and resources.

**Last Updated:** 8 November 2025

---

## 📋 Quick Navigation

### 🎯 **Getting Started**
- **[SETUP.md](./SETUP.md)** - Development environment setup and installation
- **[DEMO.md](./DEMO.md)** - Demo data and testing the application
- **[USER_MANUAL.md](./USER_MANUAL.md)** - End-user guide for church members and administrators

### 📊 **Project Overview**
- **[PRD.md](./PRD.md)** - Product Requirements Document (high-level overview)
- **[source-of-truth/BUSINESS_REQUIREMENTS.md](./source-of-truth/BUSINESS_REQUIREMENTS.md)** - Detailed business context and goals
- **[source-of-truth/FUNCTIONAL_REQUIREMENTS.md](./source-of-truth/FUNCTIONAL_REQUIREMENTS.md)** - Complete feature specifications

### 👥 **Personas & Use Cases**
- **[source-of-truth/personas/](./source-of-truth/personas/)** - User personas and role definitions
  - Church Administrator, Church Leaders, Members, Trustees, and more

---

## 📁 **Directory Structure**

```
docs/
├── 📖 ROOT DOCUMENTATION (Primary Navigation)
│   ├── README.md (THIS FILE - Documentation hub)
│   ├── PRD.md (Product Requirements overview)
│   │
│   ├── 📋 TASK TRACKING (Work Management)
│   ├── TASKS.md (⚡ Current sprints in progress)
│   ├── TASKS_COMPLETED.md (✅ Historical record of shipped work)
│   ├── TASKS_BACKLOG.md (📌 Next 1-3 months of planned work)
│   ├── TASKS_FUTURE.md (🔮 Post-MVP roadmap, 3+ months out)
│   │
│   ├── 👥 USER GUIDES
│   ├── USER_MANUAL.md (End-user guide for church members & admins)
│   ├── SETUP.md (Developer setup and installation)
│   └── DEMO.md (Demo data and testing scenarios)
│
├── 🛠️ DEVELOPER GUIDES (guides/)
│   ├── CODING_STANDARDS.md (Code style, patterns, and best practices)
│   ├── DESIGN_SYSTEM.md (UI components, design tokens, visual language)
│   ├── TECH_STACK.md (Complete technology choices and dependencies)
│   ├── FLOWBITE_MIGRATION.md (Migration guide from Radix UI to Flowbite)
│   ├── NAVIGATION.md (Application routing and page structure)
│   └── README.md (Index of all developer resources)
│
├── 📚 SOURCE-OF-TRUTH (source-of-truth/)
│   ├── README.md (Authoritative documentation overview)
│   ├── ARCHITECTURE.md (System design and component architecture)
│   ├── DATABASE_SCHEMA.md (Database tables, relationships, and fields)
│   ├── API_DOCUMENTATION.md (REST API endpoints and schemas)
│   ├── API_REFERENCE.md (Quick reference for API endpoints)
│   ├── BUSINESS_REQUIREMENTS.md (Business case and goals)
│   ├── FUNCTIONAL_REQUIREMENTS.md (Detailed feature specifications)
│   └── personas/ (User personas and role definitions)
│
├── 🚀 OBSERVABILITY (observability/)
│   ├── README.md (Observability architecture and setup guide)
│   ├── OBSERVABILITY_ARCHITECTURE.md (Complete system design)
│   ├── OBSERVABILITY_INTEGRATION_EXAMPLES.md (Code examples for instrumentation)
│   ├── OBSERVABILITY_METRICS_REFERENCE.md (Metrics catalog and definitions)
│   ├── OBSERVABILITY_PERFORMANCE.md (Performance optimization guide)
│   ├── OBSERVABILITY_PRODUCTION_SETUP.md (Production deployment guide)
│   └── SPAN_TRACING_GUIDE.md (Distributed tracing patterns)
│
├── 📋 SPRINT ARCHIVE (sprints/)
│   ├── README.md (Index of all completed and current sprints)
│   ├── soft-delete/ (Soft delete implementation)
│   ├── ui-enhancement/ (UI/UX design system enhancement)
│   ├── user-theme-preferences/ (User theme customization)
│   ├── user-preferences-enhancement/ (User settings and preferences)
│   └── [other sprint folders]
│
├── 🎨 COMPONENT PREVIEW (component-theme-preview/)
│   └── index.html (Visual component showcase for QA testing)
│
└── 🗂️ ARCHIVED DOCS (archive/)
    ├── WIREFRAME_PROMPT.md (Deprecated: AI wireframe generation prompt)
    └── [other deprecated items]
```

---

## 🗺️ **How to Use This Documentation**

### **I'm a...**

#### **👨‍💼 Product Manager**
1. Start with [PRD.md](./PRD.md)
2. Review [source-of-truth/BUSINESS_REQUIREMENTS.md](./source-of-truth/BUSINESS_REQUIREMENTS.md)
3. Check [TASKS.md](./TASKS.md), [TASKS_BACKLOG.md](./TASKS_BACKLOG.md), [TASKS_FUTURE.md](./TASKS_FUTURE.md) for roadmap
4. Reference [source-of-truth/personas/](./source-of-truth/personas/) for user context

#### **💻 Backend Engineer**
1. Read [guides/TECH_STACK.md](./guides/TECH_STACK.md) for dependencies
2. Review [source-of-truth/ARCHITECTURE.md](./source-of-truth/ARCHITECTURE.md) for system design
3. Study [guides/CODING_STANDARDS.md](./guides/CODING_STANDARDS.md) for code patterns
4. Check [source-of-truth/DATABASE_SCHEMA.md](./source-of-truth/DATABASE_SCHEMA.md) for data model
5. Reference [source-of-truth/API_DOCUMENTATION.md](./source-of-truth/API_DOCUMENTATION.md) for endpoints
6. Follow [SETUP.md](./SETUP.md) to get your environment running
7. Check [guides/README.md](./guides/README.md) for developer guides index

#### **🎨 Frontend Engineer**
1. Read [guides/TECH_STACK.md](./guides/TECH_STACK.md) for frontend stack
2. Study [guides/DESIGN_SYSTEM.md](./guides/DESIGN_SYSTEM.md) for UI components and tokens
3. Follow [guides/CODING_STANDARDS.md](./guides/CODING_STANDARDS.md) for TypeScript and React patterns
4. Check [source-of-truth/ARCHITECTURE.md](./source-of-truth/ARCHITECTURE.md) Section 2.3 for UI architecture
5. View [component-theme-preview/index.html](./component-theme-preview/index.html) for visual reference
6. Reference [SETUP.md](./SETUP.md) to set up development environment
7. Check [guides/README.md](./guides/README.md) for frontend-specific guides

#### **🎯 Designer / Design Systems**
1. Review [guides/DESIGN_SYSTEM.md](./guides/DESIGN_SYSTEM.md) for complete design language
2. Check [guides/FLOWBITE_MIGRATION.md](./guides/FLOWBITE_MIGRATION.md) for component library
3. View [component-theme-preview/index.html](./component-theme-preview/index.html) for visual audit
4. Reference [source-of-truth/ARCHITECTURE.md](./source-of-truth/ARCHITECTURE.md) Section 2.3 for technical constraints
5. Check [guides/README.md](./guides/README.md) for design system resources

#### **👤 End User / Church Administrator**
1. Start with [USER_MANUAL.md](./USER_MANUAL.md) - step-by-step user guide
2. Check [DEMO.md](./DEMO.md) for demo scenarios and testing data
3. Reference [source-of-truth/personas/](./source-of-truth/personas/) to understand your role

#### **🔍 DevOps / Infrastructure**
1. Read [guides/TECH_STACK.md](./guides/TECH_STACK.md) for stack overview
2. Review [source-of-truth/ARCHITECTURE.md](./source-of-truth/ARCHITECTURE.md) for deployment architecture
3. Study [observability/README.md](./observability/README.md) for monitoring and observability
4. Check [observability/OBSERVABILITY_PRODUCTION_SETUP.md](./observability/OBSERVABILITY_PRODUCTION_SETUP.md) for deployment
5. Reference [SETUP.md](./SETUP.md) for local infrastructure setup

---

## 🔑 **Key Documents by Purpose**

### **Understanding the System**
- **Quick Overview:** [PRD.md](./PRD.md) (5 min read)
- **Deep Dive:** [source-of-truth/ARCHITECTURE.md](./source-of-truth/ARCHITECTURE.md) (20 min read)
- **Business Context:** [source-of-truth/BUSINESS_REQUIREMENTS.md](./source-of-truth/BUSINESS_REQUIREMENTS.md) (15 min read)

### **Building Features**
- **Code Patterns:** [guides/CODING_STANDARDS.md](./guides/CODING_STANDARDS.md) (mandatory read)
- **System Design:** [source-of-truth/ARCHITECTURE.md](./source-of-truth/ARCHITECTURE.md) (reference)
- **Data Model:** [source-of-truth/DATABASE_SCHEMA.md](./source-of-truth/DATABASE_SCHEMA.md) (reference)
- **API Specs:** [source-of-truth/API_DOCUMENTATION.md](./source-of-truth/API_DOCUMENTATION.md) (reference)

### **UI/Component Development**
- **Design System:** [guides/DESIGN_SYSTEM.md](./guides/DESIGN_SYSTEM.md) (authoritative)
- **Components:** [component-theme-preview/index.html](./component-theme-preview/index.html) (visual reference)
- **Styling Guide:** [guides/CODING_STANDARDS.md](./guides/CODING_STANDARDS.md) Section 5.6 (reference)

### **Getting Started**
- **Setup:** [SETUP.md](./SETUP.md) (step-by-step guide)
- **Tech Stack:** [guides/TECH_STACK.md](./guides/TECH_STACK.md) (understanding dependencies)
- **Demo:** [DEMO.md](./DEMO.md) (testing the app)

### **Project Planning**
- **Current Work:** [TASKS.md](./TASKS.md) (active sprints)
- **Next Steps:** [TASKS_BACKLOG.md](./TASKS_BACKLOG.md) (1-3 months)
- **Roadmap:** [TASKS_FUTURE.md](./TASKS_FUTURE.md) (3+ months)
- **Sprint Archive:** [sprints/README.md](./sprints/README.md) (historical reference)

### **Monitoring & Operations**
- **Observability:** [observability/README.md](./observability/README.md) (overview)
- **Production Setup:** [observability/OBSERVABILITY_PRODUCTION_SETUP.md](./observability/OBSERVABILITY_PRODUCTION_SETUP.md) (deployment)
- **Metrics:** [observability/OBSERVABILITY_METRICS_REFERENCE.md](./observability/OBSERVABILITY_METRICS_REFERENCE.md) (metrics catalog)

---

## 🔄 **Documentation Governance**

### **Authoritativeness Hierarchy**
1. **Source-of-Truth** (`source-of-truth/`) - System design, database schema, architecture decisions
2. **Developer Guides** (`guides/`) - Coding standards, design system, best practices
3. **Task Tracking** (TASKS*.md) - Work planning and project status
4. **User Documentation** (USER_MANUAL.md) - End-user guidance

### **Maintenance**
- **Architecture decisions:** Update `source-of-truth/ARCHITECTURE.md` and ADRs
- **Code patterns:** Update `guides/CODING_STANDARDS.md`
- **Design tokens:** Update `guides/DESIGN_SYSTEM.md` and `source-of-truth/ARCHITECTURE.md` Section 2.3
- **Database schema:** Update `source-of-truth/DATABASE_SCHEMA.md` when Prisma schema changes
- **API changes:** Update `source-of-truth/API_DOCUMENTATION.md` and `API_REFERENCE.md`
- **Current work:** Update TASKS.md weekly; move completed items to TASKS_COMPLETED.md

### **Last Update Tracking**
Documentation is updated during sprint work. Timestamp on this file reflects last reorganization.

---

## 📞 **Need Help?**

- **General Questions:** Check this README first
- **Setup Issues:** See [SETUP.md](./SETUP.md)
- **Code Standards:** See [guides/CODING_STANDARDS.md](./guides/CODING_STANDARDS.md)
- **System Design:** See [source-of-truth/ARCHITECTURE.md](./source-of-truth/ARCHITECTURE.md)
- **Current Work:** See [TASKS.md](./TASKS.md)

---

## 📊 **Documentation Statistics**

- **Total Documents:** 30+ markdown files
- **Total Lines:** 5,000+ lines of documentation
- **Coverage Areas:** Requirements, Architecture, Code Standards, Design System, Observability, Task Tracking
- **Last Audit:** 8 November 2025

---

**Navigation:**
[← Back to Root](../) | [Go to SETUP →](./SETUP.md) | [Go to PRD →](./PRD.md)
