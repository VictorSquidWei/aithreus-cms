CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"ts" text NOT NULL,
	"actor_id" text NOT NULL,
	"actor_name" text NOT NULL,
	"action" text NOT NULL,
	"summary" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "changelog" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"date" text NOT NULL,
	"version" text NOT NULL,
	"notes" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"config_id" text NOT NULL,
	"site_id" text NOT NULL,
	"widget_instance_id" text NOT NULL,
	"operator_id" text NOT NULL,
	"vertical_id" text NOT NULL,
	"ts" text NOT NULL,
	"anon_id" text NOT NULL,
	"ua" text,
	"referer" text,
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE "link_overrides" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"widget_instance_id" text NOT NULL,
	"operator_id" text NOT NULL,
	"affiliate_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"summary" text NOT NULL,
	"category" text NOT NULL,
	"detail" text NOT NULL,
	"internal_only" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operators" (
	"id" text PRIMARY KEY NOT NULL,
	"vertical_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"button_label" text NOT NULL,
	"brand_color" text NOT NULL,
	"affiliate_url" text NOT NULL,
	"active" boolean NOT NULL,
	"category" text NOT NULL,
	"role" text NOT NULL,
	"auth_type" text NOT NULL,
	"integration_status" text NOT NULL,
	"internal_only" boolean NOT NULL,
	"est_payout" real,
	"logo_asset_id" text
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"blocks" text NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"vertical_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" text NOT NULL,
	"executes" boolean NOT NULL,
	"holds_funds" boolean NOT NULL,
	"holds_credentials" boolean NOT NULL,
	"tagline" text NOT NULL,
	"what_it_does" text NOT NULL,
	"status" text NOT NULL,
	"hero_asset_id" text
);
--> statement-breakpoint
CREATE TABLE "published_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"config_id" text NOT NULL,
	"vertical_key" text NOT NULL,
	"payload" jsonb NOT NULL,
	"targets" jsonb NOT NULL,
	"version" integer NOT NULL,
	"published_by_user_id" text NOT NULL,
	"published_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"vertical_id" text NOT NULL,
	"domain" text NOT NULL,
	"status" text NOT NULL,
	"config_id" text NOT NULL,
	"last_published_at" text,
	CONSTRAINT "sites_config_id_unique" UNIQUE("config_id")
);
--> statement-breakpoint
CREATE TABLE "status_feed" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"metric_key" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategies" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"venue" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tiers" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"feature_flags" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verticals" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"domain" text NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "widget_instances" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"widget_type_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "widget_types" (
	"id" text PRIMARY KEY NOT NULL,
	"vertical_id" text NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"cta_mode" text NOT NULL,
	"cta_rendering" text NOT NULL,
	"sample_data_json" jsonb,
	"thumbnail_asset_id" text
);
