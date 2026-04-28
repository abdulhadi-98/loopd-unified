const config = {
  bronze: { label: 'Bronze', emoji: '🥉', bg: 'bg-amber-700' },
  silver: { label: 'Silver', emoji: '🥈', bg: 'bg-gray-400' },
  gold:   { label: 'Gold',   emoji: '🥇', bg: 'bg-yellow-500' },
};

export default function TierBadge({ tier }) {
  const { label, emoji, bg } = config[tier] || config.bronze;
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-sm font-semibold ${bg}`}>
      {emoji} {label} Member
    </span>
  );
}
