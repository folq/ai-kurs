/**
 * PCA dimensionality reduction via power iteration.
 * Reduces high-dimensional embeddings (e.g. 1536-d) to 3D for visualization.
 *
 * All vectors are L2-normalized before PCA so that the 3D layout reflects
 * cosine similarity (direction only), matching the distance metric used by
 * sqlite-vec for nearest-neighbor search.
 */
export type Pca3dPoint = { x: number; y: number; z: number };

function l2Normalize(vec: number[]): number[] {
  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm);
  if (norm === 0) return vec;
  return vec.map((v) => v / norm);
}

/**
 * Fits 3D PCA on `embeddings` and returns normalized movie points plus `project` for
 * mapping any same-dimension vector into the same space (e.g. a search query).
 */
export function fitPca3d(embeddings: number[][]): {
  points: Pca3dPoint[];
  project: (query: number[]) => Pca3dPoint;
} {
  const n = embeddings.length;
  if (n === 0) {
    return {
      points: [],
      project: () => ({ x: 0, y: 0, z: 0 }),
    };
  }
  const d = embeddings[0].length;

  const normed = embeddings.map(l2Normalize);

  const means = new Float64Array(d);
  for (const row of normed) {
    for (let j = 0; j < d; j++) means[j] += row[j];
  }
  for (let j = 0; j < d; j++) means[j] /= n;

  const centered: number[][] = normed.map((row) =>
    row.map((val, j) => val - means[j]),
  );

  const components: number[][] = [];
  const deflated = centered.map((row) => [...row]);

  for (let comp = 0; comp < 3; comp++) {
    let vec = Array.from({ length: d }, () => Math.random() - 0.5);
    let norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    vec = vec.map((v) => v / norm);

    for (let iter = 0; iter < 100; iter++) {
      const proj = deflated.map((row) =>
        row.reduce((s, v, j) => s + v * vec[j], 0),
      );
      const newVec = new Float64Array(d);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < d; j++) {
          newVec[j] += deflated[i][j] * proj[i];
        }
      }
      norm = Math.sqrt(newVec.reduce((s, v) => s + v * v, 0));
      if (norm === 0) break;
      vec = Array.from(newVec, (v) => v / norm);
    }

    components.push(vec);

    const projections = deflated.map((row) =>
      row.reduce((s, v, j) => s + v * vec[j], 0),
    );
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < d; j++) {
        deflated[i][j] -= projections[i] * vec[j];
      }
    }
  }

  const points = centered.map((row) => ({
    x: row.reduce((s, v, j) => s + v * components[0][j], 0),
    y: row.reduce((s, v, j) => s + v * components[1][j], 0),
    z: row.reduce((s, v, j) => s + v * components[2][j], 0),
  }));

  let maxAbs = 0;
  for (const p of points) {
    maxAbs = Math.max(maxAbs, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));
  }
  const pcaScale = maxAbs > 0 ? maxAbs : 1;
  for (const p of points) {
    p.x /= pcaScale;
    p.y /= pcaScale;
    p.z /= pcaScale;
  }

  const project = (query: number[]): Pca3dPoint => {
    if (query.length !== d) {
      return { x: 0, y: 0, z: 0 };
    }
    const q = l2Normalize(query);
    let x = 0;
    let y = 0;
    let z = 0;
    for (let j = 0; j < d; j++) {
      const c = q[j] - means[j];
      x += c * components[0][j];
      y += c * components[1][j];
      z += c * components[2][j];
    }
    return { x: x / pcaScale, y: y / pcaScale, z: z / pcaScale };
  };

  return { points, project };
}

export function pca3d(embeddings: number[][]): Pca3dPoint[] {
  return fitPca3d(embeddings).points;
}
