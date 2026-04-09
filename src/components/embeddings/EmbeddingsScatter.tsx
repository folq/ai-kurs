import { Html, Line, OrbitControls } from "@react-three/drei";
import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import { Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";

type MoviePoint = {
  id: number;
  title: string;
  genre: string;
  rating: number | null;
  year: number | null;
  type: string;
  x: number;
  y: number;
  z: number;
};

const GENRE_COLORS: Record<string, string> = {
  Drama: "#4D988A",
  Comedy: "#E36147",
  Action: "#DC583E",
  "Sci-Fi": "#7690FB",
  Horror: "#B93116",
  Romance: "#EC8773",
  Thriller: "#19564A",
  Animation: "#FFD967",
  Documentary: "#429CDA",
  Fantasy: "#91A6FC",
};

function getGenreColor(genre: string): string {
  const primary = genre.split(",")[0]?.trim() || genre;
  return GENRE_COLORS[primary] || "#8A8A8A";
}

function LabeledLineSegment({
  from,
  to,
  distanceLabel,
  color,
  opacity = 0.45,
}: {
  from: [number, number, number];
  to: [number, number, number];
  distanceLabel: string;
  color: string;
  opacity?: number;
}) {
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
    (from[2] + to[2]) / 2,
  ];
  return (
    <>
      <Line
        points={[from, to]}
        color={color}
        lineWidth={1}
        opacity={opacity}
        transparent
      />
      <Html position={mid} center style={{ pointerEvents: "none" }}>
        <div
          className="rounded border border-border/90 bg-card/95 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-foreground/95 shadow-sm"
          title="sqlite-vec avstand (samme som i søk og naboer)"
        >
          {distanceLabel}
        </div>
      </Html>
    </>
  );
}

function QueryEmbeddingMarker({
  x,
  y,
  z,
  label,
}: {
  x: number;
  y: number;
  z: number;
  label: string;
}) {
  const groupRef = useRef<Group>(null);
  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const s = 1 + Math.sin(clock.elapsedTime * 2.4) * 0.07;
    g.scale.setScalar(s);
  });

  return (
    <group ref={groupRef} position={[x * 5, y * 5, z * 5]}>
      <mesh>
        <octahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial
          color="#d8b4fe"
          emissive="#7c3aed"
          emissiveIntensity={1}
          metalness={0.35}
          roughness={0.28}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.024, 10, 36]} />
        <meshBasicMaterial color="#f5e1ff" transparent opacity={0.92} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.28, 0.024, 10, 36]} />
        <meshBasicMaterial color="#f5e1ff" transparent opacity={0.55} />
      </mesh>
      <Html position={[0, 0.42, 0]} center style={{ pointerEvents: "none" }}>
        <div
          className="flex max-w-[min(280px,72vw)] items-center gap-1.5 rounded-md border border-border bg-card/85 px-2 py-1 text-xs text-foreground/90 shadow-sm backdrop-blur-sm"
          title={label}
        >
          <Search
            className="size-3.5 shrink-0 text-muted-foreground"
            strokeWidth={2}
            aria-hidden
          />
          <span className="min-w-0 truncate font-medium">{label}</span>
        </div>
      </Html>
    </group>
  );
}

function MovieDot({
  point,
  isSelected,
  isNeighbor,
  isListHighlight,
  isDimmed,
  isSearchHit,
  onSelect,
  onHover,
}: {
  point: MoviePoint;
  isSelected: boolean;
  isNeighbor: boolean;
  isListHighlight: boolean;
  isDimmed: boolean;
  isSearchHit: boolean;
  onSelect: (id: number) => void;
  onHover: (id: number | null) => void;
}) {
  const ref = useRef<Mesh>(null);
  const color = getGenreColor(point.genre);
  const scale = isSelected
    ? 2
    : isListHighlight
      ? 1.88
      : isNeighbor
        ? 1.5
        : isSearchHit
          ? 1.3
          : 1;
  const opacity = isDimmed ? 0.15 : 1;

  const emissiveColor = isSelected
    ? "#FFD967"
    : isListHighlight
      ? "#38bdf8"
      : isSearchHit
        ? color
        : "#000000";
  const emissiveIntensity = isSelected
    ? 0.5
    : isListHighlight
      ? 0.55
      : isSearchHit
        ? 0.3
        : 0;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: react-three-fiber meshes are interactive 3D elements.
    <mesh
      ref={ref}
      position={[point.x * 5, point.y * 5, point.z * 5]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect(point.id);
      }}
      onPointerOver={() => onHover(point.id)}
      onPointerOut={() => onHover(null)}
      scale={scale}
    >
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color={isSelected ? "#FFD967" : isListHighlight ? "#7dd3fc" : color}
        transparent
        opacity={opacity}
        emissive={emissiveColor}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}

export type QueryScatterPoint = {
  x: number;
  y: number;
  z: number;
  query: string;
};

export type NeighborLinkDistance = { movieId: number; distance: number };

export type QueryLineDistanceState = {
  loading: boolean;
  distance: number | null;
};

interface EmbeddingsScatterProps {
  points: MoviePoint[];
  selectedId: number | null;
  neighborIds: number[];
  searchHitIds: number[];
  /** Last semantic search query projected into the same PCA space as the movies. */
  queryInSpace: QueryScatterPoint | null;
  /** Neighbor sqlite-vec distances (same order / values as anbefalinger). */
  neighborDistances: NeighborLinkDistance[];
  /** Distance from search query embedding to selected movie; null prop = hide query line. */
  queryLineDistance: QueryLineDistanceState | null;
  /** Neighbor picked from the side panel — shown larger / cyan in the scatter. */
  listHighlightId: number | null;
  onSelectMovie: (id: number | null) => void;
}

