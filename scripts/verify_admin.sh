#!/usr/bin/env bash
set -e
BASE="http://localhost:3000"

# Sessions (encoded as cookie header)
SESSION_ADMIN='oxway_admin_session={"email":"admin@oxway.io","role":"admin"}; Path=/; HttpOnly'
SESSION_EDITOR='oxway_admin_session={"email":"editor@oxway.io","role":"editor"}; Path=/; HttpOnly'

# Helper function
http_code() {
  curl -s -o /dev/null -w "%{http_code}" "$@"
}

# 1️⃣ Unauthenticated requests should return 401
echo "Testing unauthenticated access..."
for ep in products blogposts teammembers gallery navitems joblistings companyinfo homepage sitesettings; do
  CODE=$(http_code "$BASE/api/admin/$ep")
  if [ "$CODE" != "401" ]; then
    echo "FAIL: $ep returned $CODE (expected 401)"
    exit 1
  fi
done
echo "Unauthenticated checks passed."

# 2️⃣ Editor forbidden actions (delete, publish, site settings)
echo "Testing editor forbidden actions..."
CODE=$(http_code -H "Cookie: $SESSION_EDITOR" -X DELETE "$BASE/api/admin/products" -d '{"id":1}')
[ "$CODE" = "403" ] || { echo "FAIL delete product as editor: $CODE"; exit 1; }
CODE=$(http_code -H "Cookie: $SESSION_EDITOR" -X POST "$BASE/api/admin/blogposts" -H "Content-Type: application/json" -d '{"title":"Test","slug":"test","status":"published"}')
[ "$CODE" = "403" ] || { echo "FAIL publish blog as editor: $CODE"; exit 1; }
CODE=$(http_code -H "Cookie: $SESSION_EDITOR" -X PUT "$BASE/api/admin/sitesettings" -H "Content-Type: application/json" -d '{"defaultTheme":"dark"}')
[ "$CODE" = "403" ] || { echo "FAIL edit sitesettings as editor: $CODE"; exit 1; }
echo "Editor forbidden actions passed."

# 3️⃣ Admin successful actions
echo "Testing admin allowed actions..."
CODE=$(http_code -H "Cookie: $SESSION_ADMIN" "$BASE/api/admin/products")
[ "$CODE" = "200" ] || { echo "FAIL admin GET products: $CODE"; exit 1; }
# create a product (draft)
CODE=$(http_code -H "Cookie: $SESSION_ADMIN" -X POST "$BASE/api/admin/products" -H "Content-Type: application/json" -d '{"name":"Demo","slug":"demo","status":"draft"}')
[ "$CODE" = "201" ] || { echo "FAIL admin POST product: $CODE"; exit 1; }
# delete the product (id 1 assumed)
CODE=$(http_code -H "Cookie: $SESSION_ADMIN" -X DELETE "$BASE/api/admin/products" -H "Content-Type: application/json" -d '{"id":1}')
[ "$CODE" = "200" ] || { echo "FAIL admin DELETE product: $CODE"; exit 1; }
echo "Admin actions passed."

# 4️⃣ AuditLog verification (simple count check)
echo "Verifying audit logs..."
ADMIN_LOGS=$(curl -s -H "Cookie: $SESSION_ADMIN" "$BASE/api/admin/auditlogs?model=Product" | jq '. | length')
if [ "$ADMIN_LOGS" -eq 0 ]; then
  echo "FAIL: No audit logs for admin actions"
  exit 1
fi
echo "Audit logs present: $ADMIN_LOGS entries."

echo "All verification tests passed successfully."
