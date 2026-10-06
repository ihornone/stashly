import { Code } from 'lucide-react'

export function CodeVisual() {
  const k = (c: string) => ({ color: c })
  return (
    <div className="relative mt-6 min-h-[236px] flex-1 overflow-hidden pl-[30px]">
      <div
        className="absolute top-0 right-[-22px] left-[30px] h-[300px] overflow-hidden rounded-t-[12px] border border-b-0"
        style={{
          borderColor: 'color-mix(in oklch,var(--border) 30%,transparent)',
          background: 'color-mix(in oklch,var(--foreground) 5%,var(--background))',
          boxShadow: '0 -24px 60px color-mix(in oklch,var(--foreground) 15%,transparent)',
        }}
      >
        <div
          className="flex items-center gap-3.5 px-3.5 py-[11px]"
          style={{ borderBottom: '1px solid color-mix(in oklch,var(--border) 12%,transparent)' }}
        >
          <span className="flex gap-[7px]">
            <span className="size-[11px] rounded-full" style={{ background: '#ff5f57' }} />
            <span className="size-[11px] rounded-full" style={{ background: '#febc2e' }} />
            <span className="size-[11px] rounded-full" style={{ background: '#28c840' }} />
          </span>
          <span
            className="text-foreground flex items-center gap-[7px] rounded-[7px] px-3 py-1 font-mono text-xs font-medium"
            style={{ background: 'color-mix(in oklch,var(--foreground) 8%,transparent)' }}
          >
            <Code className="size-3" />
            stashly.config.ts
          </span>
        </div>
        <pre
          className="m-0 px-[18px] py-4 font-mono text-[13px] leading-[1.75] whitespace-pre"
          style={{ color: 'color-mix(in oklch,var(--foreground) 78%,transparent)' }}
        >
          <span style={k('#d2a8ff')}>import</span> &#123; <span style={k('#6ea8fe')}>defineConfig</span> &#125; <span style={k('#d2a8ff')}>from</span> <span style={k('#7ee787')}>&apos;stashly&apos;</span>{'\n\n'}
          <span style={k('#d2a8ff')}>export default</span> <span style={k('#6ea8fe')}>defineConfig</span>(&#123;{'\n  '}
          <span style={k('#8b93a1')}>privacy</span>: &#123; <span style={k('#f0a868')}>telemetry</span>: <span style={k('#ff7b9c')}>false</span>, <span style={k('#f0a868')}>encryption</span>: <span style={k('#ff7b9c')}>true</span> &#125;,{'\n  '}
          <span style={k('#8b93a1')}>database</span>: <span style={k('#7ee787')}>&apos;sqlite://stashly.db&apos;</span>,{'\n  '}
          <span style={k('#8b93a1')}>storage</span>: &#123; <span style={k('#f0a868')}>driver</span>: <span style={k('#7ee787')}>&apos;local&apos;</span>, <span style={k('#f0a868')}>sync</span>: <span style={k('#ff7b9c')}>true</span> &#125;,{'\n  '}
          <span style={k('#8b93a1')}>openSource</span>: <span style={k('#ff7b9c')}>true</span>{'\n'}
          &#125;)
        </pre>
      </div>
    </div>
  )
}
