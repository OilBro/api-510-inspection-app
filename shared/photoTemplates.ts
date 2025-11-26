export interface PhotoRequirement {
  id: string;
  caption: string;
  section: string;
  description: string;
  required: boolean;
}

export interface PhotoTemplate {
  id: string;
  name: string;
  vesselType: string;
  description: string;
  requirements: PhotoRequirement[];
}

export const PHOTO_TEMPLATES: PhotoTemplate[] = [
  {
    id: 'vertical-vessel',
    name: 'Vertical Vessel Standard Views',
    vesselType: 'vertical',
    description: 'Standard photo documentation for vertical pressure vessels',
    requirements: [
      {
        id: 'nameplate',
        caption: 'Nameplate',
        section: 'General',
        description: 'Clear photo of vessel nameplate showing all identification data',
        required: true,
      },
      {
        id: 'general-north',
        caption: 'General View - North Side',
        section: 'General',
        description: 'Overall view of vessel from north side',
        required: true,
      },
      {
        id: 'general-south',
        caption: 'General View - South Side',
        section: 'General',
        description: 'Overall view of vessel from south side',
        required: true,
      },
      {
        id: 'general-east',
        caption: 'General View - East Side',
        section: 'General',
        description: 'Overall view of vessel from east side',
        required: true,
      },
      {
        id: 'general-west',
        caption: 'General View - West Side',
        section: 'General',
        description: 'Overall view of vessel from west side',
        required: true,
      },
      {
        id: 'top-head',
        caption: 'Top Head',
        section: 'Heads',
        description: 'Close-up view of top head including welds',
        required: true,
      },
      {
        id: 'bottom-head',
        caption: 'Bottom Head',
        section: 'Heads',
        description: 'Close-up view of bottom head including welds',
        required: true,
      },
      {
        id: 'shell-condition',
        caption: 'Shell Condition',
        section: 'Shell',
        description: 'Representative photos of shell condition, corrosion, or damage',
        required: true,
      },
      {
        id: 'nozzles',
        caption: 'Nozzles and Connections',
        section: 'Nozzles',
        description: 'Photos of all nozzles, manways, and connections',
        required: true,
      },
      {
        id: 'foundation',
        caption: 'Foundation and Supports',
        section: 'Foundation',
        description: 'Foundation, skirt, and support structure',
        required: true,
      },
      {
        id: 'appurtenances',
        caption: 'Appurtenances',
        section: 'Appurtenances',
        description: 'Ladders, platforms, insulation, piping',
        required: false,
      },
      {
        id: 'defects',
        caption: 'Defects or Damage',
        section: 'General',
        description: 'Any areas of concern, corrosion, cracks, or damage',
        required: false,
      },
    ],
  },
  {
    id: 'horizontal-vessel',
    name: 'Horizontal Vessel Standard Views',
    vesselType: 'horizontal',
    description: 'Standard photo documentation for horizontal pressure vessels',
    requirements: [
      {
        id: 'nameplate',
        caption: 'Nameplate',
        section: 'General',
        description: 'Clear photo of vessel nameplate showing all identification data',
        required: true,
      },
      {
        id: 'general-front',
        caption: 'General View - Front',
        section: 'General',
        description: 'Overall view of vessel from front',
        required: true,
      },
      {
        id: 'general-back',
        caption: 'General View - Back',
        section: 'General',
        description: 'Overall view of vessel from back',
        required: true,
      },
      {
        id: 'general-top',
        caption: 'General View - Top',
        section: 'General',
        description: 'Overall view of vessel from top',
        required: true,
      },
      {
        id: 'general-bottom',
        caption: 'General View - Bottom',
        section: 'General',
        description: 'Overall view of vessel from bottom (if accessible)',
        required: false,
      },
      {
        id: 'left-head',
        caption: 'Left Head',
        section: 'Heads',
        description: 'Close-up view of left head including welds',
        required: true,
      },
      {
        id: 'right-head',
        caption: 'Right Head',
        section: 'Heads',
        description: 'Close-up view of right head including welds',
        required: true,
      },
      {
        id: 'shell-top',
        caption: 'Shell - Top Quadrant',
        section: 'Shell',
        description: 'Top portion of shell showing condition',
        required: true,
      },
      {
        id: 'shell-bottom',
        caption: 'Shell - Bottom Quadrant',
        section: 'Shell',
        description: 'Bottom portion of shell showing condition',
        required: true,
      },
      {
        id: 'nozzles',
        caption: 'Nozzles and Connections',
        section: 'Nozzles',
        description: 'Photos of all nozzles, manways, and connections',
        required: true,
      },
      {
        id: 'saddles',
        caption: 'Saddles and Supports',
        section: 'Foundation',
        description: 'Saddle supports and foundation',
        required: true,
      },
      {
        id: 'appurtenances',
        caption: 'Appurtenances',
        section: 'Appurtenances',
        description: 'Platforms, insulation, piping, instrumentation',
        required: false,
      },
      {
        id: 'defects',
        caption: 'Defects or Damage',
        section: 'General',
        description: 'Any areas of concern, corrosion, cracks, or damage',
        required: false,
      },
    ],
  },
  {
    id: 'spherical-vessel',
    name: 'Spherical Vessel Standard Views',
    vesselType: 'spherical',
    description: 'Standard photo documentation for spherical pressure vessels',
    requirements: [
      {
        id: 'nameplate',
        caption: 'Nameplate',
        section: 'General',
        description: 'Clear photo of vessel nameplate showing all identification data',
        required: true,
      },
      {
        id: 'general-ne',
        caption: 'General View - Northeast Quadrant',
        section: 'General',
        description: 'Overall view from northeast',
        required: true,
      },
      {
        id: 'general-nw',
        caption: 'General View - Northwest Quadrant',
        section: 'General',
        description: 'Overall view from northwest',
        required: true,
      },
      {
        id: 'general-se',
        caption: 'General View - Southeast Quadrant',
        section: 'General',
        description: 'Overall view from southeast',
        required: true,
      },
      {
        id: 'general-sw',
        caption: 'General View - Southwest Quadrant',
        section: 'General',
        description: 'Overall view from southwest',
        required: true,
      },
      {
        id: 'equator-weld',
        caption: 'Equator Weld',
        section: 'Shell',
        description: 'Equatorial weld seam condition',
        required: true,
      },
      {
        id: 'meridional-welds',
        caption: 'Meridional Welds',
        section: 'Shell',
        description: 'Representative meridional weld seams',
        required: true,
      },
      {
        id: 'nozzles',
        caption: 'Nozzles and Connections',
        section: 'Nozzles',
        description: 'Photos of all nozzles and connections',
        required: true,
      },
      {
        id: 'support-columns',
        caption: 'Support Columns',
        section: 'Foundation',
        description: 'Column supports and connections to sphere',
        required: true,
      },
      {
        id: 'foundation',
        caption: 'Foundation',
        section: 'Foundation',
        description: 'Foundation and base details',
        required: true,
      },
      {
        id: 'appurtenances',
        caption: 'Appurtenances',
        section: 'Appurtenances',
        description: 'Stairs, platforms, piping, instrumentation',
        required: false,
      },
      {
        id: 'defects',
        caption: 'Defects or Damage',
        section: 'General',
        description: 'Any areas of concern, corrosion, cracks, or damage',
        required: false,
      },
    ],
  },
];

export function getTemplateById(id: string): PhotoTemplate | undefined {
  return PHOTO_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByVesselType(vesselType: string): PhotoTemplate[] {
  return PHOTO_TEMPLATES.filter(t => t.vesselType === vesselType);
}

