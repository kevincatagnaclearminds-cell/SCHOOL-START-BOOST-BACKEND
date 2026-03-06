/*
  Warnings:

  - Added the required column `canton` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel_educativo` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provincia` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable - Agregar columnas con valores por defecto temporales
ALTER TABLE "students" 
ADD COLUMN "canton" TEXT NOT NULL DEFAULT 'No especificado',
ADD COLUMN "nivel_educativo" TEXT NOT NULL DEFAULT 'ninguno',
ADD COLUMN "provincia" TEXT NOT NULL DEFAULT 'No especificado';

-- Remover los defaults después de agregar las columnas
ALTER TABLE "students" 
ALTER COLUMN "canton" DROP DEFAULT,
ALTER COLUMN "nivel_educativo" DROP DEFAULT,
ALTER COLUMN "provincia" DROP DEFAULT;
