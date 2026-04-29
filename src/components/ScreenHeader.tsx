interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
}

export default function ScreenHeader({ title, onBack }: ScreenHeaderProps) {
  return (
    <div className="screen-header-block">
      <button className="btn btn-small btn-secondary screen-back-btn" onClick={onBack}>
        ← Back
      </button>
      <h1>{title}</h1>
    </div>
  );
}
