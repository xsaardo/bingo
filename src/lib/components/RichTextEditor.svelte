<!-- ABOUTME: Rich text editor component powered by TipTap -->
<!-- ABOUTME: Provides formatting toolbar and HTML content management for goal notes -->

<script lang="ts">
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import Underline from '@tiptap/extension-underline';
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		content: string;
		placeholder?: string;
		onUpdate: (html: string) => void;
	}

	let { content, placeholder = '', onUpdate }: Props = $props();

	let element = $state<HTMLDivElement>();
	let editorState = $state<{ editor: Editor | null }>({ editor: null });

	onMount(() => {
		editorState.editor = new Editor({
			element: element,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3]
					},
					codeBlock: false,
					code: false
				}),
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						class: 'text-blue-600 underline'
					}
				}),
				Underline
			],
			content: content,
			onTransaction: ({ editor }) => {
				editorState = { editor };
			},
			onUpdate: ({ editor }) => {
				onUpdate(editor.getHTML());
			},
			editorProps: {
				attributes: {
					class: 'prose prose-sm focus:outline-none min-h-[200px] p-3',
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
		return `px-2 py-1 rounded border transition-colors ${
			isActive
				? 'bg-blue-100 border-blue-400 text-blue-700'
				: 'border-gray-300 hover:bg-gray-100 text-gray-700'
		}`;
	}
</script>

<div class="border border-gray-300 rounded-lg" data-testid="rich-text-editor-container">
	{#if editorState.editor}
		<!-- Toolbar -->
		<div class="border-b border-gray-300 p-2 flex gap-1 flex-wrap bg-gray-50">
			<!-- Bold -->
			<button
				type="button"
				onclick={() => editorState.editor?.chain().focus().toggleBold().run()}
				class={getButtonClass(editorState.editor.isActive('bold'))}
				data-testid="editor-bold-button"
				title="Bold (Ctrl+B)"
			>
				<strong>B</strong>
			</button>

			<!-- Italic -->
			<button
				type="button"
				onclick={() => editorState.editor?.chain().focus().toggleItalic().run()}
				class={getButtonClass(editorState.editor.isActive('italic'))}
				data-testid="editor-italic-button"
				title="Italic (Ctrl+I)"
			>
				<em>I</em>
			</button>

			<!-- Underline -->
			<button
				type="button"
				onclick={() => editorState.editor?.chain().focus().toggleUnderline().run()}
				class={getButtonClass(editorState.editor.isActive('underline'))}
				data-testid="editor-underline-button"
				title="Underline (Ctrl+U)"
			>
				<span style="text-decoration: underline;">U</span>
			</button>

			<!-- Strikethrough -->
			<button
				type="button"
				onclick={() => editorState.editor?.chain().focus().toggleStrike().run()}
				class={getButtonClass(editorState.editor.isActive('strike'))}
				data-testid="editor-strike-button"
				title="Strikethrough"
			>
				<s>S</s>
			</button>

			<!-- Heading dropdown -->
			<select
				onchange={(e) => {
					const value = (e.target as HTMLSelectElement).value;
					if (value === 'h1') editorState.editor?.chain().focus().toggleHeading({ level: 1 }).run();
					else if (value === 'h2')
						editorState.editor?.chain().focus().toggleHeading({ level: 2 }).run();
					else if (value === 'h3')
						editorState.editor?.chain().focus().toggleHeading({ level: 3 }).run();
					else editorState.editor?.chain().focus().setParagraph().run();
					(e.target as HTMLSelectElement).value = '';
				}}
				class="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-sm"
				data-testid="editor-heading-button"
				title="Headings"
			>
				<option value="">Heading</option>
				<option value="h1">H1</option>
				<option value="h2">H2</option>
				<option value="h3">H3</option>
				<option value="p">Paragraph</option>
			</select>

			<!-- Bullet list -->
			<button
				type="button"
				onclick={() => editorState.editor?.chain().focus().toggleBulletList().run()}
				class={getButtonClass(editorState.editor.isActive('bulletList'))}
				data-testid="editor-bullet-list-button"
				title="Bullet List"
			>
				•
			</button>

			<!-- Ordered list -->
			<button
				type="button"
				onclick={() => editorState.editor?.chain().focus().toggleOrderedList().run()}
				class={getButtonClass(editorState.editor.isActive('orderedList'))}
				data-testid="editor-ordered-list-button"
				title="Numbered List"
			>
				1.
			</button>

			<!-- Link -->
			<button
				type="button"
				onclick={setLink}
				class={getButtonClass(editorState.editor.isActive('link'))}
				data-testid="editor-link-button"
				title="Add Link"
			>
				🔗
			</button>
		</div>
	{/if}

	<!-- Editor content area -->
	<div bind:this={element}></div>
</div>
