import { z } from "zod";
import { nanoid } from "nanoid";
import { protectedProcedure, router } from "./_core/trpc";
import {
  createProfessionalReport,
  getProfessionalReport,
  getProfessionalReportByInspection,
  updateProfessionalReport,
  createComponentCalculation,
  getComponentCalculations,
  updateComponentCalculation,
  deleteComponentCalculation,
  createInspectionFinding,
  getInspectionFindings,
  updateInspectionFinding,
  deleteInspectionFinding,
  createRecommendation,
  getRecommendations,
  updateRecommendation,
  deleteRecommendation,
  createInspectionPhoto,
  getInspectionPhotos,
  deleteInspectionPhoto,
  createAppendixDocument,
  getAppendixDocuments,
  deleteAppendixDocument,
  createChecklistItem,
  getChecklistItems,
  updateChecklistItem,
  initializeDefaultChecklist,
} from "./professionalReportDb";
import { generateProfessionalPDF } from "./professionalPdfGenerator";
import { evaluateShell, evaluateHead, ShellCalculationInputs, HeadCalculationInputs } from "./professionalCalculations";

// ============================================================================
// Professional Report Router
// ============================================================================

export const professionalReportRouter = router({
  // Create or get professional report for an inspection
  getOrCreate: protectedProcedure
    .input(z.object({ inspectionId: z.string() }))
    .query(async ({ input, ctx }) => {
      let report = await getProfessionalReportByInspection(input.inspectionId);
      
      if (!report) {
        const reportId = nanoid();
        await createProfessionalReport({
          id: reportId,
          inspectionId: input.inspectionId,
          reportNumber: `RPT-${Date.now()}`,
          reportDate: new Date(),
          inspectorName: ctx.user.name || '',
          employerName: 'OilPro Consulting LLC',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        // Initialize default checklist
        await initializeDefaultChecklist(reportId);
        
        report = await getProfessionalReport(reportId);
      }
      
      return report;
    }),
  
  // Update professional report
  update: protectedProcedure
    .input(z.object({
      reportId: z.string(),
      data: z.object({
        reportNumber: z.string().optional(),
        reportDate: z.string().optional(),
        inspectorName: z.string().optional(),
        inspectorCertification: z.string().optional(),
        employerName: z.string().optional(),
        clientName: z.string().optional(),
        clientLocation: z.string().optional(),
        clientContact: z.string().optional(),
        clientApprovalName: z.string().optional(),
        clientApprovalTitle: z.string().optional(),
        executiveSummary: z.string().optional(),
        nextExternalInspectionClient: z.string().optional(),
        nextExternalInspectionAPI: z.string().optional(),
        nextInternalInspection: z.string().optional(),
        nextUTInspection: z.string().optional(),
        governingComponent: z.string().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      // Convert date strings to Date objects
      const updateData: any = { ...input.data };
      if (updateData.reportDate) updateData.reportDate = new Date(updateData.reportDate);
      if (updateData.nextExternalInspectionClient) updateData.nextExternalInspectionClient = new Date(updateData.nextExternalInspectionClient);
      if (updateData.nextExternalInspectionAPI) updateData.nextExternalInspectionAPI = new Date(updateData.nextExternalInspectionAPI);
      if (updateData.nextInternalInspection) updateData.nextInternalInspection = new Date(updateData.nextInternalInspection);
      if (updateData.nextUTInspection) updateData.nextUTInspection = new Date(updateData.nextUTInspection);
      
      await updateProfessionalReport(input.reportId, updateData);
      return { success: true };
    }),
  
  // Component calculations
  componentCalculations: router({
    list: protectedProcedure
      .input(z.object({ reportId: z.string() }))
      .query(async ({ input }) => {
        return await getComponentCalculations(input.reportId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        reportId: z.string(),
        componentName: z.string(),
        componentType: z.enum(['shell', 'head']),
        materialCode: z.string().optional(),
        materialName: z.string().optional(),
        designTemp: z.string().optional(),
        designMAWP: z.string().optional(),
        staticHead: z.string().optional(),
        specificGravity: z.string().optional(),
        insideDiameter: z.string().optional(),
        nominalThickness: z.string().optional(),
        allowableStress: z.string().optional(),
        jointEfficiency: z.string().optional(),
        headType: z.string().optional(),
        crownRadius: z.string().optional(),
        knuckleRadius: z.string().optional(),
        previousThickness: z.string().optional(),
        actualThickness: z.string().optional(),
        timeSpan: z.string().optional(),
        nextInspectionYears: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { reportId, componentType, ...data } = input;
        
        // Calculate values based on component type
        let calculatedData: any = { ...data };
        
        if (componentType === 'shell') {
          const inputs: ShellCalculationInputs = {
            P: parseFloat(data.designMAWP || '0'),
            R: parseFloat(data.insideDiameter || '0') / 2,
            S: parseFloat(data.allowableStress || '0'),
            E: parseFloat(data.jointEfficiency || '1'),
            t_nom: parseFloat(data.nominalThickness || '0'),
            t_prev: parseFloat(data.previousThickness || '0'),
            t_act: parseFloat(data.actualThickness || '0'),
            Y: parseFloat(data.timeSpan || '1'),
            Yn: parseFloat(data.nextInspectionYears || '5'),
            SH: parseFloat(data.staticHead || '0'),
            SG: parseFloat(data.specificGravity || '1'),
          };
          
          const results = evaluateShell(inputs);
          
          calculatedData = {
            ...calculatedData,
            minimumThickness: results.t_min.toFixed(4),
            corrosionAllowance: results.Ca.toFixed(4),
            corrosionRate: results.Cr.toFixed(6),
            remainingLife: results.RL.toFixed(2),
            thicknessAtNextInspection: results.t_next.toFixed(4),
            pressureAtNextInspection: results.P_next.toFixed(2),
            mawpAtNextInspection: results.MAWP.toFixed(2),
          };
        } else if (componentType === 'head') {
          const D = parseFloat(data.insideDiameter || '0');
          const R = D / 2;
          const L = parseFloat(data.crownRadius || R.toString());
          const r = parseFloat(data.knuckleRadius || (R * 0.06).toString());
          
          const inputs: HeadCalculationInputs = {
            headType: (data.headType as any) || 'torispherical',
            P: parseFloat(data.designMAWP || '0'),
            S: parseFloat(data.allowableStress || '0'),
            E: parseFloat(data.jointEfficiency || '1'),
            D,
            t_nom: parseFloat(data.nominalThickness || '0'),
            t_prev: parseFloat(data.previousThickness || '0'),
            t_act: parseFloat(data.actualThickness || '0'),
            Y: parseFloat(data.timeSpan || '1'),
            Yn: parseFloat(data.nextInspectionYears || '5'),
            SH: parseFloat(data.staticHead || '0'),
            SG: parseFloat(data.specificGravity || '1'),
            L,
            r,
          };
          
          const results = evaluateHead(inputs);
          
          calculatedData = {
            ...calculatedData,
            headFactor: results.M?.toFixed(4) || '1.0',
            minimumThickness: results.t_min.toFixed(4),
            corrosionAllowance: results.Ca.toFixed(4),
            corrosionRate: results.Cr.toFixed(6),
            remainingLife: results.RL.toFixed(2),
            thicknessAtNextInspection: results.t_next.toFixed(4),
            pressureAtNextInspection: results.P_next.toFixed(2),
            mawpAtNextInspection: results.MAWP.toFixed(2),
          };
        }
        
        const id = nanoid();
        await createComponentCalculation({
          id,
          reportId,
          componentName: data.componentName,
          componentType,
          ...calculatedData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        calcId: z.string(),
        data: z.any(),
      }))
      .mutation(async ({ input }) => {
        await updateComponentCalculation(input.calcId, input.data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ calcId: z.string() }))
      .mutation(async ({ input }) => {
        await deleteComponentCalculation(input.calcId);
        return { success: true };
      }),
  }),
  
  // Inspection findings
  findings: router({
    list: protectedProcedure
      .input(z.object({ reportId: z.string() }))
      .query(async ({ input }) => {
        return await getInspectionFindings(input.reportId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        reportId: z.string(),
        section: z.string(),
        findingType: z.enum(['observation', 'defect', 'recommendation']).default('observation'),
        severity: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
        description: z.string(),
        location: z.string().optional(),
        measurements: z.string().optional(),
        photos: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = nanoid();
        await createInspectionFinding({
          id,
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        findingId: z.string(),
        section: z.string().optional(),
        findingType: z.enum(['observation', 'defect', 'recommendation']).optional(),
        severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        measurements: z.string().optional(),
        photos: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { findingId, ...data } = input;
        await updateInspectionFinding(findingId, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ findingId: z.string() }))
      .mutation(async ({ input }) => {
        await deleteInspectionFinding(input.findingId);
        return { success: true };
      }),
  }),
  
  // Recommendations
  recommendations: router({
    list: protectedProcedure
      .input(z.object({ reportId: z.string() }))
      .query(async ({ input }) => {
        return await getRecommendations(input.reportId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        reportId: z.string(),
        section: z.string(),
        subsection: z.string().optional(),
        recommendation: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      }))
      .mutation(async ({ input }) => {
        const id = nanoid();
        await createRecommendation({
          id,
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        recommendationId: z.string(),
        data: z.object({
          recommendation: z.string().optional(),
          priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await updateRecommendation(input.recommendationId, input.data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ recommendationId: z.string() }))
      .mutation(async ({ input }) => {
        await deleteRecommendation(input.recommendationId);
        return { success: true };
      }),
  }),
  
  // Photos
  photos: router({
    list: protectedProcedure
      .input(z.object({ reportId: z.string() }))
      .query(async ({ input }) => {
        return await getInspectionPhotos(input.reportId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        reportId: z.string(),
        photoUrl: z.string(),
        caption: z.string().optional(),
        section: z.string().optional(),
        sequenceNumber: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = nanoid();
        await createInspectionPhoto({
          id,
          ...input,
          createdAt: new Date(),
        });
        return { id };
      }),
    
    delete: protectedProcedure
      .input(z.object({ photoId: z.string() }))
      .mutation(async ({ input }) => {
        await deleteInspectionPhoto(input.photoId);
        return { success: true };
      }),
  }),
  
  // Checklist
  checklist: router({
    list: protectedProcedure
      .input(z.object({ reportId: z.string() }))
      .query(async ({ input }) => {
        return await getChecklistItems(input.reportId);
      }),
    
    initialize: protectedProcedure
      .input(z.object({ reportId: z.string() }))
      .mutation(async ({ input }) => {
        await initializeDefaultChecklist(input.reportId);
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        itemId: z.string(),
        checked: z.boolean().optional(),
        checkedBy: z.string().optional().nullable(),
        checkedDate: z.date().optional().nullable(),
        notes: z.string().optional(),
        status: z.enum(['satisfactory', 'unsatisfactory', 'not_applicable', 'not_checked']).optional(),
        comments: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { itemId, ...data } = input;
        await updateChecklistItem(itemId, data);
        return { success: true };
      }),
  }),
  
  // Generate PDF
  generatePDF: protectedProcedure
    .input(z.object({
      reportId: z.string(),
      inspectionId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const pdfBuffer = await generateProfessionalPDF({
        reportId: input.reportId,
        inspectionId: input.inspectionId,
      });
      
      // Convert buffer to base64 for transmission
      const base64 = pdfBuffer.toString('base64');
      
      return {
        success: true,
        pdf: base64,
      };
    }),
});

