# Persona: Super Admin

## Overview
- Owns the multi-tenant SaaS platform, acting as the vendor or corporate operator.
- Oversees tenant provisioning, contractual obligations, billing, security posture, and overall platform health.
- Engages episodically but must have high-authority controls and observability at all times.

## Primary Goals
- Ensure every church tenant is onboarded smoothly with correct configuration, branding, and billing alignment.
- Maintain uptime, reliability, and regulatory compliance across all tenants.
- Detect and resolve platform-wide incidents before they impact individual churches.
- Track commercial performance (usage, plan adherence, renewals) to support business growth.

## Key Responsibilities
- Approve and provision new church tenants, including assigning default roles and modules.
- Manage subscription plans, invoicing, entitlements, and lifecycle events (trial, upgrade, cancellation).
- Monitor global metrics (uptime, error rates, request volume) and security events.
- Coordinate incident response and communicate status updates to tenant administrators.

## Pain Points
- Lack of a consolidated platform dashboard forces manual reporting from disparate tools.
- Limited ability to differentiate feature availability per tenant, creating support churn.
- No structured workflow for suspending or decommissioning tenants while preserving data for compliance.
- Difficulty auditing cross-tenant actions without a global audit log and immutable trail.

## Core Journeys
1. **Provision New Tenant:** Receive sales handoff → configure tenant settings (plan, modules, base roles) → invite church app admin → confirm successful onboarding.
2. **Monitor Platform Health:** Review daily health dashboard → investigate anomalies → coordinate fixes → notify impacted tenants.
3. **Handle Billing Exceptions:** Identify overdue payments → place tenant on grace period → notify admins → escalate to suspension if unresolved.
4. **Enforce Compliance:** Review data protection controls → generate compliance report → share with stakeholders and trustees as needed.

## Feature Requirements
- Super-admin console with tenant list, plan, usage metrics, and lifecycle status.
- Automation for provisioning, cloning defaults, and disabling tenants.
- Billing integration (manual or third-party) to manage invoices, payments, and receipts.
- Cross-tenant observability dashboards: uptime, API error rates, message queue backlogs.
- Incident management tools (runbooks, status page updates, communication templates).
- Global audit log covering super-admin actions and tenant-level escalations.

## Data & Permissions
- Requires read/write access to every tenant’s metadata, billing info, and configuration.
- Needs read-only insight into tenant activity metrics but not necessarily raw sensitive member data.
- Must be able to impersonate or temporarily access tenant admin views for troubleshooting with explicit logging.
- Requires API keys/credentials management for third-party integrations at platform scope.

## Success Metrics
- Time-to-provision new tenant stays within defined SLA (e.g., < 1 business day).
- Platform uptime, incident response time, and MTTR meet contractual targets.
- Billing error rate and delinquent accounts remain below predefined thresholds.
- Compliance audits pass without major findings; audit trails are complete and accessible.

## Open Questions & Follow-Ups
- What billing provider or system is in scope? (Determines automation depth and data sync cadence.)
- Do super admins manage feature flags and experiments per tenant?
- How should impersonation be logged and approved to balance support efficiency and privacy?
- Are there regulatory requirements (e.g., GDPR, SOC 2) driving additional controls not yet captured?
