CREATE TYPE "public"."nivel_programa" AS ENUM('tecnico', 'bachillerato', 'maestria');--> statement-breakpoint
CREATE TYPE "public"."rol" AS ENUM('admin', 'docente');--> statement-breakpoint
CREATE TYPE "public"."tipo_programa" AS ENUM('bachillerato', 'maestria', 'tecnico', 'ruta_corporativa');--> statement-breakpoint
CREATE TABLE "cursos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"programa_id" uuid NOT NULL,
	"nombre" varchar(300) NOT NULL,
	"cuatrimestre" integer NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"descripcion" text,
	"creditos" integer
);
--> statement-breakpoint
CREATE TABLE "docentes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"nombre" varchar(200) NOT NULL,
	"titulo" varchar(300) NOT NULL,
	"bio" text,
	"foto_url" varchar(500),
	"especialidades" jsonb DEFAULT '[]'::jsonb,
	"linkedin" varchar(500),
	"activo" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "noticias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"autor_id" uuid,
	"titulo" varchar(400) NOT NULL,
	"slug" varchar(400) NOT NULL,
	"contenido" text NOT NULL,
	"imagen_url" varchar(500),
	"publicado" boolean DEFAULT false NOT NULL,
	"publicado_en" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(200) NOT NULL,
	"titulo" varchar(300) NOT NULL,
	"tipo" "tipo_programa" NOT NULL,
	"nivel" "nivel_programa" NOT NULL,
	"descripcion" text NOT NULL,
	"duracion_cuatrimestres" integer NOT NULL,
	"estadisticas" jsonb DEFAULT '[]'::jsonb,
	"tecnologias" jsonb DEFAULT '[]'::jsonb,
	"objetivo" text,
	"perfil_egresado" text,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rutas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(200) NOT NULL,
	"titulo" varchar(300) NOT NULL,
	"descripcion" text,
	"programa_ids" jsonb DEFAULT '[]'::jsonb,
	"activo" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "solicitudes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" varchar(200) NOT NULL,
	"email" varchar(255) NOT NULL,
	"telefono" varchar(30),
	"programa_id" uuid,
	"mensaje" text,
	"leido" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"rol" "rol" DEFAULT 'docente' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_programa_id_programas_id_fk" FOREIGN KEY ("programa_id") REFERENCES "public"."programas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "docentes" ADD CONSTRAINT "docentes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "noticias" ADD CONSTRAINT "noticias_autor_id_users_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_programa_id_programas_id_fk" FOREIGN KEY ("programa_id") REFERENCES "public"."programas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cursos_programa_idx" ON "cursos" USING btree ("programa_id");--> statement-breakpoint
CREATE UNIQUE INDEX "docentes_user_idx" ON "docentes" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "noticias_slug_idx" ON "noticias" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "programas_slug_idx" ON "programas" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "programas_tipo_idx" ON "programas" USING btree ("tipo");--> statement-breakpoint
CREATE UNIQUE INDEX "rutas_slug_idx" ON "rutas" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "solicitudes_email_idx" ON "solicitudes" USING btree ("email");--> statement-breakpoint
CREATE INDEX "solicitudes_leido_idx" ON "solicitudes" USING btree ("leido");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");