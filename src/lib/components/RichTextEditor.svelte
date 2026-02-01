<!-- ABOUTME: Rich text editor component powered by TipTap -->
<!-- ABOUTME: Provides formatting toolbar and HTML content management for goal notes -->

<script lang="ts">
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import Underline from '@tiptap/extension-underline';
	import Placeholder from '@tiptap/extension-placeholder';
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		content: string;
		placeholder?: string;
		onUpdate: (html: string) => void;
	}

	let { content, placeholder = 'Add description', onUpdate }: Props = $props();

	let element = $state<HTMLDivElement>();
	let editorState = $state<{ editor: Editor | null }>({ editor: null });
	let isFocused = $state(false);

	onMount(() => {
		editorState.editor = new Editor({
			element: element,
			extensions: [
				StarterKit.configure({
					heading: false,
					codeBlock: false,
					code: false
				}),
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						class: 'text-blue-600 underline'
					}
				}),
				Underline,
				Placeholder.configure({
					placeholder: placeholder
				})
			],
			content: content,
			onTransaction: ({ editor }) => {
				editorState = { editor };
			},
			onUpdate: ({ editor }) => {
				onUpdate(editor.getHTML());
			},
			onFocus: () => {
				isFocused = true;
			},
			onBlur: () => {
				isFocused = false;
			},
			editorProps: {
				attributes: {
					class: 'focus:outline-none min-h-[120px] px-3 py-2 text-sm text-gray-700',
					'data-testid': 'rich-text-editor'
				}
			}
		});
	});

	onDestroy(() => {
		editorState.editor?.destroy();
	});

	function setLink() {
		const url = window.prompt('Enter URL:');
		if (url) {
			editorState.editor?.chain().focus().setLink({ href: url }).run();
		}
	}

	function getButtonClass(isActive: boolean): string {
		return `p-2 transition-colors rounded hover:bg-gray-200 ${
			isActive ? 'bg-gray-200 text-gray-900' : 'text-gray-700'
		}`;
	}
</script>

<style>
	:global(.ProseMirror p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		color: #9ca3af;
		pointer-events: none;
		height: 0;
	}
</style>

<div class="bg-gray-50 rounded-lg overflow-hidden" data-testid="rich-text-editor-container">
	{#if editorState.editor}
		<!-- Toolbar -->
		<div class="px-3 py-2 flex items-center gap-0.5">
			<!-- Bold -->
			<button
				type="button"
				onclick={() => editorState.editor?.chain().focus().toggleBold().run()}
				class={getButtonClass(editorState.editor.isActive('bold'))}
				data-testid="editor-bold-button"
				title="Bold (Ctrl+B)"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"
					/>
				</svg>
			</button>

			<!-- Italic -->
			<button
				type="button"
				onclick={() => editorState.editor?.chain().focus().toggleItalic().run()}
				class={getButtonClass(editorState.editor.isActive('italic'))}
				data-testid="editor-italic-button"
				title="Italic (Ctrl+I)"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
					<path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
				</svg>
			</button>

			<!-- Underline -->
			<button
				type="button"
				onclick={() => editorState.editor?.chain().focus().toggleUnderline().run()}
				class={getButtonClass(editorState.editor.isActive('underline'))}
				data-testid="editor-underline-button"
				title="Underline (Ctrl+U)"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"
					/>
				</svg>
			</button>

			<!-- Divider -->
			<div class="w-px h-6 bg-gray-300 mx-1"></div>

			<!-- Bullet list -->
			<button
				type="button"
				onclick={() => editorState.editor?.chain().focus().toggleBulletList().run()}
				class={getButtonClass(editorState.editor.isActive('bulletList'))}
				data-testid="editor-bullet-list-button"
				title="Bullet List"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"
					/>
				</svg>
			</button>

			<!-- Ordered list -->
			<button
				type="button"
				onclick={() => editorState.editor?.chain().focus().toggleOrderedList().run()}
				class={getButtonClass(editorState.editor.isActive('orderedList'))}
				data-testid="editor-ordered-list-button"
				title="Numbered List"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"
					/>
				</svg>
			</button>

			<!-- Divider -->
			<div class="w-px h-6 bg-gray-300 mx-1"></div>

			<!-- Link -->
			<button
				type="button"
				onclick={setLink}
				class={getButtonClass(editorState.editor.isActive('link'))}
				data-testid="editor-link-button"
				title="Add Link"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
					/>
				</svg>
			</button>
		</div>
	{/if}

	<!-- Editor content area with focus border -->
	<div
		class="bg-white border-b-2 transition-colors {isFocused
			? 'border-blue-500'
			: 'border-gray-300'}"
	>
		<div bind:this={element}></div>
	</div>
</div>
