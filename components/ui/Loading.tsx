'use client';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

export default function Loading({ size = 'medium', color = '#3b82f6', text }: LoadingProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative ${sizeClasses[size]}`} style={{ perspective: '1000px' }}>
        <style jsx>{`
          @keyframes rotate3d {
            0% {
              transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
            }
            100% {
              transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg);
            }
          }
          
          @keyframes rotate3d-reverse {
            0% {
              transform: rotateX(360deg) rotateY(0deg) rotateZ(0deg);
            }
            100% {
              transform: rotateX(0deg) rotateY(360deg) rotateZ(360deg);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 0.3;
            }
            50% {
              opacity: 1;
            }
          }
          
          .cube-3d {
            animation: rotate3d 2s linear infinite;
            transform-style: preserve-3d;
          }
          
          .cube-3d-reverse {
            animation: rotate3d-reverse 2.5s linear infinite;
            transform-style: preserve-3d;
          }
          
          .cube-face {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 2px solid ${color};
            background: linear-gradient(45deg, ${color}20, ${color}40);
            backdrop-filter: blur(10px);
          }
          
          .face-front { transform: translateZ(20px); }
          .face-back { transform: rotateY(180deg) translateZ(20px); }
          .face-right { transform: rotateY(90deg) translateZ(20px); }
          .face-left { transform: rotateY(-90deg) translateZ(20px); }
          .face-top { transform: rotateX(90deg) translateZ(20px); }
          .face-bottom { transform: rotateX(-90deg) translateZ(20px); }
          
          .orbit {
            animation: pulse 1.5s ease-in-out infinite;
          }
        `}</style>
        
        {/* Outer rotating cube */}
        <div className="cube-3d absolute inset-0">
          <div className="cube-face face-front"></div>
          <div className="cube-face face-back"></div>
          <div className="cube-face face-right"></div>
          <div className="cube-face face-left"></div>
          <div className="cube-face face-top"></div>
          <div className="cube-face face-bottom"></div>
        </div>
        
        {/* Inner reverse rotating cube */}
        <div 
          className="cube-3d-reverse absolute inset-0" 
          style={{ 
            width: '60%', 
            height: '60%', 
            top: '20%', 
            left: '20%' 
          }}
        >
          <div className="cube-face face-front" style={{ borderColor: color, background: `linear-gradient(45deg, ${color}10, ${color}30)` }}></div>
          <div className="cube-face face-back" style={{ borderColor: color, background: `linear-gradient(45deg, ${color}10, ${color}30)` }}></div>
          <div className="cube-face face-right" style={{ borderColor: color, background: `linear-gradient(45deg, ${color}10, ${color}30)` }}></div>
          <div className="cube-face face-left" style={{ borderColor: color, background: `linear-gradient(45deg, ${color}10, ${color}30)` }}></div>
          <div className="cube-face face-top" style={{ borderColor: color, background: `linear-gradient(45deg, ${color}10, ${color}30)` }}></div>
          <div className="cube-face face-bottom" style={{ borderColor: color, background: `linear-gradient(45deg, ${color}10, ${color}30)` }}></div>
        </div>
        
        {/* Orbiting dots */}
        <div className="orbit absolute inset-0">
          <div 
            className="absolute w-2 h-2 rounded-full" 
            style={{ 
              backgroundColor: color,
              top: '0%',
              left: '50%',
              transform: 'translateX(-50%)',
              boxShadow: `0 0 10px ${color}`
            }}
          ></div>
          <div 
            className="absolute w-2 h-2 rounded-full" 
            style={{ 
              backgroundColor: color,
              bottom: '0%',
              left: '50%',
              transform: 'translateX(-50%)',
              boxShadow: `0 0 10px ${color}`
            }}
          ></div>
          <div 
            className="absolute w-2 h-2 rounded-full" 
            style={{ 
              backgroundColor: color,
              top: '50%',
              left: '0%',
              transform: 'translateY(-50%)',
              boxShadow: `0 0 10px ${color}`
            }}
          ></div>
          <div 
            className="absolute w-2 h-2 rounded-full" 
            style={{ 
              backgroundColor: color,
              top: '50%',
              right: '0%',
              transform: 'translateY(-50%)',
              boxShadow: `0 0 10px ${color}`
            }}
          ></div>
        </div>
      </div>
      
      {text && (
        <div className={`${textSizes[size]} font-medium`} style={{ color }}>
          {text}
        </div>
      )}
    </div>
  );
}