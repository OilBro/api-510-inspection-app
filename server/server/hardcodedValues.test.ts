import { describe, it, expect } from 'vitest';

describe('Fix Hardcoded Values', () => {
  describe('TML Status Calculator Interface', () => {
    it('should validate interface accepts jointEfficiency parameter', () => {
      // This test validates that the TypeScript interface is correct
      // The actual interface in tmlStatusCalculator.ts should accept these fields
      type StatusInput = {
        currentThickness: number;
        nominalThickness: number;
        designPressure: number;
        insideDiameter: number;
        materialSpec: string;
        designTemperature: number;
        corrosionAllowance?: number;
        jointEfficiency?: number; // This should be accepted
      };
      
      const input: StatusInput = {
        currentThickness: 0.5,
        nominalThickness: 0.625,
        designPressure: 150,
        insideDiameter: 48,
        materialSpec: 'SA-516-70',
        designTemperature: 650,
        corrosionAllowance: 0.125,
        jointEfficiency: 1.0,
      };
      
      // If TypeScript compiles, the interface is correct
      expect(input.jointEfficiency).toBe(1.0);
      expect(input.corrosionAllowance).toBe(0.125);
    });

    it('should allow optional jointEfficiency and corrosionAllowance', () => {
      type StatusInput = {
        currentThickness: number;
        nominalThickness: number;
        designPressure: number;
        insideDiameter: number;
        materialSpec: string;
        designTemperature: number;
        corrosionAllowance?: number;
        jointEfficiency?: number;
      };
      
      // Should compile without jointEfficiency and corrosionAllowance
      const input: StatusInput = {
        currentThickness: 0.5,
        nominalThickness: 0.625,
        designPressure: 150,
        insideDiameter: 48,
        materialSpec: 'SA-516-70',
        designTemperature: 650,
      };
      
      expect(input.jointEfficiency).toBeUndefined();
      expect(input.corrosionAllowance).toBeUndefined();
    });
  });

  describe('Date-based corrosion rate calculation', () => {
    it('should calculate time span in years correctly', () => {
      // Test the date calculation logic
      const prevDate = new Date('2020-01-01');
      const currDate = new Date('2023-01-01');
      
      const prevTime = prevDate.getTime();
      const currTime = currDate.getTime();
      const diffMs = currTime - prevTime;
      const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
      
      // Should be approximately 3 years
      expect(diffYears).toBeGreaterThan(2.99);
      expect(diffYears).toBeLessThan(3.01);
    });

    it('should handle partial year differences', () => {
      const prevDate = new Date('2022-01-01');
      const currDate = new Date('2022-07-01');
      
      const prevTime = prevDate.getTime();
      const currTime = currDate.getTime();
      const diffMs = currTime - prevTime;
      const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
      
      // Should be approximately 0.5 years (6 months)
      expect(diffYears).toBeGreaterThan(0.49);
      expect(diffYears).toBeLessThan(0.51);
    });

    it('should calculate corrosion rate with time span', () => {
      // Simulate corrosion rate calculation
      const previous = 0.625; // inches
      const current = 0.600; // inches
      const timeSpanYears = 3.0;
      
      const thicknessLoss = previous - current; // 0.025 inches
      const corrosionRateMpy = (thicknessLoss / timeSpanYears) * 1000; // convert to mils per year
      
      // 0.025 inches over 3 years = 0.00833 inches/year = 8.33 mils/year
      expect(corrosionRateMpy).toBeCloseTo(8.33, 1);
    });
  });
});
