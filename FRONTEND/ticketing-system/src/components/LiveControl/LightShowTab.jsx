import React, { useState, useEffect, useRef } from 'react';
import { Zap, X, Sparkles, Waves, Sun, Play, Square } from 'lucide-react';

// Preset themes with predefined settings
const PRESETS = [
    { name: 'Party', color: '#ff00ff', effect: 'STROBE', speed: 80, intensity: 100, gradient: 'from-pink-500 to-purple-600' },
    { name: 'Neon', color: '#00ff88', effect: 'PULSE', speed: 60, intensity: 90, gradient: 'from-green-400 to-cyan-500' },
    { name: 'Chill', color: '#6366f1', effect: 'FADE', speed: 30, intensity: 70, gradient: 'from-indigo-400 to-purple-500' },
    { name: 'Festival', color: '#f97316', effect: 'WAVE', speed: 70, intensity: 100, gradient: 'from-orange-500 to-red-500' },
];

// Light effect options
const EFFECTS = [
    { id: 'SOLID', name: 'Solid', icon: Sun, description: 'Steady color' },
    { id: 'PULSE', name: 'Pulse', icon: Sparkles, description: 'Breathing glow' },
    { id: 'WAVE', name: 'Wave', icon: Waves, description: 'Flowing motion' },
    { id: 'STROBE', name: 'Strobe', icon: Zap, description: 'Fast flash' },
    { id: 'FADE', name: 'Fade', icon: Play, description: 'Slow transition' },
];

// Quick color swatches
const COLOR_SWATCHES = [
    '#ff0000', '#ff6b00', '#ffd700', '#00ff00', '#00ffff',
    '#0088ff', '#8b5cf6', '#ff00ff', '#ff1493', '#ffffff'
];