export default function EmbeddingsScatter({
  points,
  selectedId,
  neighborIds,
  searchHitIds,
  queryInSpace,
  neighborDistances,
  queryLineDistance,
  listHighlightId,
  onSelectMovie,
}: EmbeddingsScatterProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const hasSelection = selectedId != null;

  const selectedPoint = useMemo(
    () => points.find((p) => p.id === selectedId),
    [points, selectedId],
  );

  const neighborPoints = useMemo(
    () => points.filter((p) => neighborIds.includes(p.id)),
    [points, neighborIds],
  );

  const distanceByNeighborId = useMemo(() => {
    const m = new Map<number, number>();
    for (const row of neighborDistances) {
      m.set(row.movieId, row.distance);
    }
    return m;
  }, [neighborDistances]);

  const hoveredPoint = useMemo(
    () => points.find((p) => p.id === hoveredId),
    [points, hoveredId],
  );

  /** Cloud center + half-length for axis ticks: only world axes (X/Y/Z) through center, no cell grid. */
  const { gx, gy, gz, axisHalfExtent } = useMemo(() => {
    if (points.length === 0) {
      return { gx: 0, gy: 0, gz: 0, axisHalfExtent: 6 };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const p of points) {
      const x = p.x * 5;
      const y = p.y * 5;
      const z = p.z * 5;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const cz = (minZ + maxZ) / 2;
    let maxD = 0;
    for (const p of points) {
      const x = p.x * 5;
      const y = p.y * 5;
      const z = p.z * 5;
      maxD = Math.max(
        maxD,
        Math.abs(x - cx),
        Math.abs(y - cy),
        Math.abs(z - cz),
      );
    }
    if (queryInSpace) {
      const qx = queryInSpace.x * 5;
      const qy = queryInSpace.y * 5;
      const qz = queryInSpace.z * 5;
      maxD = Math.max(
        maxD,
        Math.abs(qx - cx),
        Math.abs(qy - cy),
        Math.abs(qz - cz),
      );
    }
    return {
      gx: cx,
      gy: cy,
      gz: cz,
      axisHalfExtent: Math.max(maxD * 1.4, 3),
    };
  }, [points, queryInSpace]);

  const E = axisHalfExtent;

  return (
    <div className="w-full h-[500px] bg-card border border-border rounded-lg overflow-hidden">
      <Canvas camera={{ position: [8, 6, 8], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />

        {/* Axis cross through cloud center: each coordinate plane’s “zero” lines are these three world axes. */}
        <Line
          points={[
            [gx - E, gy, gz],
            [gx + E, gy, gz],
          ]}
          color="#b56565"
          lineWidth={1}
          transparent
          opacity={0.75}
        />
        <Line
          points={[
            [gx, gy - E, gz],
            [gx, gy + E, gz],
          ]}
          color="#5a9e8a"
          lineWidth={1}
          transparent
          opacity={0.75}
        />
        <Line
          points={[
            [gx, gy, gz - E],
            [gx, gy, gz + E],
          ]}
          color="#6f82c4"
          lineWidth={1}
          transparent
          opacity={0.75}
        />

        {points.map((point) => (
          <MovieDot
            key={point.id}
            point={point}
            isSelected={point.id === selectedId}
            isNeighbor={neighborIds.includes(point.id)}
            isListHighlight={
              listHighlightId != null &&
              point.id === listHighlightId &&
              point.id !== selectedId
            }
            isDimmed={
              hasSelection &&
              point.id !== selectedId &&
              !neighborIds.includes(point.id)
            }
            isSearchHit={searchHitIds.includes(point.id)}
            onSelect={onSelectMovie}
            onHover={setHoveredId}
          />
        ))}

        {queryInSpace && (
          <QueryEmbeddingMarker
            x={queryInSpace.x}
            y={queryInSpace.y}
            z={queryInSpace.z}
            label={queryInSpace.query}
          />
        )}

        {selectedPoint &&
          neighborPoints.map((np) => {
            const d = distanceByNeighborId.get(np.id);
            const label = d !== undefined ? d.toFixed(4) : "—";
            return (
              <LabeledLineSegment
                key={`line-${np.id}`}
                from={[
                  selectedPoint.x * 5,
                  selectedPoint.y * 5,
                  selectedPoint.z * 5,
                ]}
                to={[np.x * 5, np.y * 5, np.z * 5]}
                distanceLabel={label}
                color="#FFD967"
                opacity={0.42}
              />
            );
          })}

        {selectedPoint && queryInSpace && queryLineDistance && (
          <LabeledLineSegment
            from={[
              selectedPoint.x * 5,
              selectedPoint.y * 5,
              selectedPoint.z * 5,
            ]}
            to={[queryInSpace.x * 5, queryInSpace.y * 5, queryInSpace.z * 5]}
            distanceLabel={
              queryLineDistance.loading
                ? "…"
                : queryLineDistance.distance != null
                  ? queryLineDistance.distance.toFixed(4)
                  : "—"
            }
            color="#c084fc"
            opacity={0.5}
          />
        )}

        {hoveredPoint && (
          <Html
            position={[
              hoveredPoint.x * 5,
              hoveredPoint.y * 5 + 0.3,
              hoveredPoint.z * 5,
            ]}
            center
            style={{ pointerEvents: "none" }}
          >
            <div className="bg-card border border-border rounded px-2 py-1 text-xs shadow-md whitespace-nowrap">
              {hoveredPoint.title}
              {hoveredPoint.year && ` (${hoveredPoint.year})`}
            </div>
          </Html>
        )}

        <OrbitControls enableDamping dampingFactor={0.1} />
      </Canvas>
    </div>
  );
}
