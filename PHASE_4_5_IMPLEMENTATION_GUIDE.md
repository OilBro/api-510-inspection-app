# Phase 4 & 5 Implementation Guide
## Corrosion Rate Trend Charts + Component Hierarchy

**Status:** Database schema complete, backend and UI implementation pending

---

## Phase 4: Corrosion Rate Trend Charts

### 4.1 Backend: Trend Analysis Router

**File:** `server/trendAnalysisRouter.ts`

Create tRPC procedures:

```typescript
import { router, protectedProcedure } from "./trpc";
import { z } from "zod";
import { getDb } from "./db";
import { inspections, componentCalculations } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const trendAnalysisRouter = router({
  // Get all inspections for a vessel (chronologically linked)
  getVesselInspectionHistory: protectedProcedure
    .input(z.object({
      vesselTagNumber: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      if (!db) throw new Error("Database not available");
      
      const allInspections = await db
        .select()
        .from(inspections)
        .where(
          and(
            eq(inspections.userId, ctx.user.id),
            eq(inspections.vesselTagNumber, input.vesselTagNumber)
          )
        )
        .orderBy(desc(inspections.inspectionDate));
      
      return allInspections;
    }),
  
  // Get thickness trend data for a specific component across inspections
  getComponentThicknessTrend: protectedProcedure
    .input(z.object({
      vesselTagNumber: z.string(),
      componentName: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      if (!db) throw new Error("Database not available");
      
      // Join inspections with componentCalculations
      const trendData = await db
        .select({
          inspectionDate: inspections.inspectionDate,
          inspectionId: inspections.id,
          actualThickness: componentCalculations.actualThickness,
          minimumThickness: componentCalculations.minimumThickness,
          corrosionRateLongTerm: componentCalculations.corrosionRateLongTerm,
          corrosionRateShortTerm: componentCalculations.corrosionRateShortTerm,
          governingRateType: componentCalculations.governingRateType,
          remainingLife: componentCalculations.remainingLife,
        })
        .from(inspections)
        .innerJoin(
          componentCalculations,
          eq(inspections.id, componentCalculations.reportId)
        )
        .where(
          and(
            eq(inspections.userId, ctx.user.id),
            eq(inspections.vesselTagNumber, input.vesselTagNumber),
            eq(componentCalculations.componentName, input.componentName)
          )
        )
        .orderBy(inspections.inspectionDate);
      
      return trendData;
    }),
  
  // Calculate corrosion rate acceleration
  getCorrosionRateAcceleration: protectedProcedure
    .input(z.object({
      vesselTagNumber: z.string(),
      componentName: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      if (!db) throw new Error("Database not available");
      
      const trendData = await db
        .select({
          inspectionDate: inspections.inspectionDate,
          corrosionRate: componentCalculations.corrosionRate,
          governingRateType: componentCalculations.governingRateType,
        })
        .from(inspections)
        .innerJoin(
          componentCalculations,
          eq(inspections.id, componentCalculations.reportId)
        )
        .where(
          and(
            eq(inspections.userId, ctx.user.id),
            eq(inspections.vesselTagNumber, input.vesselTagNumber),
            eq(componentCalculations.componentName, input.componentName)
          )
        )
        .orderBy(inspections.inspectionDate);
      
      // Calculate rate-of-change between consecutive inspections
      const accelerations = [];
      for (let i = 1; i < trendData.length; i++) {
        const prev = trendData[i - 1];
        const curr = trendData[i];
        
        const prevRate = parseFloat(prev.corrosionRate || '0');
        const currRate = parseFloat(curr.corrosionRate || '0');
        
        const acceleration = ((currRate - prevRate) / prevRate) * 100; // Percentage change
        const isCritical = Math.abs(acceleration) > 50; // >50% change is critical
        
        accelerations.push({
          fromDate: prev.inspectionDate,
          toDate: curr.inspectionDate,
          fromRate: prevRate,
          toRate: currRate,
          accelerationPercent: acceleration,
          isCritical,
          trend: acceleration > 0 ? 'accelerating' : 'decelerating',
        });
      }
      
      return accelerations;
    }),
});
```

**Integration:** Add to `server/routers.ts`:
```typescript
import { trendAnalysisRouter } from "./trendAnalysisRouter";

export const appRouter = router({
  // ... existing routers
  trendAnalysis: trendAnalysisRouter,
});
```

### 4.2 Frontend: Trend Chart Component

**File:** `client/src/components/TrendChart.tsx`

Install Chart.js:
```bash
pnpm add chart.js react-chartjs-2
```

Create chart component:

