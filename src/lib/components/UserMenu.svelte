<script lang="ts">
  import { goto } from '$app/navigation';
  import { currentUser, authStore } from '$lib/stores/auth';
  import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

  let showLogoutConfirm = $state(false);

  function showLogoutConfirmation() {
    showLogoutConfirm = true;
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
</script>

<div class="relative">
  {#if !$currentUser?.email}
    <!-- Login Button (unauthenticated / anonymous) -->
    <a
      href="/auth/login"
      class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
    >
      Login
    </a>
  {:else}
    <!-- User Dropdown Menu -->
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        class="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="User menu"
        data-testid="user-menu-button"
      >
        <!-- User Avatar -->
        <div
          class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm"
        >
          {$currentUser.email.charAt(0).toUpperCase()}
        </div>

        <!-- Dropdown Arrow -->
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content class="w-64" align="end">
        <!-- User Info Label -->
        <div class="px-3 py-3 border-b border-gray-100">
          <p class="text-xs text-gray-500">Signed in as</p>
          <p class="text-sm font-medium text-gray-900 truncate">{$currentUser?.email}</p>
        </div>

        <!-- Menu Items -->
        {#if import.meta.env.DEV}
          <DropdownMenu.Item>
            <a href="/test-auth" class="flex items-center w-full">
              <svg
                class="w-4 h-4 mr-3 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
        {/if}

        <!-- Logout -->
        <DropdownMenu.Item
          class="text-red-600 hover:bg-red-50 focus:bg-red-50"
          onclick={showLogoutConfirmation}
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
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
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
