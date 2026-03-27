/**
 * PCA dimensionality reduction via power iteration.
 * Reduces high-dimensional embeddings (e.g. 1536-d) to 3D for visualization.
 */
export function pca3d(
  embeddings: number[][],
): { x: number; y: number; z: number }[] {
  const n = embeddings.length;
  if (n === 0) return [];
  const d = embeddings[0].length;

  const means = new Float64Array(d);
  for (const row of embeddings) {
    for (let j = 0; j < d; j++) means[j] += row[j];
  }
  for (let j = 0; j < d; j++) means[j] /= n;

  const centered: number[][] = embeddings.map((row) =>
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
  if (maxAbs > 0) {
    for (const p of points) {
      p.x /= maxAbs;
      p.y /= maxAbs;
      p.z /= maxAbs;
    }
  }

  return points;
}
