interface HeartButtonProps {
  liked: boolean;
  title: string;
  onToggle: () => void;
  /** Mit Text «Gefällt mir» (Dialog) oder nur als Icon (Card). */
  withLabel?: boolean;
}

/** Like-Button: grau und halbtransparent, wenn nicht gelikt; pink, wenn gelikt. */
export default function HeartButton({ liked, title, onToggle, withLabel = false }: HeartButtonProps) {
  return (
    <button
      type="button"
      className={withLabel ? 'pill-button pill-button--like' : 'heart-button'}
      aria-pressed={liked}
      aria-label={withLabel ? undefined : `Gefällt mir: ${title}`}
      onClick={onToggle}
    >
      <svg className="heart-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {withLabel && 'Gefällt mir'}
    </button>
  );
}
