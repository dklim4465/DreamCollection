interface Props {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}
export default function EmptyState({
  icon = "✈️",
  title,
  description,
  action,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <span className="text-5xl">{icon}</span>
      <h3 className="text-headline-sm font-bold text-on-surface">{title}</h3>
      {description && (
        <p className="text-body-md text-on-surface-variant max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
