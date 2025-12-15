import React, { useEffect, useRef, useState } from 'react';

const InteractiveGridBackground = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const gridRef = useRef([]);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Grid configuration
        const gridSize = 50;
        const dotRadius = 1.5;
        const interactionRadius = 150;
        const maxDisplacement = 20;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initGrid();
        };

        // Initialize grid points
        const initGrid = () => {
            gridRef.current = [];
            const cols = Math.ceil(canvas.width / gridSize) + 1;
            const rows = Math.ceil(canvas.height / gridSize) + 1;

            for (let i = 0; i <= cols; i++) {
                for (let j = 0; j <= rows; j++) {
                    gridRef.current.push({
                        originX: i * gridSize,
                        originY: j * gridSize,
                        x: i * gridSize,
                        y: j * gridSize,
                        vx: 0,
                        vy: 0,
                    });
                }
            }
        };

        // Handle mouse movement
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw grid lines (vertical)
            const cols = Math.ceil(canvas.width / gridSize) + 1;
            const rows = Math.ceil(canvas.height / gridSize) + 1;

            ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
            ctx.lineWidth = 1;

            // Draw vertical lines
            for (let i = 0; i <= cols; i++) {
                ctx.beginPath();
                ctx.moveTo(i * gridSize, 0);
                ctx.lineTo(i * gridSize, canvas.height);
                ctx.stroke();
            }

            // Draw horizontal lines
            for (let j = 0; j <= rows; j++) {
                ctx.beginPath();
                ctx.moveTo(0, j * gridSize);
                ctx.lineTo(canvas.width, j * gridSize);
                ctx.stroke();
            }

            // Update and draw dots
            gridRef.current.forEach((point) => {
                const dx = mouseRef.current.x - point.originX;
                const dy = mouseRef.current.y - point.originY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < interactionRadius) {
                    const force = (interactionRadius - distance) / interactionRadius;
                    const angle = Math.atan2(dy, dx);
                    const displacement = force * maxDisplacement;

                    point.x = point.originX - Math.cos(angle) * displacement;
                    point.y = point.originY - Math.sin(angle) * displacement;
                } else {
                    // Smooth return to origin
                    point.x += (point.originX - point.x) * 0.1;
                    point.y += (point.originY - point.y) * 0.1;
                }

                // Calculate glow intensity based on distance
                const glowDistance = Math.sqrt(
                    Math.pow(mouseRef.current.x - point.x, 2) +
                    Math.pow(mouseRef.current.y - point.y, 2)
                );
                const glowIntensity = Math.max(0, 1 - glowDistance / interactionRadius);

                // Draw dot with glow
                const baseAlpha = 0.3;
                const alpha = baseAlpha + glowIntensity * 0.7;
                const radius = dotRadius + glowIntensity * 3;

                // Outer glow
                if (glowIntensity > 0) {
                    const gradient = ctx.createRadialGradient(
                        point.x, point.y, 0,
                        point.x, point.y, radius * 4
                    );
                    gradient.addColorStop(0, `rgba(139, 92, 246, ${glowIntensity * 0.5})`);
                    gradient.addColorStop(0.5, `rgba(99, 102, 241, ${glowIntensity * 0.2})`);
                    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

                    ctx.beginPath();
                    ctx.fillStyle = gradient;
                    ctx.arc(point.x, point.y, radius * 4, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Core dot
                ctx.beginPath();
                ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
                ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw connecting lines between nearby dots under mouse
            gridRef.current.forEach((point, i) => {
                const distToMouse = Math.sqrt(
                    Math.pow(mouseRef.current.x - point.x, 2) +
                    Math.pow(mouseRef.current.y - point.y, 2)
                );

                if (distToMouse < interactionRadius * 1.2) {
                    gridRef.current.slice(i + 1).forEach((otherPoint) => {
                        const distBetween = Math.sqrt(
                            Math.pow(point.x - otherPoint.x, 2) +
                            Math.pow(point.y - otherPoint.y, 2)
                        );

                        if (distBetween < gridSize * 1.5) {
                            const otherDistToMouse = Math.sqrt(
                                Math.pow(mouseRef.current.x - otherPoint.x, 2) +
                                Math.pow(mouseRef.current.y - otherPoint.y, 2)
                            );

                            if (otherDistToMouse < interactionRadius * 1.2) {
                                const avgDist = (distToMouse + otherDistToMouse) / 2;
                                const lineAlpha = Math.max(0, 0.4 - avgDist / (interactionRadius * 1.5));

                                ctx.beginPath();
                                ctx.strokeStyle = `rgba(139, 92, 246, ${lineAlpha})`;
                                ctx.lineWidth = 1;
                                ctx.moveTo(point.x, point.y);
                                ctx.lineTo(otherPoint.x, otherPoint.y);
                                ctx.stroke();
                            }
                        }
                    });
                }
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        // Initialize
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
                background: 'linear-gradient(180deg, #fafafa 0%, #f5f3ff 50%, #f0f0ff 100%)',
            }}
        />
    );
};

export default InteractiveGridBackground;
