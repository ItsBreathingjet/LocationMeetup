import { useEffect, useState } from 'react';

export function CarCollision() {
  const [key, setKey] = useState(0);

  // Reset animation every 6 seconds (3s animation + 3s pause)
  useEffect(() => {
    const interval = setInterval(() => {
      setKey(prev => prev + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-16 mb-4" key={key}>
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Left Car */}
        <div className="absolute left-0 animate-car-left">
          <svg width="40" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
            <path d="M21.739 10.921c-1.347-.39-1.885-.538-3.552-.921 0 0-2.379-2.359-2.832-2.816-.568-.572-1.043-1.184-2.949-1.184h-7.894c-2.036 0-2.484.987-2.998 2l-2.514 4v7c0 1.104.895 2 2 2h1c1.104 0 2-.896 2-2v-1h12v1c0 1.104.896 2 2 2h1c1.104 0 2-.896 2-2v-7l-1.261-1.079zm-11.739 6.079h-4v-1h4v1zm10 0h-4v-1h4v1zm-9-4.667c0 .736-.597 1.333-1.333 1.333s-1.333-.597-1.333-1.333c0-.736.597-1.333 1.333-1.333s1.333.597 1.333 1.333zm7.333 1.333c-.736 0-1.333-.597-1.333-1.333s.597-1.333 1.333-1.333 1.333.597 1.333 1.333-.597 1.333-1.333 1.333z"/>
          </svg>
        </div>
        
        {/* Right Car */}
        <div className="absolute right-0 animate-car-right">
          <svg width="40" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-primary scale-x-[-1]">
            <path d="M21.739 10.921c-1.347-.39-1.885-.538-3.552-.921 0 0-2.379-2.359-2.832-2.816-.568-.572-1.043-1.184-2.949-1.184h-7.894c-2.036 0-2.484.987-2.998 2l-2.514 4v7c0 1.104.895 2 2 2h1c1.104 0 2-.896 2-2v-1h12v1c0 1.104.896 2 2 2h1c1.104 0 2-.896 2-2v-7l-1.261-1.079zm-11.739 6.079h-4v-1h4v1zm10 0h-4v-1h4v1zm-9-4.667c0 .736-.597 1.333-1.333 1.333s-1.333-.597-1.333-1.333c0-.736.597-1.333 1.333-1.333s1.333.597 1.333 1.333zm7.333 1.333c-.736 0-1.333-.597-1.333-1.333s.597-1.333 1.333-1.333 1.333.597 1.333 1.333-.597 1.333-1.333 1.333z"/>
          </svg>
        </div>

        {/* Collision Effect */}
        <div className="absolute left-1/2 -translate-x-1/2 opacity-0 animate-collision">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.959 17l-4.5-4.319 1.395-1.435 3.08 2.937 7.021-7.183 1.422 1.409-8.418 8.591z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
