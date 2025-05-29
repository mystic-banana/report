#!/bin/bash

# Supabase connection details
DB_HOST="db.tbpnsxwldrxdlirxfcor.supabase.co"
DB_PORT="5432"
DB_USER="postgres"
DB_NAME="postgres"
# The password will be taken from the PGPASSWORD environment variable

echo "Attempting to connect to Supabase DB: $DB_NAME on $DB_HOST"
echo "Using password from memory: @Oops123!!"

# SQL commands to execute
# We will use a heredoc to pass multiple SQL commands to psql
SQL_COMMANDS=$(cat <<EOF
\\echo '--- Supabase Auth Information ---'
\\echo ''
\\echo '--- Checking auth.users table (first 5 users) ---'
SELECT id, email, role, created_at, last_sign_in_at FROM auth.users LIMIT 5;
\\echo ''
\\echo '--- Checking if RLS is enabled on auth.users ---'
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth');
\\echo ''
\\echo '--- Listing RLS policies on auth.users (if any) ---'
SELECT
    n.nspname AS schema_name,
    c.relname AS table_name,
    pol.polname AS policy_name,
    CASE pol.polcmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE' WHEN '*' THEN 'ALL' END AS command_type,
    pg_get_expr(pol.polqual, pol.polrelid) AS using_expression,
    pg_get_expr(pol.polwithcheck, pol.polrelid) AS check_expression,
    array_to_string(ARRAY(SELECT rolname FROM pg_roles WHERE oid = ANY (pol.polroles)), ', ') AS roles
FROM
    pg_policy pol
JOIN
    pg_class c ON pol.polrelid = c.oid
JOIN
    pg_namespace n ON c.relnamespace = n.oid
WHERE
    c.relname = 'users' AND n.nspname = 'auth';
\\echo ''
\\echo '--- Listing custom roles (excluding default pg_ roles and supabase internal roles) ---'
SELECT rolname FROM pg_roles WHERE rolname NOT LIKE 'pg_%' AND rolname NOT IN ('supabase_storage_admin', 'supabase_functions_admin', 'supabase_admin', 'supabase_auth_admin', 'dashboard_user', 'authenticator', 'service_role', 'anon', 'authenticated', 'postgres');
\\echo ''
\\echo '--- To investigate a specific admin user (replace YOUR_ADMIN_EMAIL@example.com with the actual email): ---'
\\echo "-- SELECT * FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL@example.com';"
\\echo "-- SELECT * FROM auth.identities WHERE user_id = (SELECT id FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL@example.com');"
\\echo ''
\\echo '--- If you have a custom profiles table linked to auth.users (e.g., public.profiles, replace table/schema names if different): ---'
\\echo "-- SELECT p.* FROM public.profiles p JOIN auth.users u ON p.user_id = u.id WHERE u.email = 'YOUR_ADMIN_EMAIL@example.com';"
\\echo "-- Check RLS on public.profiles:"
\\echo "-- SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'profiles' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');"
\\echo "-- List policies on public.profiles (adapt the RLS policy query above, changing table_name and schema_name):"
\\echo ''
\\echo '--- End of Supabase Auth Information ---'
EOF
)

# Execute the psql command
export PGPASSWORD='@Oops123!!'
echo "${SQL_COMMANDS}" | psql -X -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --echo-queries

# Unset PGPASSWORD for security
unset PGPASSWORD

echo ""
echo "Script finished. Review the output above for policy information."
echo "To help fix the admin login issue, please provide more details:"
echo "1. What is the email or ID of the admin user experiencing problems?"
echo "2. What exactly happens when the admin tries to log in? (Any error messages, specific behavior?)"
echo "3. Are there any custom tables involved in storing admin-specific roles or permissions (e.g., a 'profiles' or 'user_roles' table)? If so, what are their names?"
echo "4. When did this issue start, or has it always been present?"
echo "Based on the script output and your answers, we can formulate specific SQL commands or other steps to address the issue."
