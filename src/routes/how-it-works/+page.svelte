<!-- ABOUTME: Long-form content page explaining how Bingoals works and how to use it. -->
<!-- ABOUTME: Targets goal-tracking / new-year-resolution / bucket-list keywords for SEO. -->
<script lang="ts">
  import Logo from '$lib/components/Logo.svelte';
  import UserMenu from '$lib/components/UserMenu.svelte';
  import { OG_IMAGE, canonical, breadcrumbJsonLd, SITE_URL } from '$lib/seo';

  const title = 'How Bingoals works — a visual goal tracker that feels like a game';
  const description =
    'How to turn your yearly goals into a bingo board: pick 25 goals, check off squares as you finish, and aim for bingos. A walkthrough of the Bingoals goal-tracking app.';
  const url = canonical('/how-it-works');

  const breadcrumb = JSON.stringify(
    breadcrumbJsonLd([
      { name: 'Home', url: SITE_URL },
      { name: 'How it works', url }
    ])
  );
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={OG_IMAGE} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  {@html `<script type="application/ld+json">${breadcrumb}</script>`}
</svelte:head>

<div class="min-h-screen flex flex-col">
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <a href="/" class="flex items-center space-x-3" aria-label="Bingoals home">
          <Logo />
          <span class="text-xl font-bold text-gray-900">BINGOALS</span>
        </a>
        <UserMenu />
      </div>
    </div>
  </header>

  <main class="flex-1 py-12 px-4 sm:px-6 lg:px-8">
    <article class="max-w-3xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-10 prose prose-gray max-w-none">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          How Bingoals works
        </h1>
        <p class="text-lg text-gray-600 mb-8">
          A simple, free goal-tracker built around a 5×5 bingo board. Here's how to use it.
        </p>

        <section class="space-y-4 mb-10">
          <h2 class="text-2xl font-bold text-gray-900">Why a bingo board?</h2>
          <p class="leading-relaxed text-gray-700">
            Spreadsheets and to-do apps are great at making goals feel like work. A bingo board
            is different. The grid is small enough that you can see every goal at a glance, big
            enough that you need to be intentional about what makes the cut. Filled squares
            light up. Completed rows and columns highlight. There's a clear, satisfying
            milestone — a bingo — that has nothing to do with productivity metrics.
          </p>
          <p class="leading-relaxed text-gray-700">
            It works for yearly goals, new year's resolutions, bucket lists, summer challenges,
            quarterly OKR-style targets, or just a list of things you've been putting off.
          </p>
        </section>

        <section class="space-y-4 mb-10">
          <h2 class="text-2xl font-bold text-gray-900">The five-step setup</h2>

          <h3 class="text-xl font-semibold text-gray-900 mt-6">1. Brainstorm 25 goals</h3>
          <p class="leading-relaxed text-gray-700">
            Aim for a mix. Concrete and ambitious. Solo and social. Quick wins and stretch
            goals. A few categories to spark ideas:
          </p>
          <ul class="list-disc list-inside leading-relaxed text-gray-700 space-y-1">
            <li><strong>Fitness:</strong> run a 5k, hike 12 trails, learn to swim, do 100 push-ups in a row.</li>
            <li><strong>Travel:</strong> visit a new country, take a road trip, see three national parks.</li>
            <li><strong>Creative:</strong> write a short story, ship a side project, learn an instrument.</li>
            <li><strong>Personal:</strong> read 12 books, journal weekly, call a friend every Sunday.</li>
            <li><strong>Career:</strong> finish a course, give a talk, switch jobs, ask for a raise.</li>
            <li><strong>Money:</strong> build an emergency fund, pay off a card, save 20% of income.</li>
            <li><strong>Habits:</strong> meditate daily, cook three meals a week, no phone after 10pm.</li>
          </ul>

          <h3 class="text-xl font-semibold text-gray-900 mt-6">2. Drop them onto the board</h3>
          <p class="leading-relaxed text-gray-700">
            Click any empty square and type. The order doesn't really matter — the grid is just
            a way to see everything together. The center square is treated like any other goal;
            there's no "free space."
          </p>

          <h3 class="text-xl font-semibold text-gray-900 mt-6">3. Add notes and milestones</h3>
          <p class="leading-relaxed text-gray-700">
            Bigger goals usually need a plan. Open any square to add notes (rich text) and
            sub-tasks called milestones. Milestones get their own checkboxes — useful for
            multi-step goals like "ship a side project" or "save $5000."
          </p>

          <h3 class="text-xl font-semibold text-gray-900 mt-6">4. Check off squares as you finish</h3>
          <p class="leading-relaxed text-gray-700">
            One tap completes a square. Every completed row, column, and diagonal lights up
            automatically. A full board (all 25 squares) is a blackout — the highest score in
            bingo, and a real accomplishment in goal-setting.
          </p>

          <h3 class="text-xl font-semibold text-gray-900 mt-6">5. Share your board</h3>
          <p class="leading-relaxed text-gray-700">
            Flip the public toggle on any board and copy the share link. Friends and family can
            view your board in read-only mode — they see your progress, but only you can edit.
            It's a low-pressure way to invite accountability.
          </p>
        </section>

        <section class="space-y-4 mb-10">
          <h2 class="text-2xl font-bold text-gray-900">Tips for picking good goals</h2>
          <ul class="list-disc list-inside leading-relaxed text-gray-700 space-y-2">
            <li>
              <strong>Make most goals specific.</strong> "Run a 5k" beats "get fit." The clarity
              is what makes the checkbox satisfying.
            </li>
            <li>
              <strong>Include a few easy wins.</strong> Five or six low-friction goals (cook a
              new recipe, finish that book on your nightstand) keep momentum going.
            </li>
            <li>
              <strong>Leave room for ambition.</strong> Two or three "I'm not sure I can do
              this" goals make the board feel meaningful.
            </li>
            <li>
              <strong>Avoid maintenance habits in single squares.</strong> "Floss every day"
              doesn't finish — use a milestone-heavy goal like "build a daily flossing habit:
              30 days unbroken" instead.
            </li>
            <li>
              <strong>One goal per square.</strong> "Read 12 books and exercise more" is two
              goals. Pick one or the other.
            </li>
          </ul>
        </section>

        <section class="space-y-4 mb-10">
          <h2 class="text-2xl font-bold text-gray-900">Bingoals vs. other goal-tracking apps</h2>
          <p class="leading-relaxed text-gray-700">
            If you're used to Notion templates, Habitica, Streaks, or paper bullet journals,
            Bingoals occupies a different niche. It's not a habit tracker (no daily streaks),
            not a task manager (no dates or priorities), not an OKR tool (no metrics). It's a
            <em>visual annual goal board</em> — one screen, 25 goals, ticked off over the
            course of a year. The simplicity is the feature.
          </p>
        </section>

        <section class="space-y-4 mb-10">
          <h2 class="text-2xl font-bold text-gray-900">Ready to start?</h2>
          <p class="leading-relaxed text-gray-700 mb-4">
            No sign-up required. Make a board, add your goals, and bookmark the URL.
          </p>
          <a
            href="/"
            class="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors no-underline"
          >
            Create your bingo board →
          </a>
        </section>
      </div>
    </article>
  </main>

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
