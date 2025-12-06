import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { materialStressValues } from "../drizzle/schema";
import { eq, and, lte, gte, sql } from "drizzle-orm";

export const materialStressRouter = router({
  /**
   * Get all unique materials
   */
  getAllMaterials: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const materials = await db
      .selectDistinct({
        materialSpec: materialStressValues.materialSpec,
        materialGrade: materialStressValues.materialGrade,
        materialCategory: materialStressValues.materialCategory,
      })
      .from(materialStressValues);
    
    return materials;
  }),

  /**
   * Get allowable stress for a specific material and temperature
   * Uses linear interpolation if exact temperature not found
   */
  getMaterialStressValue: publicProcedure
    .input(
      z.object({
        materialSpec: z.string(),
        temperatureF: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Try to find exact temperature match first
      const exactMatch = await db
        .select()
        .from(materialStressValues)
        .where(
          and(
            eq(materialStressValues.materialSpec, input.materialSpec),
            eq(materialStressValues.temperatureF, Math.round(input.temperatureF))
          )
        )
        .limit(1);

      if (exactMatch.length > 0) {
        return {
          allowableStress: exactMatch[0].allowableStress,
          temperatureF: exactMatch[0].temperatureF,
          materialSpec: exactMatch[0].materialSpec,
          materialGrade: exactMatch[0].materialGrade,
          materialCategory: exactMatch[0].materialCategory,
          interpolated: false,
        };
      }

      // If no exact match, find bounding temperatures for interpolation
      const lowerBound = await db
        .select()
        .from(materialStressValues)
        .where(
          and(
            eq(materialStressValues.materialSpec, input.materialSpec),
            lte(materialStressValues.temperatureF, Math.round(input.temperatureF))
          )
        )
        .orderBy(sql`${materialStressValues.temperatureF} DESC`)
        .limit(1);

      const upperBound = await db
        .select()
        .from(materialStressValues)
        .where(
          and(
            eq(materialStressValues.materialSpec, input.materialSpec),
            gte(materialStressValues.temperatureF, Math.round(input.temperatureF))
          )
        )
        .orderBy(sql`${materialStressValues.temperatureF} ASC`)
        .limit(1);

      // If we have both bounds, interpolate
      if (lowerBound.length > 0 && upperBound.length > 0) {
        const lower = lowerBound[0];
        const upper = upperBound[0];

        // Linear interpolation
        const tempRange = upper.temperatureF - lower.temperatureF;
        const stressRange = upper.allowableStress - lower.allowableStress;
        const tempDiff = input.temperatureF - lower.temperatureF;
        const interpolatedStress = Math.round(
          lower.allowableStress + (stressRange * tempDiff) / tempRange
        );

        return {
          allowableStress: interpolatedStress,
          temperatureF: input.temperatureF,
          materialSpec: lower.materialSpec,
          materialGrade: lower.materialGrade,
          materialCategory: lower.materialCategory,
          interpolated: true,
          lowerBound: {
            temperatureF: lower.temperatureF,
            allowableStress: lower.allowableStress,
          },
          upperBound: {
            temperatureF: upper.temperatureF,
            allowableStress: upper.allowableStress,
          },
        };
      }

      // If only lower bound exists, use that value
      if (lowerBound.length > 0) {
        return {
          allowableStress: lowerBound[0].allowableStress,
          temperatureF: lowerBound[0].temperatureF,
          materialSpec: lowerBound[0].materialSpec,
          materialGrade: lowerBound[0].materialGrade,
          materialCategory: lowerBound[0].materialCategory,
          interpolated: false,
          note: "Using nearest available temperature",
        };
      }

      // If only upper bound exists, use that value
      if (upperBound.length > 0) {
        return {
          allowableStress: upperBound[0].allowableStress,
          temperatureF: upperBound[0].temperatureF,
          materialSpec: upperBound[0].materialSpec,
          materialGrade: upperBound[0].materialGrade,
          materialCategory: upperBound[0].materialCategory,
          interpolated: false,
          note: "Using nearest available temperature",
        };
      }

      // No data found
      return null;
    }),

  /**
   * Get all stress values for a specific material
   */
  getMaterialStressTable: publicProcedure
    .input(z.object({ materialSpec: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const values = await db
        .select()
        .from(materialStressValues)
        .where(eq(materialStressValues.materialSpec, input.materialSpec))
        .orderBy(materialStressValues.temperatureF);

      return values;
    }),
});
