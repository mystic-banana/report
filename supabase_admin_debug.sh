#!/bin/bash

# Supabase connection details
DB_HOST="db.tbpnsxwldrxdlirxfcor.supabase.co"
DB_PORT=5432
DB_USER="postgres"
DB_NAME="postgres"
export PGPASSWORD='@Oops123!!'

# 1. Print all policies on public.profiles and auth.users
echo "\n--- POLICIES ON public.profiles ---"
psql -X -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT * FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public';"

echo "\n--- POLICIES ON auth.users ---"
psql -X -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT * FROM pg_policies WHERE tablename = 'users' AND schemaname = 'auth';"

# 2. Print structure of public.profiles
echo "\n--- STRUCTURE OF public.profiles ---"
psql -X -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\d+ public.profiles"

# 3. Print first 5 rows of public.profiles
echo "\n--- FIRST 5 ROWS OF public.profiles ---"
psql -X -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT * FROM public.profiles LIMIT 5;"

# 4. Print RLS status on public.profiles and auth.users
echo "\n--- RLS STATUS ON public.profiles ---"
psql -X -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'profiles' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');"

echo "\n--- RLS STATUS ON auth.users ---"
psql -X -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth');"

# 5. List edge functions
echo "\n--- SUPABASE EDGE FUNCTIONS (if any) ---"
# This requires supabase CLI, so we'll skip if not available
if command -v supabase &> /dev/null; then
  supabase functions list
else
  echo "Supabase CLI not installed, skipping edge function list."
fi

unset PGPASSWORD
