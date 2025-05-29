#!/bin/bash

# Supabase connection details
DB_HOST="db.tbpnsxwldrxdlirxfcor.supabase.co"
DB_PORT="5432"
DB_USER="postgres"
DB_NAME="postgres"
export PGPASSWORD='@Oops123!!'

# Get all policies on auth.users
psql -X -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\n-- Policies on auth.users\nSELECT * FROM pg_policies WHERE tablename = 'users' AND schemaname = 'auth';\n"

# List tables in public and auth schema
psql -X -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt public.*"
psql -X -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt auth.*"

# If profiles table exists, check its RLS and policies
psql -X -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\n-- RLS on public.profiles\nSELECT relname, relrowsecurity FROM pg_class WHERE relname = 'profiles' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');\n"
psql -X -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\n-- Policies on public.profiles\nSELECT * FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public';\n"

# Show first 5 users and their emails
psql -X -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT id, email, role FROM auth.users LIMIT 5;"

unset PGPASSWORD
