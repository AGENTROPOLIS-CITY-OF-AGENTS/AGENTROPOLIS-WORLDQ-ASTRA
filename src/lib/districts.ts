export interface DistrictImage {
  id: string;
  name: string;
  subtitle: string;
  accent: string;
  image: string;
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
  <text x="256" y="248" text-anchor="middle" font-family="Arial,sans-serif" font-size="92" font-weight="800" fill="#efffff">${code}</text>
  <text x="256" y="402" text-anchor="middle" font-family="Arial,sans-serif" font-size="26" font-weight="700" letter-spacing="2" fill="${accent}">${safeName}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const raw = [
  ['base', 'BASE', 'Identity Plaza', '#ff3d67', 'B'],
  ['parallax', 'PARALLAX', 'WebMCP Challenge', '#35f0df', 'P'],
  ['atg-mcp', 'ATG MCP', 'Language', '#7b61ff', 'ATG'],
  ['hermes-city', 'HERMES CITY', 'Coordination', '#5b7cff', 'HC'],
  ['hermes-skin', 'HERMES SKIN', 'Runtime', '#a25bff', 'HS'],
  ['botbae', 'BOTBAE', 'Operator', '#ff3d9a', 'BB'],
  ['creator-core', 'CREATOR CORE', 'Creators', '#ff9d3d', 'CC'],
  ['gdp', 'GDP', 'CHAOS Gaming', '#ff4b31', 'GDP'],
  ['atv-socials', 'ATV SOCIALS', 'Media', '#b14cff', 'ATV'],
  ['neteru-ott', 'NETERU-OTT', 'Entertainment', '#ffa62b', 'NO'],
  ['grinder', 'GRINDER SYNDICATE', 'Adult', '#ff285d', 'GS'],
  ['security-54t', '54T SECURITY', 'Risk + Audit', '#d95cff', '54T'],
  ['arubik', 'ARUBIK WORLD', 'Neurodivergent', '#1ee4ff', 'AW'],
  ['agentwikis', 'AGENTWIKIS', 'Knowledge', '#21d8ff', 'W'],
] as const;

export const districtImages: DistrictImage[] = raw.map(([id, name, subtitle, accent, code]) => ({
  id,
  name,
  subtitle,
  accent,
  image: svgImage(code, name, accent),
}));
