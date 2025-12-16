import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { nanoid } from "nanoid";
import * as db from "./fieldMappingDb";

export const fieldMappingRouter = router({
  // Get all field mappings for current user
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getFieldMappings(ctx.user.id.toString());
  }),

  // Create a new field mapping
  create: protectedProcedure
    .input(
      z.object({
        sourceField: z.string(),
        sourceValue: z.string().optional(),
        targetSection: z.string(),
        targetField: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.createFieldMapping({
        id: nanoid(),
        userId: ctx.user.id.toString(),
        ...input,
      });
      return { success: true };
    }),

  // Suggest mapping based on historical patterns
  suggest: protectedProcedure
    .input(
      z.object({
        sourceField: z.string(),
        sourceValue: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await db.suggestMapping(
        ctx.user.id.toString(),
        input.sourceField,
        input.sourceValue
      );
    }),
});

export const unmatchedDataRouter = router({
  // Get unmatched data for an inspection
  list: protectedProcedure
    .input(z.object({ inspectionId: z.string() }))
    .query(async ({ input }) => {
      return await db.getUnmatchedDataByInspection(input.inspectionId);
    }),

  // Map unmatched data to a field
  map: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        targetSection: z.string(),
        targetField: z.string(),
        sourceField: z.string(),
        sourceValue: z.string().optional(),
        learnMapping: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const mappedTo = `${input.targetSection}.${input.targetField}`;
      
      // Mark as mapped
      await db.markUnmatchedDataAsMapped(input.id, mappedTo);
      
      // Learn the mapping for future use
      if (input.learnMapping) {
        // Check if mapping already exists
        const existing = await db.findSimilarMapping(
          ctx.user.id.toString(),
          input.sourceField
        );
        
        if (existing) {
          // Update usage count
          await db.updateFieldMappingUsage(existing.id);
        } else {
          // Create new mapping
          await db.createFieldMapping({
            id: nanoid(),
            userId: ctx.user.id.toString(),
            sourceField: input.sourceField,
            sourceValue: input.sourceValue,
            targetSection: input.targetSection,
            targetField: input.targetField,
          });
        }
      }
      
      return { success: true, mappedTo };
    }),

  // Ignore unmatched data
  ignore: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.markUnmatchedDataAsIgnored(input.id);
      return { success: true };
    }),
});

