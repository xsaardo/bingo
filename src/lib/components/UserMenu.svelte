<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentUser, authStore } from '$lib/stores/auth';
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';

	let isOpen = false;
	let showLogoutConfirm = false;

	function toggleMenu() {
		isOpen = !isOpen;
	}

	function closeMenu() {
		isOpen = false;
	}

	function showLogoutConfirmation() {
		showLogoutConfirm = true;
		closeMenu();
	}

	async function handleLogout() {
		const result = await authStore.logout();

		if (result.success) {
			showLogoutConfirm = false;
			goto('/auth/login');
		} else {
			alert(`Logout failed: ${result.error}`);
		}
	}

	function handleCancelLogout() {
		showLogoutConfirm = false;
	}

	// Close menu when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const menu = document.getElementById('user-menu');
		const button = document.getElementById('user-menu-button');

		if (menu && button && !menu.contains(target) && !button.contains(target)) {
			closeMenu();
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<div class="relative">
	<!-- User Menu Button -->
	<button
		id="user-menu-button"
		onclick={toggleMenu}
		class="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
		aria-expanded={isOpen}
		aria-haspopup="true"
	>
		<!-- User Avatar -->
		<div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
			{$currentUser?.email?.charAt(0).toUpperCase() || 'U'}
		</div>

		<!-- User Email (hidden on mobile) -->
		<span class="hidden sm:block text-sm font-medium text-gray-700 max-w-[150px] truncate">
			{$currentUser?.email || 'User'}
		</span>

		<!-- Dropdown Arrow -->
		<svg
			class="w-4 h-4 text-gray-500 transition-transform {isOpen ? 'rotate-180' : ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div
			id="user-menu"
			class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
		>
			<!-- User Info -->
			<div class="px-4 py-3 border-b border-gray-100">
				<p class="text-sm text-gray-500">Signed in as</p>
				<p class="text-sm font-medium text-gray-900 truncate">{$currentUser?.email}</p>
			</div>

			<!-- Menu Items -->
			<div class="py-1">
				<!-- Dashboard Link -->
				<a
					href="/dashboard"
					onclick={closeMenu}
					class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
				>
					<div class="flex items-center">
						<svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							/>
						</svg>
						My Boards
					</div>
				</a>

				<!-- Test Auth (dev only) -->
				{#if import.meta.env.DEV}
					<a
						href="/test-auth"
						onclick={closeMenu}
						class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
					>
						<div class="flex items-center">
							<svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
							Test Auth (Debug)
						</div>
					</a>
				{/if}
			</div>

			<!-- Logout -->
			<div class="border-t border-gray-100 py-1">
				<button
					onclick={showLogoutConfirmation}
					class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
				>
					<div class="flex items-center">
						<svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
						Sign out
					</div>
				</button>
			</div>
		</div>
	{/if}
</div>

<!-- Logout Confirmation Modal -->
<ConfirmationModal
	isOpen={showLogoutConfirm}
	title="Sign Out"
	message="Are you sure you want to sign out?"
	confirmText="Sign Out"
	confirmVariant="danger"
	onConfirm={handleLogout}
	onCancel={handleCancelLogout}
/>
