export type VignetteStyle = 'none' | 'soft' | 'medium' | 'strong';

interface VignetteConfig {
  opacity: number;
  blur: number;
  spread: number;
}

const vignetteConfigs: Record<VignetteStyle, VignetteConfig> = {
  none: { opacity: 0, blur: 0, spread: 0 },
  soft: { opacity: 0.1, blur: 20, spread: 40 },
  medium: { opacity: 0.2, blur: 30, spread: 60 },
  strong: { opacity: 0.3, blur: 40, spread: 80 },
};

export function generateVignetteStyle(style: VignetteStyle): string {
  if (style === 'none') return '';

  const config = vignetteConfigs[style];
  return `
    box-shadow: inset 0 0 ${config.spread}px ${config.blur}px rgba(0,0,0,${config.opacity});
  `;
}

export function applyVignetteToNode(node: HTMLElement, style: VignetteStyle): void {
  const vignetteStyle = generateVignetteStyle(style);
  if (vignetteStyle) {
    node.style.cssText += vignetteStyle;
  }
}