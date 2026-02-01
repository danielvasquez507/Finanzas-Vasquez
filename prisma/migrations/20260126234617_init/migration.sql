-- CreateTable
CREATE TABLE "gastos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "categoria" TEXT,
    "descripcion" TEXT,
    "monto" REAL NOT NULL
);
