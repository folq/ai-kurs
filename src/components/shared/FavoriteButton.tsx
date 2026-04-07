import { Button } from "@/components/ui/button";

type Props = {
  isFavorite: boolean;
  onClick: () => void;
};

export function FavoriteButton({ isFavorite, onClick }: Props) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="h-8 w-8 p-0 shrink-0"
      title={isFavorite ? "Fjern fra favoritter" : "Legg til i favoritter"}
    >
      <span className="text-lg">{isFavorite ? "♥" : "♡"}</span>
    </Button>
  );
}
