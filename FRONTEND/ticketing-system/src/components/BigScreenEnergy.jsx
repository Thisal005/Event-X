import React, { useEffect, useState } from 'react';
import { Flame, Info } from 'lucide-react';

const BigScreenEnergy = ({ role, phase, hypeLevel }) => {
    // Generate particles based on phase
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const particleCount = phase === 'INSANE' ? 50 : phase === 'WILD' ? 30 : phase === 'WARM' ? 10 : 5;
        const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: Math.random() * 2 + 2,
            size: Math.random() * 20 + 5
        }));
        setParticles(newParticles);
    }, [phase]);

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Core Energy Pulse */}
            <div className={`absolute rounded-full blur-3xl transition-all duration-500
                ${phase === 'INSANE' ? 'bg-red-500/40 w-[150%] h-[150%] animate-pulse' :
                    phase === 'WILD' ? 'bg-orange-500/30 w-[120%] h-[120%] animate-pulse' :
                        phase === 'WARM' ? 'bg-yellow-500/20 w-full h-full' :
                            'bg-blue-500/10 w-2/3 h-2/3'}`}
            />

            {/* Particles */}
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute bottom-0 bg-white/30 rounded-full blur-sm animate-float"
                    style={{
                        left: `${p.left}%`,
                        width: p.size,
                        height: p.size,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`
                    }}
                />
            ))}

            <div className="z-10 text-center transform scale-150">
                <Flame
                    className={`w-32 h-32 mx-auto transition-all duration-300
                    ${phase === 'INSANE' ? 'text-white drop-shadow-[0_0_30px_rgba(255,0,0,0.8)] animate-bounce' :
                            phase === 'WILD' ? 'text-orange-400 drop-shadow-[0_0_20px_rgba(255,165,0,0.6)] animate-pulse' :
                                phase === 'WARM' ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]' :
                                    'text-blue-400/50'}`}
                />

                <h2 className="text-6xl font-black text-white mt-8 tracking-tighter uppercase drop-shadow-lg">
                    {phase}
                </h2>

                <p className="text-2xl text-white/70 mt-4 font-mono">
                    HYPE LEVEL: {hypeLevel}
                </p>
            </div>

            <style>{`
                @keyframes float {
                    0% { transform: translateY(100vh) scale(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(-20vh) scale(1.5); opacity: 0; }
                }
                .animate-float {
                    animation-name: float;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    );
};

export default BigScreenEnergy;
