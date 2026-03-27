import { useState, useMemo } from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import type * as THREE from "three";
import { useRef } from "react";

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

function MovieDot({
  point,
  isSelected,
  isNeighbor,
  isDimmed,
  isSearchHit,
  onSelect,
  onHover,
}: {
  point: MoviePoint;
  isSelected: boolean;
  isNeighbor: boolean;
  isDimmed: boolean;
  isSearchHit: boolean;
  onSelect: (id: number) => void;
  onHover: (id: number | null) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const color = getGenreColor(point.genre);
  const scale = isSelected ? 2 : isNeighbor ? 1.5 : isSearchHit ? 1.3 : 1;
  const opacity = isDimmed ? 0.15 : 1;

  return (
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
        color={isSelected ? "#FFD967" : color}
        transparent
        opacity={opacity}
        emissive={isSelected ? "#FFD967" : isSearchHit ? color : "#000000"}
        emissiveIntensity={isSelected ? 0.5 : isSearchHit ? 0.3 : 0}
      />
    </mesh>
  );
}

interface EmbeddingsScatterProps {
  points: MoviePoint[];
  selectedId: number | null;
  neighborIds: number[];
  searchHitIds: number[];
  onSelectMovie: (id: number | null) => void;
}

export default function EmbeddingsScatter({
  points,
  selectedId,
  neighborIds,
  searchHitIds,
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

  const hoveredPoint = useMemo(
    () => points.find((p) => p.id === hoveredId),
    [points, hoveredId],
  );

  return (
    <div className="w-full h-[500px] bg-card border border-border rounded-lg overflow-hidden">
      <Canvas camera={{ position: [8, 6, 8], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />

        {points.map((point) => (
          <MovieDot
            key={point.id}
            point={point}
            isSelected={point.id === selectedId}
            isNeighbor={neighborIds.includes(point.id)}
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

        {selectedPoint &&
          neighborPoints.map((np) => (
            <Line
              key={`line-${np.id}`}
              points={[
                [selectedPoint.x * 5, selectedPoint.y * 5, selectedPoint.z * 5],
                [np.x * 5, np.y * 5, np.z * 5],
              ]}
              color="#FFD967"
              lineWidth={1}
              opacity={0.4}
              transparent
            />
          ))}

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
