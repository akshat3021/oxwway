import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { prisma } from "@/server/db/prisma";

/**
 * Guards the hand-maintained migration SQL against the Prisma schema: every
 * model/field must exist in the migrated database with the right enum values.
 * (CI additionally runs `prisma migrate diff` where the migration engine is
 * available; this test works anywhere a database exists.)
 */
describe("migrations match the Prisma schema", () => {
  const { models, enums } = Prisma.dmmf.datamodel;

  it.each(models.map((m) => [m.name, m] as const))("table %s has exactly the modelled columns", async (_name, model) => {
    const table = model.dbName ?? model.name;
    const rows = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${table}`;
    const actual = rows.map((r) => r.column_name).sort();
    const expected = model.fields.filter((f) => f.kind === "scalar" || f.kind === "enum").map((f) => f.name).sort();
    expect(actual).toEqual(expected);
  });

  it.each(enums.map((e) => [e.name, e] as const))("enum %s has the modelled values", async (_n, en) => {
    const rows = await prisma.$queryRaw<{ enumlabel: string }[]>`
      SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = ${en.name}`;
    expect(rows.map((r) => r.enumlabel).sort()).toEqual(en.values.map((v) => v.name).sort());
  });

  it("the audit trail has no foreign keys to content tables (history must outlive content)", async () => {
    const rows = await prisma.$queryRaw<{ constraint_name: string }[]>`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_name = 'AuditLog' AND constraint_type = 'FOREIGN KEY'`;
    expect(rows.map((r) => r.constraint_name)).toEqual(["AuditLog_actorId_fkey"]);
  });
});
