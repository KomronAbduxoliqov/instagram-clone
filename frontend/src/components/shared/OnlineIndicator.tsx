interface OnlineIndicatorProps {
  isOnline: boolean;
  className?: string;
}

export default function OnlineIndicator({ isOnline, className = "" }: OnlineIndicatorProps) {
  if (!isOnline) return null;

  return (
    <div
      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white ${className}`}
    />
  );
}
