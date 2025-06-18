import api from "../services/api";

function hexToHSL(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h = h * 60;
  }

  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

let plantColorMap = null;

export async function getPowerPlantColors() {
    console.log("🚀 getPowerPlantColors triggered");
  if (plantColorMap && Object.keys(plantColorMap).length > 0) return plantColorMap;

  const res = await api.get("/reference/pp_info");
  const data = res.data || [];

  const groupedByCompany = {};

  data.forEach(item => {
    const color = /^#[0-9A-F]{6}$/i.test(item.color) ? item.color : '#888888';
    if (!groupedByCompany[item.company_id]) {
      groupedByCompany[item.company_id] = {
        baseColor: color,
        plants: []
      };
    }
    groupedByCompany[item.company_id].plants.push(item.power_plant_id);
  });

  const tempColorMap = {};

  Object.values(groupedByCompany).forEach(({ baseColor, plants }) => {
    const [h, s, baseL] = hexToHSL(baseColor);
    const step = 15;

    plants.sort();

    plants.forEach((plantId, i) => {
      const offset = i - Math.floor(plants.length / 2);
      let lightness = Math.max(20, Math.min(85, baseL + offset * step));
      let shade = hslToHex(h, s, lightness);

      // Avoid banned color by shifting to a darker shade
      if (shade.toLowerCase() === "#05ffcd") {
        lightness = Math.max(20, lightness - 10); // shift darker
        shade = hslToHex(h, s, lightness);
      }

      tempColorMap[plantId] = shade;
    });


  });

  plantColorMap = tempColorMap;
  return plantColorMap;
}
