import chroma from 'chroma-js';

/**
 * Generate N distinct shades from a base color
 * @param {string} baseColor - hex color (e.g., #2ca02c)
 * @param {number} count - number of variations needed
 */
export function generateShadesFromBase(baseColor, count) {
  const scale = chroma.scale([chroma(baseColor).brighten(0.5), baseColor, chroma(baseColor).darken(0.5)])
    .mode('lab')
    .colors(count);
  return scale;
}

/**
 * Assign each power plant a unique shade based on its company's base color
 * @param {Array} powerPlants - [{ power_plant_id, company_id, company_color }]
 * @returns {Object} power_plant_id => shadeHex
 */
export function assignPowerPlantColors(powerPlants) {
  const grouped = {};

  // Group power plants by company
  powerPlants.forEach(pp => {
    if (!grouped[pp.company_id]) grouped[pp.company_id] = [];
    grouped[pp.company_id].push(pp);
  });

  const result = {};

  // For each company, generate shades and assign to its plants
  Object.entries(grouped).forEach(([companyId, plants]) => {
    const baseColor = plants[0].company_color || '#999999';
    const shades = generateShadesFromBase(baseColor, plants.length);

    plants.forEach((plant, idx) => {
      result[plant.power_plant_id] = shades[idx];
    });
  });

  return result;
}