const LightShowTab = ({ onTrigger, onStop }) => {
    const [color, setColor] = useState('#8b5cf6');
    const [effect, setEffect] = useState('PULSE');
    const [duration, setDuration] = useState(30);
    const [speed, setSpeed] = useState(50);
    const [intensity, setIntensity] = useState(100);
    const [isActive, setIsActive] = useState(false);
    const [hexInput, setHexInput] = useState('#8b5cf6');
    const previewRef = useRef(null);

    // Update hex input when color changes
    useEffect(() => {
        setHexInput(color);
    }, [color]);

    // Handle hex input change
    const handleHexChange = (e) => {
        const value = e.target.value;
        setHexInput(value);
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            setColor(value);
        }
    };

    // Apply preset theme
    const applyPreset = (preset) => {
        setColor(preset.color);
        setEffect(preset.effect);
        setSpeed(preset.speed);
        setIntensity(preset.intensity);
    };

    // Calculate animation style for preview
    const getPreviewStyle = () => {
        const animationDuration = `${(101 - speed) / 50}s`;
        const opacityValue = intensity / 100;

        let animation = 'none';
        switch (effect) {
            case 'PULSE':
                animation = `previewPulse ${animationDuration} ease-in-out infinite`;
                break;
            case 'STROBE':
                animation = `previewStrobe ${(101 - speed) / 200}s linear infinite`;
                break;
            case 'WAVE':
                animation = `previewWave ${animationDuration} ease-in-out infinite`;
                break;
            case 'FADE':
                animation = `previewFade ${(101 - speed) / 20}s ease-in-out infinite`;
                break;
            default:
                animation = 'none';
        }

        return {
            backgroundColor: color,
            opacity: opacityValue,
            animation,
        };
    };

    const handleTrigger = async () => {
        try {
            await onTrigger({
                color,
                type: effect,
                duration: duration * 1000,
                speed,
                intensity
            });
            setIsActive(true);
            setTimeout(() => setIsActive(false), duration * 1000);
        } catch (error) {
            console.error('Failed to trigger light sync', error);
            alert('Failed to trigger light sync');
        }
    };

    const handleStop = async () => {
        try {
            await onStop();
            setIsActive(false);
        } catch (error) {
            console.error('Failed to stop light sync', error);
            alert('Failed to stop light sync');
        }
    };

    return (
        <div className="space-y-6">
            {/* CSS for preview animations */}
            <style>{`
                @keyframes previewPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.98); }
                }
                @keyframes previewStrobe {
                    0%, 49% { opacity: 1; }
                    50%, 100% { opacity: 0.1; }
                }
                @keyframes previewWave {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(5px); }
                    75% { transform: translateX(-5px); }
                }
                @keyframes previewFade {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                .slider-track {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 8px;
                    border-radius: 4px;
                    background: linear-gradient(to right, #6366f1, #a855f7);
                    outline: none;
                }
                .slider-track::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    transition: transform 0.15s;
                }
                .slider-track::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                }
                .slider-track::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    border: none;
                }
            `}</style>

            {/* Header with Live Preview */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-500" />
                        Digital Light Show
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Sync all attendee phones to display colors - create an amazing crowd light show!
                    </p>
                </div>

                {/* Live Preview Box */}
                <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Live Preview</span>
                    <div
                        ref={previewRef}
                        className="w-24 h-24 rounded-2xl shadow-lg border-4 border-white relative overflow-hidden"
                        style={getPreviewStyle()}
                    >
                        {isActive && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                            </div>
                        )}
                    </div>
                    <span className="text-xs text-gray-400 mt-1">{effect}</span>
                </div>
            </div>

            {/* Preset Themes */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Presets</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => applyPreset(preset)}
                            className={`relative overflow-hidden rounded-xl p-4 text-white font-bold text-sm transition-all hover:scale-105 hover:shadow-lg bg-gradient-to-br ${preset.gradient}`}
                        >
                            <span className="relative z-10">{preset.name}</span>
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Picker Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Color</h4>
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Color Input */}
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-16 h-16 rounded-xl cursor-pointer border-2 border-gray-200 hover:border-purple-400 transition-colors"
                        />
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">HEX Code</label>
                            <input
                                type="text"
                                value={hexInput}
                                onChange={handleHexChange}
                                placeholder="#8b5cf6"
                                className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none"
                            />
                        </div>
                    </div>

                    {/* Color Swatches */}
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 block mb-2">Quick Colors</label>
                        <div className="flex flex-wrap gap-2">
                            {COLOR_SWATCHES.map((swatch) => (
                                <button
                                    key={swatch}
                                    onClick={() => setColor(swatch)}
                                    className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${color === swatch ? 'border-gray-800 ring-2 ring-offset-1 ring-purple-400' : 'border-gray-200'}`}
                                    style={{ backgroundColor: swatch }}
                                    title={swatch}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Effect Selection Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Light Effect</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {EFFECTS.map((eff) => (
                        <button
                            key={eff.id}
                            onClick={() => setEffect(eff.id)}
                            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${effect === eff.id
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                }`}
                        >
                            <eff.icon className={`w-6 h-6 mb-2 ${effect === eff.id ? 'text-purple-500' : 'text-gray-400'}`} />
                            <span className="font-medium text-sm">{eff.name}</span>
                            <span className="text-xs text-gray-400 mt-0.5">{eff.description}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Speed & Intensity Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Speed Slider */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">Speed</h4>
                        <span className="text-sm font-bold text-purple-600">{speed}%</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={speed}
                        onChange={(e) => setSpeed(parseInt(e.target.value))}
                        className="w-full slider-track"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>Slow</span>
                        <span>Fast</span>
                    </div>
                </div>

                {/* Intensity Slider */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">Intensity</h4>
                        <span className="text-sm font-bold text-purple-600">{intensity}%</span>
                    </div>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        value={intensity}
                        onChange={(e) => setIntensity(parseInt(e.target.value))}
                        className="w-full slider-track"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>Dim</span>
                        <span>Bright</span>
                    </div>
                </div>
            </div>

            {/* Duration Slider */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Duration</h4>
                    <span className="text-sm font-bold text-purple-600">{duration}s</span>
                </div>
                <input
                    type="range"
                    min="5"
                    max="120"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full slider-track"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>5s</span>
                    <span>2 min</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleTrigger}
                    disabled={isActive}
                    className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${isActive
                            ? 'bg-green-500 text-white cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:scale-[1.02]'
                        }`}
                >
                    {isActive ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Light Show Active!
                        </>
                    ) : (
                        <>
                            <Zap className="w-6 h-6" />
                            Apply to Stage
                        </>
                    )}
                </button>

                {isActive && (
                    <button
                        onClick={handleStop}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
                    >
                        <Square className="w-5 h-5" />
                        Stop Show
                    </button>
                )}
            </div>
        </div>
    );
};

export default LightShowTab;
