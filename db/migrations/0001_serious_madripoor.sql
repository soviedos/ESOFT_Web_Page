CREATE TYPE "public"."modalidad_programa" AS ENUM('cuatrimestral', 'path', 'curso_360', 'curso_continuo');--> statement-breakpoint
CREATE TYPE "public"."nivel_credencial" AS ENUM('foundational', 'professional', 'advanced', 'expert');--> statement-breakpoint
CREATE TYPE "public"."tipo_unidad" AS ENUM('curso', 'microciclo', 'modulo_360');--> statement-breakpoint
CREATE TABLE "areas_curriculares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(200) NOT NULL,
	"nombre" varchar(200) NOT NULL,
	"descripcion" text,
	"orden" integer DEFAULT 0 NOT NULL,
	"activo" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bloques_contenido" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clave" varchar(200) NOT NULL,
	"titulo" varchar(300),
	"cuerpo" text,
	"seccion" varchar(120),
	"orden" integer DEFAULT 0 NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_por" uuid
);
--> statement-breakpoint
CREATE TABLE "competencias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"programa_id" uuid NOT NULL,
	"curso_id" uuid,
	"nombre" varchar(300) NOT NULL,
	"descripcion" text,
	"microcredencial" varchar(300),
	"sfia_codigo" varchar(20),
	"sfia_nivel" integer,
	"orden" integer DEFAULT 0 NOT NULL,
	"activo" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
DROP INDEX "programas_tipo_idx";--> statement-breakpoint
ALTER TABLE "cursos" ALTER COLUMN "cuatrimestre" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "programas" ALTER COLUMN "nivel" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "programas" ALTER COLUMN "duracion_cuatrimestres" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cursos" ADD COLUMN "tipo" "tipo_unidad" DEFAULT 'curso' NOT NULL;--> statement-breakpoint
ALTER TABLE "cursos" ADD COLUMN "secuencia" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "cursos" ADD COLUMN "horas_lectivas" integer;--> statement-breakpoint
ALTER TABLE "cursos" ADD COLUMN "horas_practicas" integer;--> statement-breakpoint
ALTER TABLE "cursos" ADD COLUMN "horas_estudio" integer;--> statement-breakpoint
ALTER TABLE "programas" ADD COLUMN "modalidad" "modalidad_programa" NOT NULL;--> statement-breakpoint
ALTER TABLE "programas" ADD COLUMN "area_curricular_id" uuid;--> statement-breakpoint
ALTER TABLE "programas" ADD COLUMN "prerequisito_id" uuid;--> statement-breakpoint
ALTER TABLE "programas" ADD COLUMN "nivel_credencial" "nivel_credencial";--> statement-breakpoint
ALTER TABLE "programas" ADD COLUMN "total_microciclos" integer;--> statement-breakpoint
ALTER TABLE "programas" ADD COLUMN "duracion_horas" integer;--> statement-breakpoint
ALTER TABLE "programas" ADD COLUMN "microcredencial" varchar(300);--> statement-breakpoint
ALTER TABLE "programas" ADD COLUMN "badge_url" varchar(500);--> statement-breakpoint
ALTER TABLE "rutas" ADD COLUMN "area_curricular_id" uuid;--> statement-breakpoint
ALTER TABLE "bloques_contenido" ADD CONSTRAINT "bloques_contenido_actualizado_por_users_id_fk" FOREIGN KEY ("actualizado_por") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competencias" ADD CONSTRAINT "competencias_programa_id_programas_id_fk" FOREIGN KEY ("programa_id") REFERENCES "public"."programas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competencias" ADD CONSTRAINT "competencias_curso_id_cursos_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."cursos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "areas_slug_idx" ON "areas_curriculares" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "bloques_clave_idx" ON "bloques_contenido" USING btree ("clave");--> statement-breakpoint
CREATE INDEX "competencias_programa_idx" ON "competencias" USING btree ("programa_id");--> statement-breakpoint
CREATE INDEX "competencias_curso_idx" ON "competencias" USING btree ("curso_id");--> statement-breakpoint
ALTER TABLE "programas" ADD CONSTRAINT "programas_area_curricular_id_areas_curriculares_id_fk" FOREIGN KEY ("area_curricular_id") REFERENCES "public"."areas_curriculares"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programas" ADD CONSTRAINT "programas_prerequisito_id_programas_id_fk" FOREIGN KEY ("prerequisito_id") REFERENCES "public"."programas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_area_curricular_id_areas_curriculares_id_fk" FOREIGN KEY ("area_curricular_id") REFERENCES "public"."areas_curriculares"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cursos_tipo_idx" ON "cursos" USING btree ("tipo");--> statement-breakpoint
CREATE INDEX "programas_modalidad_idx" ON "programas" USING btree ("modalidad");--> statement-breakpoint
CREATE INDEX "programas_area_idx" ON "programas" USING btree ("area_curricular_id");--> statement-breakpoint
ALTER TABLE "programas" DROP COLUMN "tipo";--> statement-breakpoint
DROP TYPE "public"."tipo_programa";