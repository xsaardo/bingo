<!-- ABOUTME: Full-page confetti animation overlay for bingo celebrations -->
<!-- ABOUTME: Renders randomized particles that fall from top to bottom of the viewport -->

<script lang="ts">
	const PARTICLE_COUNT = 80;
	const COLORS = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

	interface Particle {
		id: number;
		color: string;
		left: number;
		delay: number;
		duration: number;
		width: number;
		height: number;
		startRotation: number;
	}

	function randomBetween(min: number, max: number): number {
		return Math.random() * (max - min) + min;
	}

	const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
		id: i,
		color: COLORS[Math.floor(Math.random() * COLORS.length)],
		left: randomBetween(0, 100),
		delay: randomBetween(0, 3),
		duration: randomBetween(2.5, 4.5),
		width: randomBetween(6, 12),
		height: randomBetween(8, 16),
		startRotation: randomBetween(0, 360)
	}));
</script>

<div class="confetti-container" aria-hidden="true">
	{#each particles as p (p.id)}
		<div
			class="confetti-piece"
			style="
				left: {p.left}vw;
				background-color: {p.color};
				width: {p.width}px;
				height: {p.height}px;
				animation-delay: {p.delay}s;
				animation-duration: {p.duration}s;
				--start-rotation: {p.startRotation}deg;
			"
		></div>
	{/each}
</div>

<style>
	.confetti-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1000;
		overflow: hidden;
	}

	.confetti-piece {
		position: absolute;
		top: -20px;
		border-radius: 2px;
		opacity: 0;
		animation: confetti-fall linear forwards;
	}

	@keyframes confetti-fall {
		0% {
			transform: translateY(0) rotate(var(--start-rotation));
			opacity: 1;
		}
		80% {
			opacity: 1;
		}
		100% {
			transform: translateY(105vh) rotate(calc(var(--start-rotation) + 720deg));
			opacity: 0;
		}
	}
</style>
