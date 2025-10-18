import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Calculator, Save } from "lucide-react";
import { toast } from "sonner";

interface CalculationsTabProps {
  inspectionId: string;
  inspection: any;
}

export default function CalculationsTab({ inspectionId, inspection }: CalculationsTabProps) {
  const { data: calculations } = trpc.calculations.get.useQuery({ inspectionId });
  const saveMutation = trpc.calculations.save.useMutation();
  const utils = trpc.useUtils();

  // Minimum thickness inputs
  const [minThicknessInputs, setMinThicknessInputs] = useState({
    designPressure: inspection.designPressure || "",
    insideRadius: inspection.insideDiameter ? (parseFloat(inspection.insideDiameter) / 2).toString() : "",
    allowableStress: "",
    jointEfficiency: "1.0",
    corrosionAllowance: "0.125",
  });

  const [minThicknessResult, setMinThicknessResult] = useState("");

  // MAWP inputs
  const [mawpInputs, setMawpInputs] = useState({
    actualThickness: "0.375",
    insideRadius: inspection.insideDiameter ? (parseFloat(inspection.insideDiameter) / 2).toString() : "",
    allowableStress: "",
    jointEfficiency: "1.0",
    corrosionAllowance: "0.125",
  });

  const [mawpResult, setMawpResult] = useState("");

  // Remaining life inputs
  const [remainingLifeInputs, setRemainingLifeInputs] = useState({
    currentThickness: "0.350",
    requiredThickness: "0.250",
    corrosionRate: "2.5",
    safetyFactor: "2.0",
  });

  const [remainingLifeResult, setRemainingLifeResult] = useState("");
  const [nextInspection, setNextInspection] = useState("");

  // Load saved calculations
  useEffect(() => {
    if (calculations) {
      if (calculations.minThicknessResult) {
        setMinThicknessResult(calculations.minThicknessResult);
      }
      if (calculations.mawpResult) {
        setMawpResult(calculations.mawpResult);
      }
      if (calculations.remainingLifeResult) {
        setRemainingLifeResult(calculations.remainingLifeResult);
      }
    }
  }, [calculations]);

  // Calculate minimum thickness
  const calculateMinThickness = () => {
    const P = parseFloat(minThicknessInputs.designPressure);
    const R = parseFloat(minThicknessInputs.insideRadius);
    const S = parseFloat(minThicknessInputs.allowableStress);
    const E = parseFloat(minThicknessInputs.jointEfficiency);
    const CA = parseFloat(minThicknessInputs.corrosionAllowance);

    if (!P || !R || !S || !E) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Formula: t = PR/(SE-0.6P) + CA
    const numerator = P * R;
    const denominator = (S * E) - (0.6 * P);
    const t = (numerator / denominator) + CA;

    setMinThicknessResult(t.toFixed(4));
    toast.success("Minimum thickness calculated");
  };

  // Calculate MAWP
  const calculateMAWP = () => {
    const t = parseFloat(mawpInputs.actualThickness);
    const R = parseFloat(mawpInputs.insideRadius);
    const S = parseFloat(mawpInputs.allowableStress);
    const E = parseFloat(mawpInputs.jointEfficiency);
    const CA = parseFloat(mawpInputs.corrosionAllowance);

    if (!t || !R || !S || !E) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Formula: MAWP = SE(t-CA)/(R+0.6(t-CA))
    const tEffective = t - CA;
    const numerator = S * E * tEffective;
    const denominator = R + (0.6 * tEffective);
    const mawp = numerator / denominator;

    setMawpResult(mawp.toFixed(2));
    toast.success("MAWP calculated");
  };

  // Calculate remaining life
  const calculateRemainingLife = () => {
    const current = parseFloat(remainingLifeInputs.currentThickness);
    const required = parseFloat(remainingLifeInputs.requiredThickness);
    const rate = parseFloat(remainingLifeInputs.corrosionRate);
    const safety = parseFloat(remainingLifeInputs.safetyFactor);

    if (!current || !required || !rate || !safety) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Available thickness for corrosion (inches to mils)
    const available = (current - required) * 1000;
    // Remaining life in years
    const life = available / rate;
    // With safety factor
    const adjustedLife = life / safety;
    // Next inspection (half of remaining life)
    const nextInsp = adjustedLife / 2;

    setRemainingLifeResult(adjustedLife.toFixed(1));
    setNextInspection(nextInsp.toFixed(1));
    toast.success("Remaining life calculated");
  };

  // Save all calculations
  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({
        inspectionId,
        minThicknessDesignPressure: minThicknessInputs.designPressure,
        minThicknessInsideRadius: minThicknessInputs.insideRadius,
        minThicknessAllowableStress: minThicknessInputs.allowableStress,
        minThicknessJointEfficiency: minThicknessInputs.jointEfficiency,
        minThicknessCorrosionAllowance: minThicknessInputs.corrosionAllowance,
        minThicknessResult,
        mawpActualThickness: mawpInputs.actualThickness,
        mawpInsideRadius: mawpInputs.insideRadius,
        mawpAllowableStress: mawpInputs.allowableStress,
        mawpJointEfficiency: mawpInputs.jointEfficiency,
        mawpCorrosionAllowance: mawpInputs.corrosionAllowance,
        mawpResult,
        remainingLifeCurrentThickness: remainingLifeInputs.currentThickness,
        remainingLifeRequiredThickness: remainingLifeInputs.requiredThickness,
        remainingLifeCorrosionRate: remainingLifeInputs.corrosionRate,
        remainingLifeSafetyFactor: remainingLifeInputs.safetyFactor,
        remainingLifeResult,
        remainingLifeNextInspection: nextInspection,
      });

      utils.calculations.get.invalidate({ inspectionId });
      toast.success("Calculations saved successfully");
    } catch (error) {
      toast.error("Failed to save calculations");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ASME Section VIII Design Calculations</CardTitle>
          <CardDescription>Comprehensive pressure vessel calculations per ASME Boiler and Pressure Vessel Code</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Minimum Required Thickness */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Minimum Required Thickness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Design Pressure (P) - psig</Label>
              <Input
                type="number"
                step="0.01"
                value={minThicknessInputs.designPressure}
                onChange={(e) => setMinThicknessInputs({ ...minThicknessInputs, designPressure: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Inside Radius (R) - inches</Label>
              <Input
                type="number"
                step="0.01"
                value={minThicknessInputs.insideRadius}
                onChange={(e) => setMinThicknessInputs({ ...minThicknessInputs, insideRadius: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Allowable Stress (S) - psi</Label>
              <Select
                value={minThicknessInputs.allowableStress}
                onValueChange={(value) => setMinThicknessInputs({ ...minThicknessInputs, allowableStress: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material & temperature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20000">SA-516-70 @ 650°F: 20,000 psi</SelectItem>
                  <SelectItem value="17500">SA-516-70 @ 700°F: 17,500 psi</SelectItem>
                  <SelectItem value="15000">SA-516-70 @ 750°F: 15,000 psi</SelectItem>
                  <SelectItem value="18750">SA-387-22 @ 850°F: 18,750 psi</SelectItem>
                  <SelectItem value="16250">SA-387-22 @ 900°F: 16,250 psi</SelectItem>
                  <SelectItem value="14000">SA-387-22 @ 950°F: 14,000 psi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Joint Efficiency (E)</Label>
              <Select
                value={minThicknessInputs.jointEfficiency}
                onValueChange={(value) => setMinThicknessInputs({ ...minThicknessInputs, jointEfficiency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.0">1.0 - Full Radiography</SelectItem>
                  <SelectItem value="0.85">0.85 - Spot Radiography</SelectItem>
                  <SelectItem value="0.70">0.70 - No Radiography</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Corrosion Allowance (CA) - inches</Label>
              <Input
                type="number"
                step="0.001"
                value={minThicknessInputs.corrosionAllowance}
                onChange={(e) => setMinThicknessInputs({ ...minThicknessInputs, corrosionAllowance: e.target.value })}
              />
            </div>

            <Button onClick={calculateMinThickness} className="w-full">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Minimum Thickness
            </Button>

            {minThicknessResult && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Formula: t = PR/(SE-0.6P) + CA</p>
                <p className="text-2xl font-bold text-green-700">
                  Required Thickness: {minThicknessResult} inches
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maximum Allowable Working Pressure */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Maximum Allowable Working Pressure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Actual Thickness (t) - inches</Label>
              <Input
                type="number"
                step="0.0001"
                value={mawpInputs.actualThickness}
                onChange={(e) => setMawpInputs({ ...mawpInputs, actualThickness: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Inside Radius (R) - inches</Label>
              <Input
                type="number"
                step="0.01"
                value={mawpInputs.insideRadius}
                onChange={(e) => setMawpInputs({ ...mawpInputs, insideRadius: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Allowable Stress (S) - psi</Label>
              <Select
                value={mawpInputs.allowableStress}
                onValueChange={(value) => setMawpInputs({ ...mawpInputs, allowableStress: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material & temperature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20000">SA-516-70 @ 650°F: 20,000 psi</SelectItem>
                  <SelectItem value="17500">SA-516-70 @ 700°F: 17,500 psi</SelectItem>
                  <SelectItem value="15000">SA-516-70 @ 750°F: 15,000 psi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Joint Efficiency (E)</Label>
              <Select
                value={mawpInputs.jointEfficiency}
                onValueChange={(value) => setMawpInputs({ ...mawpInputs, jointEfficiency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.0">1.0 - Full Radiography</SelectItem>
                  <SelectItem value="0.85">0.85 - Spot Radiography</SelectItem>
                  <SelectItem value="0.70">0.70 - No Radiography</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Corrosion Allowance (CA) - inches</Label>
              <Input
                type="number"
                step="0.001"
                value={mawpInputs.corrosionAllowance}
                onChange={(e) => setMawpInputs({ ...mawpInputs, corrosionAllowance: e.target.value })}
              />
            </div>

            <Button onClick={calculateMAWP} className="w-full">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate MAWP
            </Button>

            {mawpResult && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Formula: MAWP = SE(t-CA)/(R+0.6(t-CA))</p>
                <p className="text-2xl font-bold text-blue-700">
                  MAWP: {mawpResult} psig
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Remaining Life Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Remaining Life Assessment</CardTitle>
          <CardDescription>Calculate remaining service life based on corrosion rate analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Current Thickness (inches)</Label>
              <Input
                type="number"
                step="0.0001"
                value={remainingLifeInputs.currentThickness}
                onChange={(e) => setRemainingLifeInputs({ ...remainingLifeInputs, currentThickness: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Required Thickness (inches)</Label>
              <Input
                type="number"
                step="0.0001"
                value={remainingLifeInputs.requiredThickness}
                onChange={(e) => setRemainingLifeInputs({ ...remainingLifeInputs, requiredThickness: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Corrosion Rate (mils/year)</Label>
              <Input
                type="number"
                step="0.1"
                value={remainingLifeInputs.corrosionRate}
                onChange={(e) => setRemainingLifeInputs({ ...remainingLifeInputs, corrosionRate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Safety Factor</Label>
              <Input
                type="number"
                step="0.1"
                value={remainingLifeInputs.safetyFactor}
                onChange={(e) => setRemainingLifeInputs({ ...remainingLifeInputs, safetyFactor: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={calculateRemainingLife} className="mb-4">
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Remaining Life
          </Button>

          {remainingLifeResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-600 mb-1">Estimated Remaining Life</p>
                <p className="text-2xl font-bold text-orange-700">{remainingLifeResult} years</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Next Inspection Due</p>
                <p className="text-2xl font-bold text-purple-700">{nextInspection} years</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-2xl font-bold text-green-700">
                  {parseFloat(remainingLifeResult) > 10 ? "GOOD" : parseFloat(remainingLifeResult) > 5 ? "MONITOR" : "CRITICAL"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saveMutation.isPending} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {saveMutation.isPending ? "Saving..." : "Save All Calculations"}
        </Button>
      </div>
    </div>
  );
}

