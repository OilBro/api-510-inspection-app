import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';
import type { Context } from './_core/context';

// Mock context for testing
const mockContext: Context = {
  user: null,
  req: {} as any,
  res: {} as any,
};

describe('Material Stress Router', () => {
  const caller = appRouter.createCaller(mockContext);

  it('should return all available materials', async () => {
    const materials = await caller.materialStress.getAllMaterials();
    
    expect(materials).toBeDefined();
    expect(Array.isArray(materials)).toBe(true);
    expect(materials.length).toBeGreaterThan(0);
    
    // Check that SA-240 Type 304 is in the list
    const type304 = materials.find(m => m.materialSpec === 'SA-240 Type 304');
    expect(type304).toBeDefined();
    expect(type304?.materialCategory).toBe('Stainless Steel');
  });

  it('should return exact allowable stress for SA-240 Type 304 at 200°F', async () => {
    const result = await caller.materialStress.getMaterialStressValue({
      materialSpec: 'SA-240 Type 304',
      temperatureF: 200,
    });
    
    expect(result).toBeDefined();
    expect(result?.allowableStress).toBe(20000);
    expect(result?.interpolated).toBe(false);
    expect(result?.materialSpec).toBe('SA-240 Type 304');
  });

  it('should interpolate allowable stress for SA-516 Grade 70 at 250°F', async () => {
    const result = await caller.materialStress.getMaterialStressValue({
      materialSpec: 'SA-516 Grade 70',
      temperatureF: 250,
    });
    
    expect(result).toBeDefined();
    expect(result?.allowableStress).toBeDefined();
    expect(result?.interpolated).toBe(true);
    expect(result?.lowerBound).toBeDefined();
    expect(result?.upperBound).toBeDefined();
    
    // Should be between 200°F and 300°F values
    expect(result?.lowerBound?.temperatureF).toBe(200);
    expect(result?.upperBound?.temperatureF).toBe(300);
  });

  it('should return full stress table for SA-240 Type 316', async () => {
    const table = await caller.materialStress.getMaterialStressTable({
      materialSpec: 'SA-240 Type 316',
    });
    
    expect(table).toBeDefined();
    expect(Array.isArray(table)).toBe(true);
    expect(table.length).toBeGreaterThan(0);
    
    // Check that temperatures are in ascending order
    for (let i = 1; i < table.length; i++) {
      expect(table[i].temperatureF).toBeGreaterThan(table[i - 1].temperatureF);
    }
    
    // Check that all entries are for the correct material
    table.forEach(entry => {
      expect(entry.materialSpec).toBe('SA-240 Type 316');
    });
  });

  it('should return null for non-existent material', async () => {
    const result = await caller.materialStress.getMaterialStressValue({
      materialSpec: 'INVALID-MATERIAL',
      temperatureF: 200,
    });
    
    expect(result).toBeNull();
  });

  it('should handle temperature below available range', async () => {
    const result = await caller.materialStress.getMaterialStressValue({
      materialSpec: 'SA-240 Type 304',
      temperatureF: -100, // Below -20°F minimum
    });
    
    expect(result).toBeDefined();
    expect(result?.note).toBeDefined();
    expect(result?.note).toContain('nearest');
  });

  it('should handle temperature above available range', async () => {
    const result = await caller.materialStress.getMaterialStressValue({
      materialSpec: 'SA-240 Type 304',
      temperatureF: 1000, // Above 800°F maximum
    });
    
    expect(result).toBeDefined();
    expect(result?.note).toBeDefined();
    expect(result?.note).toContain('nearest');
  });
});
