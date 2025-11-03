```markdown
# Persona: Administrator

## Description
Oversees the entire church management system, manages users, configures settings, and ensures the platform runs securely and smoothly for the church.

## Responsibilities
- Manage user accounts, roles, and permissions
- Configure church-wide settings (localization, timezones, defaults)
- Maintain audit logs and compliance settings
- Manage integrations and third-party connections (payment providers, auth)
- Oversee backups, data exports, and retention policies

## Access / Permissions
- Full admin access to the church tenant
- Ability to view and export audit logs
- Access to integration configuration and environment flags

## Example Prompts
- "Add this volunteer user and assign the Group Leader role."
- "Export giving history for Q3 for auditing."
- "Rotate the API keys for the payment provider."

## Edge Cases / Notes
- Admin actions should be audited and require confirmation for destructive tasks
- Consider soft-delete vs hard-delete policies for user data

## Success Criteria
- Admin can perform tenant-level management without support intervention
- All admin actions are logged and reversible when appropriate

```# Persona: Administrator

## Description
Oversees the entire church management system, manages users, and configures settings.

## Typical Actions
- Add or remove users
- Assign roles and permissions
- Configure church-wide settings
- Access audit logs
