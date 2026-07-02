export function Waveform({ bars, active = false, className = '' }: { bars: number[]; active?: boolean; className?: string }) {
  return (
    <div className={`waveform ${active ? 'waveform--active' : ''} ${className}`} aria-hidden="true">
      {bars.map((height, index) => (
        <i key={`${height}-${index}`} style={{ '--bar-height': `${height}%`, '--bar-delay': `${index * -63}ms` } as React.CSSProperties} />
      ))}
    </div>
  )
}