```typescript
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendChartProps {
  data: {
    inspectionDate: Date | null;
    actualThickness: string | null;
    minimumThickness: string | null;
    corrosionRateLongTerm: string | null;
    corrosionRateShortTerm: string | null;
    governingRateType: string | null;
  }[];
  componentName: string;
}

export function TrendChart({ data, componentName }: TrendChartProps) {
  const labels = data.map(d => 
    d.inspectionDate ? new Date(d.inspectionDate).toLocaleDateString() : 'Unknown'
  );
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Actual Thickness',
        data: data.map(d => parseFloat(d.actualThickness || '0')),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: true,
      },
      {
        label: 'Minimum Thickness',
        data: data.map(d => parseFloat(d.minimumThickness || '0')),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderDash: [5, 5],
        tension: 0.1,
        fill: false,
      },
    ],
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Thickness Trend - ${componentName}`,
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            const index = context.dataIndex;
            const point = data[index];
            return [
              `LT Rate: ${point.corrosionRateLongTerm || 'N/A'} in/yr`,
              `ST Rate: ${point.corrosionRateShortTerm || 'N/A'} in/yr`,
              `Governing: ${point.governingRateType || 'N/A'}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Thickness (inches)',
        },
      },
    },
  };
  
  return <Line data={chartData} options={options} />;
}
```

### 4.3 Frontend: Trend Analysis Page

**File:** `client/src/pages/TrendAnalysis.tsx`

```typescript
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendChart } from "@/components/TrendChart";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

export default function TrendAnalysis() {
  const params = useParams<{ vesselTagNumber: string; componentName: string }>();
  
  const { data: trendData } = trpc.trendAnalysis.getComponentThicknessTrend.useQuery({
    vesselTagNumber: params.vesselTagNumber!,
    componentName: params.componentName!,
  });
  
  const { data: accelerations } = trpc.trendAnalysis.getCorrosionRateAcceleration.useQuery({
    vesselTagNumber: params.vesselTagNumber!,
    componentName: params.componentName!,
  });
  
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Corrosion Rate Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {trendData && <TrendChart data={trendData} componentName={params.componentName!} />}
          
          {/* Acceleration Alerts */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">Corrosion Rate Changes</h3>
            {accelerations?.map((accel, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  accel.isCritical ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {accel.isCritical && <AlertTriangle className="h-5 w-5 text-red-600" />}
                  {accel.trend === 'accelerating' ? (
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  )}
                  <span className="font-semibold">
                    {accel.accelerationPercent > 0 ? '+' : ''}
                    {accel.accelerationPercent.toFixed(1)}% change
                  </span>
                  <Badge variant={accel.isCritical ? 'destructive' : 'default'}>
                    {accel.trend}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  From {accel.fromRate.toFixed(4)} in/yr to {accel.toRate.toFixed(4)} in/yr
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Add route to `App.tsx`:**
```typescript
<Route path="/trend-analysis/:vesselTagNumber/:componentName" component={TrendAnalysis} />
```

---

## Phase 5: Component Hierarchy

### 5.1 Backend: Hierarchy Router

**File:** `server/hierarchyRouter.ts`

```typescript
import { router, protectedProcedure } from "./trpc";
import { z } from "zod";
import { getDb } from "./db";
import { componentCalculations } from "../drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";

export const hierarchyRouter = router({
  // Get component tree for an inspection
  getComponentTree: protectedProcedure
    .input(z.object({
      reportId: z.string(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      if (!db) throw new Error("Database not available");
      
      const allComponents = await db
        .select()
        .from(componentCalculations)
        .where(eq(componentCalculations.reportId, input.reportId));
      
      // Build tree structure
      const buildTree = (parentId: string | null = null): any[] => {
        return allComponents
          .filter(c => c.parentComponentId === parentId)
          .map(component => ({
            ...component,
            children: buildTree(component.id),
          }));
      };
      
      return buildTree(null);
    }),
  
  // Get life-limiting component (shortest remaining life)
  getLifeLimitingComponent: protectedProcedure
    .input(z.object({
      reportId: z.string(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      if (!db) throw new Error("Database not available");
      
      const components = await db
        .select()
        .from(componentCalculations)
        .where(eq(componentCalculations.reportId, input.reportId));
      
      // Find component with minimum remaining life
      let minLife = Infinity;
      let limitingComponent = null;
      
      for (const comp of components) {
        const rl = parseFloat(comp.remainingLife || '999');
        if (rl < minLife) {
          minLife = rl;
          limitingComponent = comp;
        }
      }
      
      return limitingComponent;
    }),
});
```

### 5.2 Frontend: Component Tree Component

**File:** `client/src/components/ComponentTree.tsx`

```typescript
import { ChevronRight, ChevronDown, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface TreeNode {
  id: string;
  componentName: string;
  componentType: string;
  remainingLife: string | null;
  dataQualityStatus: string | null;
  children: TreeNode[];
}

interface ComponentTreeProps {
  data: TreeNode[];
  onSelectComponent?: (component: TreeNode) => void;
}

function TreeNode({ node, level = 0, onSelect }: { node: TreeNode; level?: number; onSelect?: (node: TreeNode) => void }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  
  const remainingLife = parseFloat(node.remainingLife || '999');
  const isCritical = remainingLife < 5;
  const hasDataIssue = node.dataQualityStatus && node.dataQualityStatus !== 'good';
  
  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 hover:bg-accent rounded-md cursor-pointer`}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        onClick={() => {
          if (hasChildren) setIsExpanded(!isExpanded);
          if (onSelect) onSelect(node);
        }}
      >
        {hasChildren && (
          isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
        )}
        {!hasChildren && <div className="w-4" />}
        
        {isCritical ? (
          <AlertTriangle className="h-4 w-4 text-red-600" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-600" />
        )}
        
        <span className="font-medium">{node.componentName}</span>
        
        <Badge variant="outline" className="text-xs">
          {node.componentType}
        </Badge>
        
        {remainingLife < 999 && (
          <span className={`text-sm ${isCritical ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
            RL: {remainingLife.toFixed(1)} yrs
          </span>
        )}
        
        {hasDataIssue && (
          <Badge variant="destructive" className="text-xs">
            Data Issue
          </Badge>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} level={level + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ComponentTree({ data, onSelectComponent }: ComponentTreeProps) {
  return (
    <div className="border rounded-lg p-4">
      {data.map(node => (
        <TreeNode key={node.id} node={node} onSelect={onSelectComponent} />
      ))}
    </div>
  );
}
```

### 5.3 Frontend: Hierarchy Page

**File:** `client/src/pages/ComponentHierarchy.tsx`

```typescript
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComponentTree } from "@/components/ComponentTree";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default function ComponentHierarchy() {
  const params = useParams<{ reportId: string }>();
  
  const { data: tree } = trpc.hierarchy.getComponentTree.useQuery({
    reportId: params.reportId!,
  });
  
  const { data: limitingComponent } = trpc.hierarchy.getLifeLimitingComponent.useQuery({
    reportId: params.reportId!,
  });
  
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Component Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          {limitingComponent && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-semibold">Life-Limiting Component:</span>
                <Badge variant="destructive">{limitingComponent.componentName}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Remaining Life: {parseFloat(limitingComponent.remainingLife || '0').toFixed(1)} years
              </p>
            </div>
          )}
          
          {tree && <ComponentTree data={tree} />}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Add route to `App.tsx`:**
```typescript
<Route path="/hierarchy/:reportId" component={ComponentHierarchy} />
```

---

## Implementation Checklist

### Phase 4: Trend Charts
- [ ] Create `server/trendAnalysisRouter.ts`
- [ ] Add trendAnalysisRouter to `server/routers.ts`
- [ ] Install Chart.js: `pnpm add chart.js react-chartjs-2`
- [ ] Create `client/src/components/TrendChart.tsx`
- [ ] Create `client/src/pages/TrendAnalysis.tsx`
- [ ] Add route to `client/src/App.tsx`
- [ ] Test with multi-inspection data

### Phase 5: Component Hierarchy
- [ ] Create `server/hierarchyRouter.ts`
- [ ] Add hierarchyRouter to `server/routers.ts`
- [ ] Create `client/src/components/ComponentTree.tsx`
- [ ] Create `client/src/pages/ComponentHierarchy.tsx`
- [ ] Add route to `client/src/App.tsx`
- [ ] Update component creation to set hierarchy fields
- [ ] Test tree navigation and life-limiting analysis

---

## Testing Scenarios

### Trend Analysis Testing
1. Create multiple inspections for same vessel (different dates)
2. Verify thickness trend chart displays correctly
3. Check LT vs ST rate visualization
4. Confirm acceleration alerts trigger at >50% change
5. Test with vessels showing accelerated corrosion

### Component Hierarchy Testing
1. Create components with parent-child relationships
2. Verify tree structure displays correctly
3. Check expand/collapse functionality
4. Confirm life-limiting component identification
5. Test data quality indicators in tree

---

## Success Metrics

**Phase 4 Complete When:**
- Multi-inspection comparison page functional
- Thickness degradation charts render correctly
- LT vs ST rates visualized on dual-axis chart
- Acceleration detection alerts working
- >50% rate change triggers critical alert

**Phase 5 Complete When:**
- Component tree navigation functional
- Parent-child relationships display correctly
- Life-limiting component identified automatically
- CML-level data grouped under parent components
- Tree shows rollup statistics at parent levels

---

## Estimated Implementation Time

- **Phase 4 Backend:** 4-6 hours
- **Phase 4 Frontend:** 6-8 hours
- **Phase 5 Backend:** 3-4 hours
- **Phase 5 Frontend:** 5-7 hours
- **Testing & Integration:** 4-6 hours

**Total:** 22-31 hours (3-4 days of focused work)

---

## Next Steps After Phase 4 & 5

1. **Mobile PWA** - Offline-first architecture for field inspections
2. **RBI Integration** - Risk-Based Inspection scoring and optimization
3. **3D Visualization** - WebGL vessel models with thickness heat maps
4. **API Integration** - Connect to plant maintenance systems (SAP, Maximo)
