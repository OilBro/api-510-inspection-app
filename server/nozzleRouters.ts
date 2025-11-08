/**
 * tRPC routers for nozzle evaluations
 */

import { z } from 'zod';
import { nanoid } from 'nanoid';
import { protectedProcedure, router } from './_core/trpc.js';
import {
  getNozzlesByInspection,
  getNozzleById,
  createNozzle,
  updateNozzle,
  deleteNozzle,
  getPipeSchedule,
  getPipeSchedulesBySize,
  getAllNominalSizes,
  getAllSchedules,
} from './nozzleDb.js';
import { calculateNozzleWithSchedule } from './nozzleCalculations.js';

export const nozzleRouter = router({
  /**
   * Get all nozzles for an inspection
   */
  list: protectedProcedure
    .input(z.object({ inspectionId: z.string() }))
    .query(async ({ input }) => {
      return await getNozzlesByInspection(input.inspectionId);
    }),

  /**
   * Get a single nozzle by ID
   */
  get: protectedProcedure
    .input(z.object({ nozzleId: z.string() }))
    .query(async ({ input }) => {
      return await getNozzleById(input.nozzleId);
    }),

  /**
   * Create a new nozzle evaluation
   */
  create: protectedProcedure
    .input(
      z.object({
        inspectionId: z.string(),
        nozzleNumber: z.string(),
        nozzleDescription: z.string().optional(),
        location: z.string().optional(),
        nominalSize: z.string(),
        schedule: z.string(),
        actualThickness: z.number().optional(),
        shellHeadRequiredThickness: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Get pipe schedule data
      const pipeScheduleData = await getPipeSchedule(input.nominalSize, input.schedule);
      
      if (!pipeScheduleData) {
        throw new Error(`Pipe schedule not found for ${input.nominalSize}" ${input.schedule}`);
      }
      
      // Calculate minimum required thickness
      const calculation = calculateNozzleWithSchedule({
        nozzleNumber: input.nozzleNumber,
        nominalSize: input.nominalSize,
        schedule: input.schedule,
        shellHeadRequiredThickness: input.shellHeadRequiredThickness,
        actualThickness: input.actualThickness,
        pipeScheduleData: {
          outsideDiameter: parseFloat(pipeScheduleData.outsideDiameter),
          wallThickness: parseFloat(pipeScheduleData.wallThickness),
        },
      });
      
      if (!calculation) {
        throw new Error('Failed to calculate nozzle minimum thickness');
      }
      
      // Create nozzle record
      const nozzle = await createNozzle({
        id: nanoid(),
        inspectionId: input.inspectionId,
        nozzleNumber: input.nozzleNumber,
        nozzleDescription: input.nozzleDescription,
        location: input.location,
        nominalSize: input.nominalSize,
        schedule: input.schedule,
        actualThickness: input.actualThickness?.toString(),
        pipeNominalThickness: calculation.pipeNominalThickness.toString(),
        pipeMinusManufacturingTolerance: calculation.pipeMinusManufacturingTolerance.toString(),
        shellHeadRequiredThickness: calculation.shellHeadRequiredThickness.toString(),
        minimumRequired: calculation.minimumRequired.toString(),
        acceptable: calculation.acceptable,
      });
      
      return nozzle;
    }),

  /**
   * Update a nozzle evaluation
   */
  update: protectedProcedure
    .input(
      z.object({
        nozzleId: z.string(),
        nozzleNumber: z.string().optional(),
        nozzleDescription: z.string().optional(),
        location: z.string().optional(),
        nominalSize: z.string().optional(),
        schedule: z.string().optional(),
        actualThickness: z.number().optional(),
        shellHeadRequiredThickness: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { nozzleId, ...updates } = input;
      
      // Get existing nozzle
      const existing = await getNozzleById(nozzleId);
      if (!existing) {
        throw new Error('Nozzle not found');
      }
      
      // If size/schedule/thickness changed, recalculate
      const needsRecalc =
        updates.nominalSize ||
        updates.schedule ||
        updates.actualThickness !== undefined ||
        updates.shellHeadRequiredThickness !== undefined;
      
      if (needsRecalc) {
        const nominalSize = updates.nominalSize || existing.nominalSize;
        const schedule = updates.schedule || existing.schedule;
        const shellRequired = updates.shellHeadRequiredThickness !== undefined
          ? updates.shellHeadRequiredThickness
          : parseFloat(existing.shellHeadRequiredThickness || '0');
        
        // Get pipe schedule data
        const pipeScheduleData = await getPipeSchedule(nominalSize, schedule);
        
        if (!pipeScheduleData) {
          throw new Error(`Pipe schedule not found for ${nominalSize}" ${schedule}`);
        }
        
        // Calculate minimum required thickness
        const calculation = calculateNozzleWithSchedule({
          nozzleNumber: updates.nozzleNumber || existing.nozzleNumber,
          nominalSize,
          schedule,
          shellHeadRequiredThickness: shellRequired,
          actualThickness: updates.actualThickness,
          pipeScheduleData: {
            outsideDiameter: parseFloat(pipeScheduleData.outsideDiameter),
            wallThickness: parseFloat(pipeScheduleData.wallThickness),
          },
        });
        
        if (calculation) {
          // Update with calculated values
          return await updateNozzle(nozzleId, {
            ...updates,
            actualThickness: updates.actualThickness?.toString(),
            shellHeadRequiredThickness: shellRequired.toString(),
            pipeNominalThickness: calculation.pipeNominalThickness.toString(),
            pipeMinusManufacturingTolerance: calculation.pipeMinusManufacturingTolerance.toString(),
            minimumRequired: calculation.minimumRequired.toString(),
            acceptable: calculation.acceptable,
          });
        }
      }
      
      // Simple update without recalculation
      return await updateNozzle(nozzleId, {
        ...updates,
        actualThickness: updates.actualThickness?.toString(),
        shellHeadRequiredThickness: updates.shellHeadRequiredThickness?.toString(),
      });
    }),

  /**
   * Delete a nozzle evaluation
   */
  delete: protectedProcedure
    .input(z.object({ nozzleId: z.string() }))
    .mutation(async ({ input }) => {
      await deleteNozzle(input.nozzleId);
      return { success: true };
    }),

  /**
   * Get pipe schedule by size and schedule
   */
  getPipeSchedule: protectedProcedure
    .input(
      z.object({
        nominalSize: z.string(),
        schedule: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await getPipeSchedule(input.nominalSize, input.schedule);
    }),

  /**
   * Get all schedules for a nominal size
   */
  getSchedulesBySize: protectedProcedure
    .input(z.object({ nominalSize: z.string() }))
    .query(async ({ input }) => {
      return await getPipeSchedulesBySize(input.nominalSize);
    }),

  /**
   * Get all available nominal sizes
   */
  getNominalSizes: protectedProcedure.query(async () => {
    return await getAllNominalSizes();
  }),

  /**
   * Get all available schedules
   */
  getSchedules: protectedProcedure.query(async () => {
    return await getAllSchedules();
  }),
});

