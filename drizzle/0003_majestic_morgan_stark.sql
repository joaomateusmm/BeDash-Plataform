CREATE TYPE "public"."plan_type" AS ENUM('essential_trial', 'essential', 'professional', 'enterprise');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "plan" SET DATA TYPE "public"."plan_type" USING "plan"::"public"."plan_type";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_in_trial" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "trial_start_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "trial_end_date" timestamp;