-- Clean slate: drop existing objects that may reference the old enum
DROP TABLE IF EXISTS "profiles" CASCADE;
DROP TABLE IF EXISTS "completed_enrollments" CASCADE;
DROP TYPE IF EXISTS "profile_visibility" CASCADE;

-- Create tables
CREATE TABLE "completed_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet" text NOT NULL,
	"course_id" text NOT NULL,
	"completed_at" timestamp with time zone NOT NULL,
	"credential_asset" text,
	"track_id" integer NOT NULL,
	"track_level" integer NOT NULL
);

CREATE TABLE "profiles" (
	"wallet" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"display_name" text,
	"bio" text,
	"avatar_url" text,
	"social_links" text,
	"join_date" timestamp with time zone NOT NULL,
	"visibility" text DEFAULT 'public' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);
