export interface DistrictImage {
  id: string;
  name: string;
  subtitle: string;
  accent: string;
  image: string;
  dockedItems?: string[];
}

function svgImage(code: string, name: string, accent: string): string {
  const safeName = name.replace(/&/g, '&amp;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="g" cx="50%" cy="42%" r="68%">
      <stop offset="0%" stop-color="${accent}" stop-opacity=".32"/>
      <stop offset="64%" stop-color="#061016" stop-opacity=".96"/>
      <stop offset="100%" stop-color="#02070b"/>
    </radialGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="512" height="512" rx="72" fill="url(#g)"/>
  <circle cx="256" cy="224" r="132" fill="none" stroke="${accent}" stroke-width="7" opacity=".92" filter="url(#glow)"/>
  <path d="M118 338 Q256 276 394 338" fill="none" stroke="${accent}" stroke-width="4" opacity=".45"/>
  <text x="256" y="248" text-anchor="middle" font-family="Arial,sans-serif" font-size="82" font-weight="800" fill="#efffff">${code}</text>
  <text x="256" y="402" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" font-weight="700" letter-spacing="2" fill="${accent}">${safeName}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

// GLOBE seeds only top-level districts.
// Products, apps, runtimes, media surfaces, security systems, and docked worlds
// belong INSIDE their parent district and must not become peer globe nodes.
const raw = [
  ['base', 'BASE', 'Identity Plaza', '#ff3d67', 'B'],
  ['parallax', 'PARALLAX', 'Open protocols / WebMCP', '#35f0df', 'P'],
  ['atg-mcp', 'ATG MCP', 'Agent language + protocol district', '#7b61ff', 'ATG'],
  ['hermes-city', 'HERMES CITY', 'Coordination district', '#5b7cff', 'HC'],
  ['creator-core', 'CREATOR CORE', 'Creator + construction district', '#ff9d3d', 'CC'],
  ['docking', 'DOCKING DISTRICT', 'External worlds + docked projects', '#1ee4ff', 'DOCK', ['ARUBIK WORLD']],
] as const;

export const districtImages: DistrictImage[] = raw.map((entry) => {
  const [id, name, subtitle, accent, code, dockedItems] = entry;
  return {
    id,
    name,
    subtitle,
    accent,
    image: svgImage(code, name, accent),
    ...(dockedItems ? { dockedItems: [...dockedItems] } : {}),
  };
});
