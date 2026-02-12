import React from 'react';

const BigScreenBackground = ({ config, energyPhase, lightEffect }) => {
    // If Light Show is active, it overrides everything or overlays
    if (lightEffect?.active) {
        const { type, color, speed, intensity } = lightEffect;

        // Convert speed (1-100) to duration seconds (0.1 - 2.0)
        // High speed = Low duration
        // 100 -> 0.1s, 1 -> 2.0s
        const duration = 2.0 - ((speed || 50) / 100) * 1.9;

        const style = {
            backgroundColor: color,
            opacity: (intensity || 100) / 100
        };

        if (type === 'PULSE') {
            style.animation = `pulse ${duration}s cubic-bezier(0.4, 0, 0.6, 1) infinite`;
        } else if (type === 'STROBE') {
            style.animation = `pulse ${duration * 0.2}s steps(2) infinite`;
        }

        // Add keyframes if needed in global style or here inline (limited support)
        // Or assume Tailwind 'animate-pulse' is not enough for custom speed
        // For simplicity, we'll use a hard override div

        return (
            <div
                className="absolute inset-0 z-50 flex items-center justify-center"
                style={{
                    backgroundColor: type === 'STROBE' ? 'transparent' : color, // Base for non-strobe
                }}
            >
                {/* For strobe/pulse we might need an inner element or just animate opacity */}
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                        backgroundColor: color,
                        animation: type === 'PULSE'
                            ? `pulseEffect ${duration}s infinite`
                            : type === 'STROBE'
                                ? `strobeEffect ${duration}s infinite`
                                : 'none'
                    }}
                />

                <style>{`
                    @keyframes pulseEffect {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.2; }
                    }
                    @keyframes strobeEffect {
                        0%, 50% { opacity: 1; }
                        51%, 100% { opacity: 0; }
                    }
                `}</style>
            </div>
        );
    }


    if (!config) return <div className="absolute inset-0 bg-gray-900" />;

    const { type, url, opacity } = config;

    // Energy phase modifiers
    let phaseFilter = '';
    let phaseScale = 1;

    switch (energyPhase) {
        case 'WARM':
            phaseFilter = 'saturate(1.2) brightness(1.1)';
            break;
        case 'WILD':
            phaseFilter = 'saturate(1.5) contrast(1.1)';
            phaseScale = 1.05;
            break;
        case 'INSANE':
            phaseFilter = 'saturate(2.0) contrast(1.2) hue-rotate(15deg)';
            phaseScale = 1.1;
            break;
        default:
            phaseFilter = '';
    }

    return (
        <div className="absolute inset-0 overflow-hidden z-0">
            {type === 'VIDEO' ? (
                <video
                    src={url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
                    style={{
                        filter: phaseFilter,
                        transform: `scale(${phaseScale})`
                    }}
                />
            ) : type === 'GRADIENT' ? (
                <div
                    className="w-full h-full transition-all duration-1000 ease-in-out"
                    style={{
                        background: url || 'linear-gradient(to right, #240b36, #c31432)',
                        filter: phaseFilter,
                        transform: `scale(${phaseScale})`
                    }}
                />
            ) : (
                <div className="w-full h-full bg-gray-900" />
            )}

            {/* Overlay for readability */}
            <div
                className="absolute inset-0 bg-black transition-opacity duration-500"
                style={{ opacity: 1 - (opacity || 0.5) }}
            />

            {/* Flash effect for High Energy */}
            {energyPhase === 'INSANE' && (
                <div className="absolute inset-0 bg-white/10 animate-pulse mix-blend-overlay pointer-events-none" />
            )}
        </div>
    );
};

export default BigScreenBackground;
