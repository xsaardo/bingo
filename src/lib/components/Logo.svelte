<!-- ABOUTME: Bingoal logo mark — a 3x3 bingo grid with stars in the completed cells. -->
<!-- ABOUTME: Accepts a size prop (CSS value) to control width/height of the wrapping box. -->
<script lang="ts">
	let { size = '2.5rem' }: { size?: string } = $props();
</script>

<div
	class="bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"
	style="width: {size}; height: {size};"
>
	<svg
		style="width: calc({size} * 0.625); height: calc({size} * 0.625);"
		viewBox="0 0 22 22"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" />
		<polygon points="4,1.8 4.529,3.272 6.092,3.320 4.856,4.278 5.293,5.780 4,4.9 2.707,5.780 3.144,4.278 1.908,3.320 3.471,3.272" fill="#2563eb" />
		<rect x="8" y="1" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5" />
		<rect x="15" y="1" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5" />
		<rect x="1" y="8" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5" />
		<rect x="8" y="8" width="6" height="6" rx="1.5" fill="white" />
		<polygon points="11,8.8 11.529,10.272 13.092,10.320 11.856,11.278 12.293,12.780 11,11.9 9.707,12.780 10.144,11.278 8.908,10.320 10.471,10.272" fill="#2563eb" />
		<rect x="15" y="8" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5" />
		<rect x="1" y="15" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5" />
		<rect x="8" y="15" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5" />
		<rect x="15" y="15" width="6" height="6" rx="1.5" fill="white" />
		<polygon points="18,15.8 18.529,17.272 20.092,17.320 18.856,18.278 19.293,19.780 18,18.9 16.707,19.780 17.144,18.278 15.908,17.320 17.471,17.272" fill="#2563eb" />
	</svg>
</div>
