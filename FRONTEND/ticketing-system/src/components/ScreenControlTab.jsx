import React, { useState } from 'react';
import { Monitor, Layout, Image, Play, Maximize } from 'lucide-react';

import { uploadBackgroundVideo } from '../api/eventLiveService';

const ScreenControlTab = ({ eventId, currentLayout, onUpdateLayout, onUpdateBackground, onLaunch }) => {
    const [backgroundType, setBackgroundType] = useState('GRADIENT');
    const [backgroundUrl, setBackgroundUrl] = useState('');
    const [opacity, setOpacity] = useState(0.8);
    const [targetScreen, setTargetScreen] = useState('ALL');
    const [uploading, setUploading] = useState(false);

    const layouts = [
        { id: 'SINGLE', label: 'Single Screen', icon: <div className="w-12 h-8 border-2 border-current rounded flex items-center justify-center bg-gray-200/20">1</div> },
        { id: 'DUAL', label: 'Dual Screen', icon: <div className="flex gap-1"><div className="w-6 h-8 border-2 border-current rounded flex items-center justify-center bg-gray-200/20">1</div><div className="w-6 h-8 border-2 border-current rounded flex items-center justify-center bg-gray-200/20">2</div></div> },
        { id: 'TRIPLE', label: 'Triple Screen', icon: <div className="flex gap-0.5"><div className="w-4 h-8 border-2 border-current rounded bg-gray-200/20"></div><div className="w-4 h-8 border-2 border-current rounded flex items-center justify-center font-bold">M</div><div className="w-4 h-8 border-2 border-current rounded bg-gray-200/20"></div></div> }
    ];

    const handleSubmitBackground = (e) => {
        e.preventDefault();
        onUpdateBackground({
            type: backgroundType,
            url: backgroundUrl,
            loop: true,
            opacity: parseFloat(opacity)
        }, targetScreen);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const response = await uploadBackgroundVideo(eventId, file);
            setBackgroundUrl(response.url);
            setBackgroundType('VIDEO');
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload video");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Layout Selection */}
            <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Layout className="w-5 h-5 text-purple-600" />
                    Screen Layout
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {layouts.map(layout => (
                        <button
                            key={layout.id}
                            onClick={() => onUpdateLayout(layout.id)}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${currentLayout === layout.id
                                ? 'border-purple-600 bg-purple-50 text-purple-700'
                                : 'border-gray-200 hover:border-purple-300'
                                }`}
                        >
                            {layout.icon}
                            <span className="font-medium">{layout.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Background Control */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Image className="w-5 h-5 text-blue-600" />
                    Background Settings
                </h3>

                {/* Target Selector */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apply to Screen:</label>
                    <div className="flex gap-2">
                        {['ALL', 'MAIN', 'LEFT', 'RIGHT'].map(target => (
                            <button
                                key={target}
                                type="button"
                                onClick={() => setTargetScreen(target)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${targetScreen === target
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {target === 'ALL' ? 'All Screens' : target}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmitBackground} className="space-y-4">
                    <div className="flex gap-4 flex-wrap">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="bgType"
                                value="GRADIENT"
                                checked={backgroundType === 'GRADIENT'}
                                onChange={(e) => setBackgroundType(e.target.value)}
                                className="text-purple-600"
                            />
                            <span>Gradient</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="bgType"
                                value="VIDEO"
                                checked={backgroundType === 'VIDEO'}
                                onChange={(e) => setBackgroundType(e.target.value)}
                                className="text-purple-600"
                            />
                            <span>Video Loop</span>
                        </label>
                    </div>

                    {backgroundType === 'VIDEO' && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Video File (max 500MB)
                            </label>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                disabled={uploading}
                                className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-purple-50 file:text-purple-700
                                hover:file:bg-purple-100"
                            />
                            {uploading && <p className="text-sm text-purple-600 mt-2 animate-pulse">Uploading video...</p>}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {backgroundType === 'VIDEO' ? 'Video URL (or uploaded path)' : 'CSS Gradient String'}
                        </label>
                        <input
                            type="text"
                            value={backgroundUrl}
                            onChange={(e) => setBackgroundUrl(e.target.value)}
                            placeholder={backgroundType === 'VIDEO' ? 'https://example.com/loop.mp4' : 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)'}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Overlay Opacity ({opacity})
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={opacity}
                            onChange={(e) => setOpacity(e.target.value)}
                            className="w-full accent-purple-600"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className={`w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Play className="w-4 h-4" />
                        Apply Background to {targetScreen === 'ALL' ? 'All Screens' : targetScreen}
                    </button>
                </form>
            </section>

            {/* Launch Controls */}
            <section className="flex justify-center pt-4">
                <button
                    onClick={onLaunch}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                    <Maximize className="w-6 h-6" />
                    Launch {currentLayout} Screen Mode
                </button>
            </section>
        </div>
    );
};

export default ScreenControlTab;
