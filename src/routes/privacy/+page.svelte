<script lang="ts">
  import Logo from '$lib/components/Logo.svelte';
  import UserMenu from '$lib/components/UserMenu.svelte';
</script>

<svelte:head>
  <title>Privacy Policy — Bingoals</title>
  <meta name="description" content="Bingoals privacy policy." />
  <meta property="og:description" content="Bingoals privacy policy." />
</svelte:head>

<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <a href="/" class="flex items-center space-x-3">
          <Logo />
          <h1 class="text-xl font-bold text-gray-900">BINGOALS</h1>
        </a>
        <UserMenu />
      </div>
    </div>
  </header>

  <!-- Content -->
  <main class="flex-1 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-10">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p class="text-sm text-gray-400 mb-8">Effective date: March 7, 2026</p>

        <div class="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 class="text-lg font-semibold text-gray-900 mb-3">1. What We Collect</h2>
            <p>When you use Bingoals, we may collect the following information:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Email address</strong> — when you sign in via magic link (Supabase authentication).
                We use this solely to authenticate you.
              </li>
              <li>
                <strong>Board content</strong> — the names and completion status of goals you enter on
                your bingo board.
              </li>
              <li>
                <strong>Anonymous session data</strong> — if you use Bingoals without signing in, we assign
                your board to an anonymous session stored in your browser's local storage. No personal
                information is collected.
              </li>
            </ul>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-gray-900 mb-3">2. How We Store Your Data</h2>
            <p>
              Your data is stored securely using <strong>Supabase</strong>, a cloud database service
              hosted in the <strong>United States</strong>. Supabase encrypts data at rest and in
              transit. We do not store passwords — authentication is handled via email magic links.
            </p>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-gray-900 mb-3">3. How Long We Keep It</h2>
            <ul class="list-disc pl-5 space-y-1">
              <li>
                <strong>Anonymous boards</strong> are automatically deleted after
                <strong>30 days of inactivity</strong>.
              </li>
              <li>
                <strong>Signed-in accounts</strong> and their boards are retained until you request deletion
                or close your account.
              </li>
            </ul>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-gray-900 mb-3">4. How to Request Deletion</h2>
            <p>
              To request deletion of your data, email us at
              <a
                href="mailto:privacy@bingoals.app"
                class="text-blue-600 hover:text-blue-700 underline">privacy@bingoals.app</a
              >. We will delete your account and associated data within 30 days of receiving your
              request.
            </p>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-gray-900 mb-3">5. Third Parties</h2>
            <p>
              We do <strong>not</strong> sell, rent, or share your personal data with any third parties
              for marketing purposes. We use Supabase solely to store and serve your data as part of the
              product.
            </p>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-gray-900 mb-3">6. Cookies &amp; Local Storage</h2>
            <p>
              Bingoals uses browser local storage to keep track of your anonymous board session. We
              do not use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-gray-900 mb-3">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we'll update the
              effective date at the top of this page. Continued use of Bingoals after changes
              constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-gray-900 mb-3">8. Contact</h2>
            <p>
              Questions? Email us at
              <a
                href="mailto:privacy@bingoals.app"
                class="text-blue-600 hover:text-blue-700 underline">privacy@bingoals.app</a
              >.
            </p>
          </section>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="py-6 text-center text-sm text-gray-400">
    <p>
      © {new Date().getFullYear()} Bingoals &middot;
      <a href="/about" class="hover:text-gray-600 transition-colors">About</a>
      &middot;
      <a href="/privacy" class="hover:text-gray-600 transition-colors">Privacy</a>
      &middot;
      <a href="/terms" class="hover:text-gray-600 transition-colors">Terms</a>
    </p>
  </footer>
</div>
