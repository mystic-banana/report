#!/bin/bash

# Script to apply schema changes to the Supabase database

# Supabase project details (replace with your actual project ID if different)
SUPABASE_PROJECT_ID="tbpnsxwldrxdlirxfcor"
DB_USER="postgres"
DB_PASSWORD="@Oops123!!" # From memory
DB_HOST="db.${SUPABASE_PROJECT_ID}.supabase.co"
DB_NAME="postgres"

# Path to the SQL file with schema updates
SQL_FILE_PATH="$(dirname "$0")/schema_updates.sql"

# Check if SQL file exists
if [ ! -f "$SQL_FILE_PATH" ]; then
    echo "Error: SQL file not found at $SQL_FILE_PATH"_FILE_PATH
    exit 1
fi

echo "Attempting to apply schema changes from $SQL_FILE_PATH to database $DB_NAME on $DB_HOST..."

# Export password to avoid psql prompt (ensure PGPASSWORD is used by psql)
export PGPASSWORD=$DB_PASSWORD

# Execute the SQL file
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -p 5432 -a -f "$SQL_FILE_PATH"

# Unset the password
unset PGPASSWORD

echo "Schema update process finished."
# Check the output above for any errors from psql.
