-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "codigo_amie" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "total_alumnos" INTEGER NOT NULL,
    "alumnos_capacitados" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "edad" INTEGER NOT NULL,
    "genero" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "completed_training" BOOLEAN NOT NULL DEFAULT false,
    "training_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schools_codigo_amie_key" ON "schools"("codigo_amie");

-- CreateIndex
CREATE UNIQUE INDEX "students_cedula_key" ON "students"("cedula");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
