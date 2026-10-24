/**
 * AGENTROPOLIS-WORLDQ-ASTRA — MATH54 spatial quantization adapter
 *
 * Adapts @agentropolis/math54 to WORLDQ-ASTRA's mission control scene.
 */

import {
  quantizePosition,
  quantizeCameraTarget,
  worldToCellIndex,
  worldToFloorIndex,
  SPATIAL_QUANTUM_V1,
} from '@agentropolis/math54';

/**
 * Quantize camera targets for WORLDQ layer transitions.
 * @param {Record<string, [number, number, number]>} cameraTargets
 * @param {boolean} [reducedMotion=false]
 * @returns {Record<string, [number, number, number]>}
 */
export function quantizeLayerCameraTargets(cameraTargets, reducedMotion = false) {
  const out = {};
  for (const [layer, target] of Object.entries(cameraTargets)) {
    out[layer] = quantizeCameraTarget(target, reducedMotion);
  }
  return out;
}

/**
 * Quantize agent node positions for traffic arcs.
 * @param {Array<{x: number, z: number, y?: number}>} nodes
 * @param {number} [cellSize=1]
 * @returns {Array<{cellX: number, cellY: number, cellZ: number}>}
 */
export function quantizeAgentNodes(nodes, cellSize = 1) {
  return nodes.map((n) => quantizePosition([n.x, n.y ?? 0, n.z], cellSize));
}

/**
 * Quantize globe node positions.
 * @param {Array<{x: number, y: number, z: number}>} nodes
 * @param {number} [cellSize=1]
 * @returns {Array<{cellX: number, cellY: number, cellZ: number}>}
 */
export function quantizeGlobeNodes(nodes, cellSize = 1) {
  return nodes.map((n) => quantizePosition([n.x, n.y, n.z], cellSize));
}

/**
 * Quantize city node positions for WORLDQ/CITY layers.
 * @param {Array<{pos: [number, number, number]}>} nodes
 * @param {number} [cellSize=1]
 * @returns {Array<{cellPos: [number, number, number]}>}
 */
export function quantizeCityNodes(nodes, cellSize = 1) {
  return nodes.map((n) => ({
    cellPos: quantizePosition(n.pos, cellSize),
  }));
}
