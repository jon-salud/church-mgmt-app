# Developer Guides

Comprehensive guides for developers, designers, and technical leads working on the Church Management Platform.

**Version:** 1.0.0  
**Last Updated:** 8 November 2025

---

## 📖 Available Guides

### 1. **[CODING_STANDARDS.md](./CODING_STANDARDS.md)** (510 lines)
Complete coding standards and best practices for the project.

**Covers:**
- TypeScript strict mode and type safety
- Backend (NestJS) conventions and modular architecture
- Frontend (React) component patterns and hooks
- Testing strategies and patterns
- Git workflow and commit messages
- Error handling and validation
- Performance optimization guidelines
- Security best practices (authentication, authorization, input validation)
- Accessibility (WCAG 2.1 AA compliance)
- UI component guidelines and styling

**For:** All engineers, mandatory read before contributing code

**Time to read:** 20-30 minutes

---

### 2. **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** (1,223 lines)
Complete design system documentation with design tokens, components, and patterns.

**Covers:**
- Design philosophy and principles
- Color system with semantic tokens (light/dark modes)
- Shadow scale and depth system
- Border radius scale
- Typography scale (10 utility classes)
- Spacing system
- 13+ Flowbite wrapper components
- Accessibility implementation (WCAG 2.1 AA)
- Page-level patterns and layouts
- Dark mode implementation
- Migration guide from Radix UI to Flowbite

**For:** Frontend engineers, designers, UI QA  
**Key File:** `web/app/globals.css` (authoritative source for design tokens)

**Time to read:** 45-60 minutes

---

### 3. **[TECH_STACK.md](./TECH_STACK.md)** (410 lines)
Complete technology stack documentation with all dependencies, versions, and justifications.

**Covers:**
- Architecture overview (monorepo with pnpm)
- Backend stack (NestJS, Fastify, Prisma, PostgreSQL)
- Frontend stack (Next.js 14, React, Tailwind CSS)
- Database and ORM choices
- Authentication and authorization (Passport.js, OAuth 2.0, PKCE)
- Testing frameworks (Vitest, Playwright)
- Monitoring and observability (OpenTelemetry)
- Deployment and CI/CD tools
- Development tools and utilities

**For:** Architects, backend engineers, DevOps engineers, new team members

**Time to read:** 25-40 minutes

---

### 4. **[FLOWBITE_MIGRATION.md](./FLOWBITE_MIGRATION.md)**
Migration guide for transitioning from Radix UI to Flowbite React components.

**Covers:**
- Why Flowbite (design consistency, accessibility, theme support)
- Component mapping from Radix UI to Flowbite
- Styling approach with Tailwind CSS
- Custom wrapper components in `web/components/ui-flowbite/`
- Migration checklist and best practices
- Troubleshooting common issues

**For:** Frontend engineers working with UI components

**Time to read:** 15-20 minutes

---

### 5. **[NAVIGATION.md](./NAVIGATION.md)**
Application routing and page structure reference.

**Covers:**
- Main navigation structure
- Route hierarchy and organization
- Protected vs. public routes
- Role-based access control (RBAC) routing
- Page naming conventions
- URL patterns and query parameters

**For:** Frontend engineers, product managers, QA

**Time to read:** 10-15 minutes

---

## 🎯 Quick Reference

### **By Role**

#### **Backend Engineer**
1. Read: [CODING_STANDARDS.md](./CODING_STANDARDS.md) (Sections 4-5)
2. Read: [TECH_STACK.md](./TECH_STACK.md) (Sections 2-4)
3. Reference: [../source-of-truth/ARCHITECTURE.md](../source-of-truth/ARCHITECTURE.md)
4. Reference: [../source-of-truth/DATABASE_SCHEMA.md](../source-of-truth/DATABASE_SCHEMA.md)

#### **Frontend Engineer**
1. Read: [CODING_STANDARDS.md](./CODING_STANDARDS.md) (Sections 3, 5)
2. Read: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) (all sections)
3. Read: [TECH_STACK.md](./TECH_STACK.md) (Frontend stack section)
4. Reference: [NAVIGATION.md](./NAVIGATION.md)
5. Reference: [FLOWBITE_MIGRATION.md](./FLOWBITE_MIGRATION.md)

#### **Designer / Design System Lead**
1. Read: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) (all sections)
2. Reference: [CODING_STANDARDS.md](./CODING_STANDARDS.md) (Section 5.6 - UI Component Guidelines)
3. Check: `web/app/globals.css` for authoritative design tokens

#### **Architect / Tech Lead**
1. Read: [TECH_STACK.md](./TECH_STACK.md)
2. Read: [CODING_STANDARDS.md](./CODING_STANDARDS.md)
3. Reference: [../source-of-truth/ARCHITECTURE.md](../source-of-truth/ARCHITECTURE.md)

---

## 📋 Standards Checklist

### **Before Writing Code**
- [ ] Read [CODING_STANDARDS.md](./CODING_STANDARDS.md)
- [ ] Review [../source-of-truth/ARCHITECTURE.md](../source-of-truth/ARCHITECTURE.md) for the feature area
- [ ] Check [TECH_STACK.md](./TECH_STACK.md) for relevant dependencies

### **UI Components**
- [ ] Reference [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for design tokens
- [ ] Use Flowbite components (see [FLOWBITE_MIGRATION.md](./FLOWBITE_MIGRATION.md))
- [ ] Check [NAVIGATION.md](./NAVIGATION.md) for routing patterns
- [ ] Verify accessibility (WCAG 2.1 AA)

### **Testing**
- [ ] Follow testing patterns in [CODING_STANDARDS.md](./CODING_STANDARDS.md) Section 6
- [ ] Achieve 80%+ code coverage for new services
- [ ] Add E2E tests for user-facing features

### **Documentation**
- [ ] Update relevant guides if standards change
- [ ] Document public APIs in [../source-of-truth/API_DOCUMENTATION.md](../source-of-truth/API_DOCUMENTATION.md)
- [ ] Update [../source-of-truth/DATABASE_SCHEMA.md](../source-of-truth/DATABASE_SCHEMA.md) for schema changes

---

## 🔄 Keeping Guides Updated

These guides should be updated when:
- Code patterns change significantly
- New technologies are adopted
- Design system tokens change
- Architecture decisions are made

**Update Process:**
1. Update relevant guide file
2. Commit with `chore(docs):` prefix
3. Reference the guide in code review comments

---

## 📞 Questions or Issues?

- **Code style question:** See [CODING_STANDARDS.md](./CODING_STANDARDS.md)
- **Component design question:** See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- **Technology choice question:** See [TECH_STACK.md](./TECH_STACK.md)
- **Architecture question:** See [../source-of-truth/ARCHITECTURE.md](../source-of-truth/ARCHITECTURE.md)

---

**Navigation:**
[← Back to Docs](../README.md) | [Back to Root](..)
