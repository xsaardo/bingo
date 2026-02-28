<!-- ABOUTME: Full-page confetti animation overlay for bingo celebrations -->
<!-- ABOUTME: Canvas-based particle system for smooth, performant confetti rendering -->

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	const PARTICLE_COUNT = 60;
	const COLORS = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
	const GRAVITY = 0.15;
	const WIND = 0.05;

	interface Particle {
		x: number;
		y: number;
		vx: number;
		vy: number;
		width: number;
		height: number;
		rotation: number;
		rotationSpeed: number;
		color: string;
		opacity: number;
		delay: number; // frames before this particle activates
	}

	function randomBetween(min: number, max: number): number {
		return Math.random() * (max - min) + min;
	}

	let canvas: HTMLCanvasElement;
	let animationId: number;
	let frameCount = 0;

	function createParticle(index: number): Particle {
		return {
			x: randomBetween(0, window.innerWidth),
			y: randomBetween(-50, -10),
			vx: randomBetween(-1.5, 1.5),
			vy: randomBetween(1.5, 3.5),
			width: randomBetween(6, 12),
			height: randomBetween(8, 16),
			rotation: randomBetween(0, Math.PI * 2),
			rotationSpeed: randomBetween(-0.08, 0.08),
			color: COLORS[Math.floor(Math.random() * COLORS.length)],
			opacity: 1,
			delay: Math.floor(randomBetween(0, 90)) // up to 1.5s at 60fps
		};
	}

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		function resize() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}
		resize();
		window.addEventListener('resize', resize);

		const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) =>
			createParticle(i)
		);

		function draw() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			let activeCount = 0;

			for (const p of particles) {
				if (p.delay > 0) {
					p.delay--;
					activeCount++;
					continue;
				}

				// Physics
				p.vy += GRAVITY;
				p.vx += Math.sin(frameCount * 0.02) * WIND;
				p.x += p.vx;
				p.y += p.vy;
				p.rotation += p.rotationSpeed;

				// Fade out near bottom
				if (p.y > canvas.height * 0.75) {
					p.opacity = Math.max(0, 1 - (p.y - canvas.height * 0.75) / (canvas.height * 0.25));
				}

				if (p.opacity <= 0 || p.y > canvas.height + 20) {
					continue;
				}

				activeCount++;

				ctx.save();
				ctx.translate(p.x, p.y);
				ctx.rotate(p.rotation);
				ctx.globalAlpha = p.opacity;
				ctx.fillStyle = p.color;
				ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
				ctx.restore();
			}

			frameCount++;

			if (activeCount === 0) {
				return; // All particles done — stop the loop
			}

			animationId = requestAnimationFrame(draw);
		}

		animationId = requestAnimationFrame(draw);

		return () => {
			window.removeEventListener('resize', resize);
			cancelAnimationFrame(animationId);
		};
	});

	onDestroy(() => {
		cancelAnimationFrame(animationId);
	});
</script>

<canvas
	bind:this={canvas}
	class="confetti-canvas"
	aria-hidden="true"
></canvas>

<style>
	.confetti-canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1000;
	}
</style>
