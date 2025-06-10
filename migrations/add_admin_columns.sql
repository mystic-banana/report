-- Migration to add missing columns to the podcasts table
-- These columns are needed for the admin approval system

-- Add status column with a default value of 'pending'
ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add admin_comments column
ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS admin_comments TEXT;

-- Add submitter_id column (optional, can be null)
ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS submitter_id UUID REFERENCES auth.users(id) NULL;
