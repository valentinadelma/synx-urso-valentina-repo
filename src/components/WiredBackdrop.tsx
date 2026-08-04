/**
 * Ambient backdrop — leve e puramente decorativo.
 * Apenas grade tática + vinheta (sem imagem, sem ruído animado) para
 * manter o site rápido e clean.
 */
export function WiredBackdrop({ intensity = 1 }: { intensity?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="grid-backdrop absolute inset-0"
        style={{ opacity: 0.9 * intensity }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(85% 60% at 50% 0%, color-mix(in oklab, var(--signal) 8%, transparent), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 50%, transparent 45%, color-mix(in oklab, var(--background) 75%, transparent) 100%)",
        }}
      />
    </div>
  );
}

export default WiredBackdrop;
