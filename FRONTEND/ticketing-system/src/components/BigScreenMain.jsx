import React, { useState, useEffect } from 'react';
import { BarChart3, Radio, Users, Flame, Camera, ChevronLeft, ChevronRight, LayoutGrid, Monitor } from 'lucide-react';

const BigScreenMain = ({ event, liveData, hypeLevel, energyPhase, approvedPhotos }) => {
    // Local UI State
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [displayMode, setDisplayMode] = useState('slideshow'); // 'slideshow' or 'grid'
    const [showPhotoWall, setShowPhotoWall] = useState(false);
    const [maxHype] = useState(1000);

    // Photo slideshow auto-advance
    useEffect(() => {
        if (showPhotoWall && displayMode === 'slideshow' && approvedPhotos.length > 1) {
            const interval = setInterval(() => {
                setCurrentPhotoIndex(prev => (prev + 1) % approvedPhotos.length);
            }, 5000); // 5 seconds per photo
            return () => clearInterval(interval);
        }
    }, [showPhotoWall, displayMode, approvedPhotos.length]);

    const nextPhoto = () => {
        setCurrentPhotoIndex(prev => (prev + 1) % approvedPhotos.length);
    };

    const prevPhoto = () => {
        setCurrentPhotoIndex(prev => (prev - 1 + approvedPhotos.length) % approvedPhotos.length);
    };

    const getTotalVotes = () => {
        if (!liveData?.activePoll?.votes) return 0;
        return Object.values(liveData.activePoll.votes).reduce((a, b) => a + b, 0);
    };

    const getVotePercentage = (option) => {
        const total = getTotalVotes();
        if (total === 0) return 0;
        return Math.round((liveData.activePoll.votes[option] / total) * 100);
    };

    const getMaxVotes = () => {
        if (!liveData?.activePoll?.votes) return 0;
        return Math.max(...Object.values(liveData.activePoll.votes), 1);
    };

    // Hype calculations
    const hypePercentage = Math.min((hypeLevel / maxHype) * 100, 100);
    const getHypeLabel = () => {
        if (hypePercentage > 80) return '🔥 ON FIRE!';
        if (hypePercentage > 60) return '🎉 HYPED!';
        if (hypePercentage > 40) return '⚡ Growing!';
        if (hypePercentage > 20) return '👏 Warming up';
        return '😴 Quiet...';
    };

    // Color palette for poll bars
    const barColors = [
        'from-purple-500 to-pink-500',
        'from-cyan-500 to-blue-500',
        'from-amber-500 to-orange-500',
        'from-emerald-500 to-teal-500',
        'from-rose-500 to-red-500',
    ];

    const poll = liveData?.activePoll;
    const totalVotes = getTotalVotes();

    return (
        <div className="min-h-screen text-white overflow-hidden relative">
            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col p-8 lg:p-12">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-full border border-red-500/30">
                            <Radio className="w-5 h-5 text-red-400 animate-pulse" />
                            <span className="text-red-400 font-bold uppercase tracking-wider text-sm">LIVE</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white/90 truncate max-w-xl">
                            {event?.name || 'Event'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-6 text-white/60">
                        {approvedPhotos.length > 0 && (
                            <button
                                onClick={() => setShowPhotoWall(!showPhotoWall)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${showPhotoWall
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white/10 hover:bg-white/20'}`}
                            >
                                <Camera className="w-5 h-5" />
                                <span className="font-semibold">Photo Wall ({approvedPhotos.length})</span>
                            </button>
                        )}
                        {showPhotoWall && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setDisplayMode('slideshow')}
                                    className={`p-2 rounded-lg transition-all ${displayMode === 'slideshow'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white/10 hover:bg-white/20'}`}
                                    title="Slideshow"
                                >
                                    <Monitor className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setDisplayMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${displayMode === 'grid'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white/10 hover:bg-white/20'}`}
                                    title="Grid"
                                >
                                    <LayoutGrid className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                        {poll && (
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                <span className="text-lg font-semibold">{totalVotes} votes</span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Photo Wall Display */}
                {showPhotoWall && approvedPhotos.length > 0 && (
                    <main className="flex-1 flex items-center justify-center p-8">
                        {displayMode === 'slideshow' ? (
                            /* Slideshow Mode */
                            <div className="relative w-full max-w-6xl mx-auto">
                                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black/50 backdrop-blur-sm border border-white/10">
                                    <img
                                        src={approvedPhotos[currentPhotoIndex]?.imageUrl}
                                        alt="Event moment"
                                        className="w-full h-full object-contain transition-opacity duration-500"
                                    />
                                    {/* Overlay with user name */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-8">
                                        <p className="text-2xl font-bold text-white">
                                            📸 {approvedPhotos[currentPhotoIndex]?.userName || 'Attendee'}
                                        </p>
                                        <p className="text-white/60 mt-1">
                                            Photo {currentPhotoIndex + 1} of {approvedPhotos.length}
                                        </p>
                                    </div>
                                </div>

                                {/* Navigation Arrows */}
                                {approvedPhotos.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevPhoto}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all"
                                        >
                                            <ChevronLeft className="w-8 h-8" />
                                        </button>
                                        <button
                                            onClick={nextPhoto}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all"
                                        >
                                            <ChevronRight className="w-8 h-8" />
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            /* Grid Mode */
                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                <div
                                    className="relative w-full h-full max-h-[85vh] grid gap-2 transition-all duration-500 ease-in-out place-content-center"
                                    style={{
                                        gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(approvedPhotos.length * 1.77))}, minmax(0, 1fr))`,
                                        gridTemplateRows: `repeat(${Math.ceil(approvedPhotos.length / Math.ceil(Math.sqrt(approvedPhotos.length * 1.77)))}, minmax(0, 1fr))`
                                    }}
                                >
                                    {approvedPhotos.map((photo, index) => (
                                        <div
                                            key={photo.id}
                                            className="group relative w-full aspect-square max-h-full mx-auto rounded-xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-sm bg-white/5 transform transition-all duration-500 hover:scale-[1.05] hover:z-10 hover:shadow-purple-500/50 hover:border-purple-400/50"
                                            style={{
                                                animation: `float 6s ease-in-out infinite`,
                                                animationDelay: `${index * 0.2}s`,
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                            <img
                                                src={photo.imageUrl}
                                                alt="Event moment"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />

                                            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                                <p className="text-white text-sm font-bold truncate tracking-wide">
                                                    {photo.userName || 'Attendee'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>
                )}

                {/* Main Content - Split Layout (hidden when photo wall is active) */}
                {!showPhotoWall && (
                    <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Poll Results (2/3 width) */}
                        <div className="lg:col-span-2 flex items-center justify-center">
                            {!poll ? (
                                <div className="text-center">
                                    <BarChart3 className="w-24 h-24 mx-auto mb-6 text-white/20" />
                                    <h2 className="text-3xl font-bold text-white/40">No Active Poll</h2>
                                    <p className="text-lg text-white/30 mt-2">Waiting for the organizer to start a poll...</p>
                                </div>
                            ) : (
                                <div className="w-full max-w-3xl mx-auto">
                                    {/* Question */}
                                    <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-center mb-10 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent leading-tight">
                                        {poll.question}
                                    </h2>

                                    {/* Bar Chart */}
                                    <div className="space-y-5">
                                        {poll.options.map((option, index) => {
                                            const voteCount = poll.votes[option] || 0;
                                            const percentage = getVotePercentage(option);
                                            const colorClass = barColors[index % barColors.length];
                                            const isLeading = voteCount === getMaxVotes() && voteCount > 0;

                                            return (
                                                <div
                                                    key={option}
                                                    className={`relative transition-all duration-500 ${isLeading ? 'scale-[1.02]' : ''}`}
                                                >
                                                    {/* Option Label */}
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-xl lg:text-2xl font-bold ${isLeading ? 'text-white' : 'text-white/80'}`}>
                                                            {option}
                                                        </span>
                                                        <div className="flex items-baseline gap-3">
                                                            <span className={`text-2xl lg:text-3xl font-black ${isLeading ? 'text-white' : 'text-white/70'}`}>
                                                                {percentage}%
                                                            </span>
                                                            <span className="text-lg text-white/40">
                                                                ({voteCount})
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Bar Background */}
                                                    <div className="relative h-14 lg:h-16 bg-white/5 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/10">
                                                        {/* Animated Bar */}
                                                        <div
                                                            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colorClass} rounded-2xl transition-all duration-700 ease-out shadow-lg`}
                                                            style={{
                                                                width: `${percentage}%`,
                                                                boxShadow: isLeading ? '0 0 40px rgba(168, 85, 247, 0.4)' : 'none'
                                                            }}
                                                        >
                                                            {/* Shine effect */}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 rounded-2xl" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Poll Status */}
                                    {poll.closed && (
                                        <div className="mt-8 text-center">
                                            <span className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 font-bold text-lg">
                                                Poll Closed - Final Results
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right: Hype Gauge (1/3 width) */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-white/80 flex items-center gap-2 justify-center">
                                    <Flame className="w-6 h-6 text-orange-500" />
                                    CROWD ENERGY
                                </h3>
                                <p className="text-white/50 mt-1">Make some noise!</p>
                            </div>

                            {/* Large Vertical Gauge */}
                            <div className="relative w-32 h-80 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                                {/* Gradient Fill */}
                                <div
                                    className="absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out rounded-b-3xl"
                                    style={{
                                        height: `${hypePercentage}%`,
                                        background: hypePercentage > 70
                                            ? 'linear-gradient(to top, #ef4444, #f97316, #fbbf24)'
                                            : hypePercentage > 40
                                                ? 'linear-gradient(to top, #f97316, #fbbf24)'
                                                : 'linear-gradient(to top, #eab308, #facc15)',
                                        boxShadow: hypePercentage > 60 ? '0 0 60px rgba(249, 115, 22, 0.6)' : 'none'
                                    }}
                                >
                                    {/* Bubbles/flame effect when high */}
                                    {hypePercentage > 50 && (
                                        <div className="absolute inset-0 overflow-hidden">
                                            <div className="absolute w-4 h-4 bg-white/30 rounded-full animate-ping" style={{ left: '20%', top: '10%' }} />
                                            <div className="absolute w-3 h-3 bg-white/20 rounded-full animate-ping" style={{ left: '60%', top: '30%', animationDelay: '0.5s' }} />
                                            <div className="absolute w-5 h-5 bg-white/25 rounded-full animate-ping" style={{ left: '40%', top: '50%', animationDelay: '1s' }} />
                                        </div>
                                    )}
                                </div>

                                {/* Percentage Label */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-4xl font-black text-white drop-shadow-lg">
                                        {Math.round(hypePercentage)}%
                                    </span>
                                </div>

                                {/* Flame icon at top when high */}
                                {hypePercentage > 60 && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-5xl animate-bounce">
                                        🔥
                                    </div>
                                )}
                            </div>

                            {/* Status Label */}
                            <div className="mt-6 text-center">
                                <span className={`text-2xl font-bold ${hypePercentage > 60 ? 'text-orange-400 animate-pulse' : 'text-white/60'
                                    }`}>
                                    {getHypeLabel()}
                                </span>
                            </div>
                        </div>
                    </main>
                )}

                {/* Footer */}
                <footer className="mt-8 text-center">
                    <p className="text-white/30 text-sm">
                        Powered by Event-X • Real-time updates
                    </p>
                </footer>
            </div>
            {/* CSS for animations */}
            <style>{`
                 @keyframes float {
                     0%, 100% { transform: translateY(0); }
                     50% { transform: translateY(-10px); }
                 }
                 @keyframes shine {
                     100% { transform: translateX(100%); }
                 }
                 @keyframes pulse-glow {
                     0%, 100% { opacity: 0.5; }
                     50% { opacity: 1; }
                 }
             `}</style>
        </div>
    );
};

export default BigScreenMain;
