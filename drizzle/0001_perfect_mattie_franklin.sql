CREATE TABLE "affiliate_links" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"operator_id" text NOT NULL,
	"affiliate_url" text NOT NULL,
	"active" boolean NOT NULL
);
