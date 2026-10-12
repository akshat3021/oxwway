# Privacy & personal data

The public website sets **no cookies and runs no trackers or analytics**. The only browser storage on public pages is the visitor's theme choice (`localStorage`) and a "boot animation seen" flag (`sessionStorage`). Neither identifies anyone, so a consent banner is generally not required for them (confirm with your legal adviser for your jurisdictions). Fonts are self-hosted (no request to Google).

## Inventory

| Data | Whose | Why | Retention | Where |
|---|---|---|---|---|
| Name, email, message | Contact-form senders | To reply | Until an admin deletes it (hard delete) | `ContactMessage` |
| Name, email, password hash, role | Admin users | Sign-in | Until the account is erased | `User` |
| IP address, user agent | Admin users | Session security | Purged 7 days after expiry/revocation | `Session` |
| Email (attempted), IP | Anyone attempting to sign in | Brute-force defence | 7 days | `LoginAttempt` |
| Actor email, IP, action | Admin users | Accountability | `AUDIT_RETENTION_DAYS` (default 365), via `npm run db:prune` | `AuditLog` |

## Rights

* **Erasure, senders**: Admin → Messages → *Delete* removes the message permanently.
* **Erasure, users**: Admin → Users → *Delete*: the account is deactivated, name/email replaced, sessions revoked, and the email is scrubbed from past audit entries (history is kept without identity).
* **Access/export**: no UI yet. For a subject-access request run, for a given email:
  `SELECT * FROM "ContactMessage" WHERE email = '…';` and
  `SELECT id,email,name,role,"createdAt","lastLoginAt" FROM "User" WHERE email = '…';`
* **Minimisation**: audit entries store field *names*, never contents; logs redact passwords, tokens and cookies.

## Operational notes

* Run `npm run db:prune` daily so retention is actually enforced.
* Backups contain the same personal data: apply the same retention/encryption to them.
* If you add analytics, email, or any third-party script, update this document and the CSP, and add a consent mechanism where required.
