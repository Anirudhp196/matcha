import { MatchaIcon } from "./components/MatchaIcon";
import { MusicPerformanceIcon } from "./components/MusicPerformanceIcon";

export default function App() {
  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="flex flex-col items-center gap-12 p-8">
        <div className="text-center">
          <h1 className="mb-2">Custom Icons</h1>
          <p className="text-muted-foreground">Handcrafted SVG icons for your projects</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Matcha Icon Section */}
          <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg border shadow-sm">
            <MatchaIcon size={96} />
            <div className="text-center">
              <h3>Matcha Icon</h3>
              <p className="text-muted-foreground">Traditional Japanese tea ceremony</p>
            </div>
          </div>
          
          {/* Music Performance Icon Section */}
          <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg border shadow-sm">
            <MusicPerformanceIcon size={96} />
            <div className="text-center">
              <h3>Music Performance Icon</h3>
              <p className="text-muted-foreground">Live music and entertainment</p>
            </div>
          </div>
        </div>
        
        {/* Size variants */}
        <div className="flex flex-col gap-6 items-center">
          <h3>Different Sizes</h3>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <MatchaIcon size={32} />
              <span className="text-sm text-muted-foreground">32px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MatchaIcon size={48} />
              <span className="text-sm text-muted-foreground">48px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MatchaIcon size={64} />
              <span className="text-sm text-muted-foreground">64px</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <MusicPerformanceIcon size={32} />
              <span className="text-sm text-muted-foreground">32px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MusicPerformanceIcon size={48} />
              <span className="text-sm text-muted-foreground">48px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MusicPerformanceIcon size={64} />
              <span className="text-sm text-muted-foreground">64px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}