<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import Header from "$lib/components/Header.svelte";
    import MarkdownEditor from "$lib/components/MarkdownEditor.svelte";
    import { uiScale } from "$lib/stores/uiScale";
    import Icon from "@iconify/svelte";
    import { toast } from "svelte-sonner";
    import type { Collection, SavedResult } from "$lib/db/schema";

    // State for document
    let documentId = $state<number | null>(null);
    let documentTitle = $state("");
    let documentContent = $state("");
    let isLoading = $state(false);
    let isSaving = $state(false);

    // State for collections
    let collections = $state<Collection[]>([]);
    let isLoadingCollections = $state(false);
    let selectedCollectionId = $state<number | null>(null);
    let showSaveModal = $state(false);
    let fromQuery = $state<string | null>(null);
    let showChatWindow = $state(false);

    // Chat state
    interface ChatMessage {
        role: string;
        content: string;
        suggestedEdit?: string; // Optional: contains suggested document edit
    }

    let chatMessages = $state<Array<ChatMessage>>([
        {
            role: "assistant",
            content:
                "Hi! I'm your AI research assistant. I can help you with your document and edit it when you ask. Just tell me what changes you'd like!",
        },
    ]);
    let chatInput = $state("");
    let isChatLoading = $state(false);

    // Chat window dimensions (positioned with bottom/right to anchor bottom-right corner)
    let chatWindowRight = $state(24);
    let chatWindowBottom = $state(24);
    let chatWindowWidth = $state(420);
    let chatWindowHeight = $state(550);
    let isResizing = $state<string | null>(null);
    let resizeStartX = $state(0);
    let resizeStartY = $state(0);
    let resizeStartWidth = $state(0);
    let resizeStartHeight = $state(0);
    let resizeStartRight = $state(0);
    let resizeStartBottom = $state(0);

    // Derived values
    let wordCount = $derived(
        documentContent.trim() ? documentContent.trim().split(/\s+/).length : 0,
    );
    let charCount = $derived(documentContent.length);
    let isNewDocument = $derived(documentId === null);
    let currentCollection = $derived(
        selectedCollectionId
            ? collections.find((c) => c.id === selectedCollectionId)
            : null,
    );

    // Get current user email from localStorage
    let currentUserEmail = $state<string | null>(null);

    // Load user email from localStorage on mount
    onMount(() => {
        const storedEmail = localStorage.getItem("user_email");
        if (storedEmail) {
            currentUserEmail = storedEmail;
        } else {
            // If no email, redirect to home page
            goto("/");
        }
    });

    // Load document if ID is provided in URL params
    $effect(() => {
        const id = $page.url.searchParams.get("id");
        const urlParam = $page.url.searchParams.get("url");
        const fromQueryParam = $page.url.searchParams.get("fromQuery");

        // Store fromQuery for back navigation
        if (fromQueryParam) {
            fromQuery = fromQueryParam;
        }

        if (id) {
            documentId = parseInt(id);
            if (!isNaN(documentId)) {
                loadDocument();
            }
        } else if (urlParam && !documentContent) {
            // If URL parameter exists and no content loaded, fetch markdown from URL
            loadMarkdownFromUrl(urlParam);
        }
    });

    // Load collections on mount
    $effect(() => {
        if (currentUserEmail) {
            loadCollections();
        }
    });

    async function loadMarkdownFromUrl(url: string) {
        if (!currentUserEmail) return;

        try {
            isLoading = true;
            const response = await fetch(
                `/api/fetch-markdown?url=${encodeURIComponent(url)}`,
            );

            if (response.ok) {
                const data = await response.json();
                documentTitle = data.title || "Untitled Document";
                documentContent = data.content || "";
                documentId = null; // Ensure this is treated as a new document
            } else {
                const error = await response.json();
                toast.error("Failed to fetch markdown", {
                    description:
                        error.error || "Could not load content from URL",
                });
            }
        } catch (error) {
            console.error("Error loading markdown from URL:", error);
            toast.error("Failed to fetch markdown", {
                description: "An unexpected error occurred",
            });
        } finally {
            isLoading = false;
        }
    }

    async function loadDocument() {
        if (!documentId || !currentUserEmail) return;

        try {
            isLoading = true;
            const response = await fetch(
                `/api/documents/${documentId}?userEmail=${encodeURIComponent(currentUserEmail)}`,
            );

            if (response.ok) {
                const doc: SavedResult = await response.json();
                documentTitle = doc.title || "";
                documentContent = doc.content || "";
                selectedCollectionId = doc.collectionId;
            } else {
                const error = await response.json();
                toast.error("Failed to load document", {
                    description: error.error || "Could not load document",
                });
                // Navigate back to home if document not found
                goto("/?tab=docs");
            }
        } catch (error) {
            console.error("Error loading document:", error);
            toast.error("Failed to load document", {
                description: "An unexpected error occurred",
            });
        } finally {
            isLoading = false;
        }
    }

    async function loadCollections() {
        if (!currentUserEmail) return;

        try {
            isLoadingCollections = true;
            const response = await fetch(
                `/api/collections?userEmail=${encodeURIComponent(currentUserEmail)}`,
            );

            if (response.ok) {
                collections = await response.json();
            }
        } catch (error) {
            console.error("Error loading collections:", error);
            toast.error("Failed to load collections", {
                description: "Could not load collections",
            });
        } finally {
            isLoadingCollections = false;
        }
    }

    function handleSaveClick() {
        if (!documentTitle.trim()) {
            toast.error("Title required", {
                description: "Please enter a title for your document",
            });
            return;
        }
        if (!documentContent.trim()) {
            toast.error("Content required", {
                description: "Please add some content to your document",
            });
            return;
        }
        showSaveModal = true;
    }

    async function handleSaveToCollection() {
        if (!currentUserEmail) {
            toast.error("Not authenticated", {
                description: "Please log in to save documents",
            });
            return;
        }

        try {
            isSaving = true;
            const url = documentId
                ? `/api/documents/${documentId}`
                : "/api/documents";
            const method = documentId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: documentTitle,
                    content: documentContent,
                    userEmail: currentUserEmail,
                    collectionId: selectedCollectionId,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(
                    documentId ? "Document updated!" : "Document saved!",
                    {
                        description: selectedCollectionId
                            ? "Document has been saved to the collection"
                            : "Document has been saved",
                    },
                );

                // Update document ID if it's a new document
                if (!documentId && data.document?.id) {
                    documentId = data.document.id;
                    // Update URL to reflect the document ID
                    goto(`/doc?id=${documentId}`, { replaceState: true });
                }

                showSaveModal = false;
            } else {
                const error = await response.json();
                toast.error("Failed to save document", {
                    description: error.error || "Could not save document",
                });
            }
        } catch (error) {
            console.error("Error saving document:", error);
            toast.error("Failed to save document", {
                description: "An unexpected error occurred",
            });
        } finally {
            isSaving = false;
        }
    }

    function handleClear() {
        documentTitle = "";
        documentContent = "";
        selectedCollectionId = null;
    }

    function handleBack() {
        // If we came from a search modal, go back to it
        if (fromQuery) {
            goto(
                `/?modal=search&query=${encodeURIComponent(fromQuery)}&tab=searches`,
            );
        } else {
            goto("/?tab=docs");
        }
    }

    function formatDate(date: Date): string {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(date);
    }

    function handleResizeStart(edge: string, e: MouseEvent) {
        e.preventDefault();
        isResizing = edge;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        resizeStartWidth = chatWindowWidth;
        resizeStartHeight = chatWindowHeight;
        resizeStartRight = chatWindowRight;
        resizeStartBottom = chatWindowBottom;
    }

    function handleResizeMove(e: MouseEvent) {
        if (!isResizing) return;

        const deltaX = e.clientX - resizeStartX;
        const deltaY = e.clientY - resizeStartY;
        const minWidth = 320;
        const minHeight = 400;
        const maxWidth = 800;
        const maxHeight = 700;

        if (isResizing === "left") {
            // Resizing from left: width changes, right position stays fixed (bottom-right anchored)
            const newWidth = resizeStartWidth - deltaX;
            if (newWidth >= minWidth && newWidth <= maxWidth) {
                chatWindowWidth = newWidth;
            }
        } else if (isResizing === "top") {
            // Resizing from top: height changes, bottom position stays fixed (bottom-right anchored)
            const newHeight = resizeStartHeight - deltaY;
            if (newHeight >= minHeight && newHeight <= maxHeight) {
                chatWindowHeight = newHeight;
            }
        }
    }

    function handleResizeEnd() {
        isResizing = null;
    }

    $effect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", handleResizeMove);
            window.addEventListener("mouseup", handleResizeEnd);
            return () => {
                window.removeEventListener("mousemove", handleResizeMove);
                window.removeEventListener("mouseup", handleResizeEnd);
            };
        }
    });

    // Helper function to parse AI response for edit suggestions
    function parseEditSuggestion(response: string): {
        content: string;
        suggestedEdit?: string;
    } {
        // Look for edit suggestions in the format: ```document-edit\n<content>\n```
        const editMatch = response.match(/```document-edit\n([\s\S]*?)\n```/);

        if (editMatch) {
            const suggestedEdit = editMatch[1].trim();
            // Remove the edit block from the response content
            const content = response
                .replace(/```document-edit\n[\s\S]*?\n```\n*/g, "")
                .trim();
            return { content, suggestedEdit };
        }

        return { content: response };
    }

    // Function to apply a suggested edit
    function applyEdit(newContent: string) {
        documentContent = newContent;
        toast.success("Document updated successfully!");
    }

    async function sendChatMessage() {
        if (!chatInput.trim() || isChatLoading) return;

        const userMessage = chatInput.trim();
        chatInput = "";

        // Add user message
        chatMessages = [
            ...chatMessages,
            { role: "user", content: userMessage },
        ];

        // Add empty assistant message that we'll update during streaming
        chatMessages = [...chatMessages, { role: "assistant", content: "" }];

        isChatLoading = true;

        try {
            // Build system prompt with document context
            const systemPrompt = `You are a helpful AI research assistant. You have access to the user's document and can edit it when requested.

Current document content:
---
${documentContent || "(empty document)"}
---

When the user asks you to edit the document, provide the complete edited document in a code block with the language "document-edit" like this:
\`\`\`document-edit
<full edited document content here>
\`\`\`

You can also explain your changes before or after the edit block. If the user just asks questions without requesting edits, respond normally without the edit block.`;

            // Call LLM gateway with streaming enabled
            const response = await fetch(
                "https://hoi-llm-gateway.up.railway.app/v1/chat/completions",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: "qwen3.5-4b",
                        messages: [
                            {
                                role: "system",
                                content: systemPrompt,
                            },
                            ...chatMessages.slice(0, -1).map((m) => ({
                                role: m.role,
                                content: m.content,
                            })),
                        ],
                        temperature: 0.7,
                        max_tokens: 2048,
                        stream: true,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error("No response body");
            }

            let fullContent = "";

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6);

                        if (data === "[DONE]") {
                            continue;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;

                            if (content) {
                                fullContent += content;

                                // Update the last message with new content
                                chatMessages = [
                                    ...chatMessages.slice(0, -1),
                                    { role: "assistant", content: fullContent },
                                ];
                            }
                        } catch (e) {
                            // Skip invalid JSON chunks
                        }
                    }
                }
            }

            // After streaming completes, parse for edit suggestions
            const { content, suggestedEdit } = parseEditSuggestion(fullContent);

            // Update the final message with parsed content and edit suggestion
            chatMessages = [
                ...chatMessages.slice(0, -1),
                { role: "assistant", content, suggestedEdit },
            ];
        } catch (error) {
            console.error("Chat error:", error);
            toast.error(
                "Failed to get response from AI. Please check if the LLM gateway is running.",
            );
            // Remove both the user message and empty assistant message
            chatMessages = chatMessages.slice(0, -2);
        } finally {
            isChatLoading = false;
        }
    }
</script>

<svelte:head>
    <title
        >{isNewDocument ? "New Document" : documentTitle || "Edit Document"} - Research
        Agent</title
    >
</svelte:head>

<div class="animated-bg">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>
</div>
<div class="fixed inset-0 paper-texture pointer-events-none z-0"></div>

<Header />

<main class="relative z-10 pt-28 pb-8 px-6 h-screen">
    <div
        class="max-w-6xl mx-auto h-[calc(100vh-8rem)] ui-scaled"
        style="transform: scale({$uiScale}); transform-origin: top center;"
    >
        <!-- Modal-like Container -->
        <div
            class="bg-white rounded-2xl shadow-2xl w-full h-full overflow-hidden flex flex-col"
        >
            <!-- Header -->
            <div class="sticky top-0 bg-white z-10">
                <!-- Main Header -->
                <div
                    class="border-b border-zinc-200 px-6 py-2 flex items-center justify-between"
                >
                    <div class="flex items-center gap-4">
                        <button
                            onclick={handleBack}
                            class="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                            aria-label="Go back"
                        >
                            <Icon
                                icon="mdi:arrow-left"
                                class="text-xl text-zinc-600"
                            />
                        </button>
                        <div>
                            <h2 class="text-xl font-semibold tracking-tight">
                                {isNewDocument
                                    ? "New Document"
                                    : "Edit document"}
                            </h2>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        {#if !isNewDocument}
                            <span class="text-xs text-zinc-400">
                                Last updated: {formatDate(new Date())}
                            </span>
                        {/if}
                    </div>
                </div>
                <!-- Subheader with Collection Label -->
                {#if !isNewDocument}
                    <div
                        class="border-b border-zinc-200 px-6 py-2 flex items-center"
                    >
                        <span
                            class="text-[10px] font-medium px-2 py-0.5 rounded-full {currentCollection
                                ? 'text-[#018790] bg-[#00b7b5]/10'
                                : 'text-zinc-500 bg-zinc-100'}"
                        >
                            {currentCollection
                                ? currentCollection.topic
                                : "No collection"}
                        </span>
                    </div>
                {/if}
            </div>

            <!-- Title Input -->
            <div class="px-6 py-4 border-b border-zinc-200">
                <label class="text-xs text-zinc-500 font-medium mb-2 block"
                    >Title</label
                >
                <input
                    type="text"
                    bind:value={documentTitle}
                    placeholder="Document title..."
                    class="w-full text-2xl font-semibold tracking-tight border-none outline-none placeholder-zinc-300 text-zinc-800"
                />
            </div>

            <!-- Content Area -->
            {#if isLoading}
                <div class="flex-1 flex items-center justify-center">
                    <div class="text-center">
                        <Icon
                            icon="mdi:loading"
                            class="text-4xl text-zinc-400 animate-spin"
                        />
                        <p class="text-zinc-500 mt-2">Loading document...</p>
                    </div>
                </div>
            {:else}
                <div class="flex-1 overflow-hidden">
                    <MarkdownEditor
                        bind:value={documentContent}
                        placeholder="Start writing your document..."
                    />
                </div>
            {/if}

            <!-- Footer -->
            <div
                class="sticky bottom-0 bg-white border-t border-zinc-200 px-6 py-3 flex items-center justify-between"
            >
                <span class="text-xs text-zinc-400">
                    {wordCount} words • {charCount} characters
                </span>
                <div class="flex items-center gap-2">
                    <button
                        onclick={handleClear}
                        class="px-4 py-2 text-zinc-700 hover:bg-zinc-100 rounded-lg text-sm font-medium transition-colors"
                    >
                        Clear
                    </button>
                    <button
                        onclick={handleSaveClick}
                        class="px-4 py-2 bg-[#005461] text-white rounded-lg text-sm font-medium hover:bg-[#018790] transition-colors flex items-center gap-2"
                    >
                        <Icon icon="mdi:content-save" class="text-base" />
                        Save Document
                    </button>
                </div>
            </div>
        </div>
    </div>
</main>

<!-- AI Agent Chat Button -->
<button
    class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#005461] hover:bg-[#018790] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
    onclick={() => (showChatWindow = !showChatWindow)}
    aria-label="Toggle AI Chat"
>
    <Icon icon="mdi:message-badge" class="text-2xl text-white" />
</button>

<!-- AI Agent Chat Window -->
{#if showChatWindow}
    <div
        class="fixed z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200"
        style="right: {chatWindowRight}px; bottom: {chatWindowBottom}px; width: {chatWindowWidth}px; height: {chatWindowHeight}px;"
        onclick={(e) => e.stopPropagation()}
    >
        <!-- Resize Handles (only left and top to keep bottom-right anchored) -->
        <div
            class="absolute top-0 left-0 right-0 h-1 cursor-n-resize hover:bg-[#005461]/20 transition-colors z-10"
            onmousedown={(e) => handleResizeStart("top", e)}
            role="separator"
            aria-label="Resize from top"
        ></div>
        <div
            class="absolute left-0 top-0 bottom-0 w-1 cursor-w-resize hover:bg-[#005461]/20 transition-colors z-10"
            onmousedown={(e) => handleResizeStart("left", e)}
            role="separator"
            aria-label="Resize from left"
        ></div>
        <!-- Chat Header -->
        <div
            class="flex items-center justify-between p-4 border-b border-zinc-200 bg-[#005461] cursor-move"
        >
            <div class="flex items-center gap-3">
                <div
                    class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"
                >
                    <Icon icon="mdi:robot" class="text-lg text-white" />
                </div>
                <div>
                    <h3 class="font-semibold text-white text-sm">
                        AI Research Agent
                    </h3>
                    <p class="text-xs text-white/80">Ask about your document</p>
                </div>
            </div>
            <button
                onclick={() => (showChatWindow = false)}
                class="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Close chat"
            >
                <Icon icon="mdi:close" class="text-lg text-white" />
            </button>
        </div>

        <!-- Chat Messages Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
            {#each chatMessages as message}
                <div class="flex gap-3">
                    {#if message.role === "assistant"}
                        <div
                            class="w-8 h-8 bg-[#005461] rounded-lg flex items-center justify-center flex-shrink-0"
                        >
                            <Icon icon="mdi:robot" class="text-sm text-white" />
                        </div>
                        <div class="flex-1">
                            <div
                                class="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm border border-zinc-100"
                            >
                                <p
                                    class="text-sm text-zinc-700 whitespace-pre-wrap"
                                >
                                    {message.content}
                                </p>
                            </div>
                            {#if message.suggestedEdit}
                                <button
                                    onclick={() =>
                                        applyEdit(message.suggestedEdit!)}
                                    class="mt-2 w-full bg-[#005461] hover:bg-[#018790] text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Icon
                                        icon="mdi:check-circle"
                                        class="text-base"
                                    />
                                    Apply Edit to Document
                                </button>
                            {/if}
                        </div>
                    {:else}
                        <div class="flex-1 flex justify-end">
                            <div
                                class="bg-[#005461] rounded-2xl rounded-tr-sm p-3 shadow-sm max-w-[80%]"
                            >
                                <p
                                    class="text-sm text-white whitespace-pre-wrap"
                                >
                                    {message.content}
                                </p>
                            </div>
                        </div>
                    {/if}
                </div>
            {/each}

            {#if isChatLoading}
                <div class="flex gap-3">
                    <div
                        class="w-8 h-8 bg-[#005461] rounded-lg flex items-center justify-center flex-shrink-0"
                    >
                        <Icon icon="mdi:robot" class="text-sm text-white" />
                    </div>
                    <div class="flex-1">
                        <div
                            class="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm border border-zinc-100"
                        >
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-2 h-2 bg-zinc-400 rounded-full animate-pulse"
                                ></div>
                                <div
                                    class="w-2 h-2 bg-zinc-400 rounded-full animate-pulse"
                                    style="animation-delay: 0.2s;"
                                ></div>
                                <div
                                    class="w-2 h-2 bg-zinc-400 rounded-full animate-pulse"
                                    style="animation-delay: 0.4s;"
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Chat Input Area -->
        <div class="p-4 border-t border-zinc-200 bg-white">
            <div class="flex gap-2">
                <input
                    type="text"
                    bind:value={chatInput}
                    placeholder="Ask about your document..."
                    class="flex-1 px-4 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005461] focus:border-transparent"
                    onkeydown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendChatMessage();
                        }
                    }}
                    disabled={isChatLoading}
                />
                <button
                    onclick={sendChatMessage}
                    disabled={isChatLoading || !chatInput.trim()}
                    class="px-4 py-2 bg-[#005461] hover:bg-[#018790] disabled:bg-zinc-300 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                    <Icon icon="mdi:send" class="text-base" />
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Save Modal -->
{#if showSaveModal}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center"
        onclick={() => (showSaveModal = false)}
        onkeydown={(e) => e.key === "Escape" && (showSaveModal = false)}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
    >
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div
            class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
        >
            <div class="p-6">
                <!-- Modal Header -->
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-semibold tracking-tight">
                        Save to Collection
                    </h2>
                    <button
                        onclick={() => (showSaveModal = false)}
                        class="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <Icon icon="mdi:close" class="text-xl text-zinc-500" />
                    </button>
                </div>

                <!-- Collection Selection -->
                <div class="mb-6">
                    <p class="text-sm text-zinc-600 mb-3">
                        Choose a collection to save your document to, or save
                        without a collection.
                    </p>

                    {#if isLoadingCollections}
                        <div class="flex items-center justify-center py-8">
                            <Icon
                                icon="mdi:loading"
                                class="text-2xl text-zinc-400 animate-spin"
                            />
                        </div>
                    {:else if collections.length === 0}
                        <div class="text-center py-8 bg-zinc-50 rounded-lg">
                            <Icon
                                icon="mdi:folder-outline"
                                class="text-3xl text-zinc-300 mb-2"
                            />
                            <p class="text-sm text-zinc-500">
                                No collections yet
                            </p>
                            <p class="text-xs text-zinc-400 mt-1">
                                You can still save your document without a
                                collection
                            </p>
                        </div>
                    {:else}
                        <div class="space-y-2 max-h-64 overflow-y-auto">
                            <button
                                onclick={() => (selectedCollectionId = null)}
                                class="w-full p-3 rounded-lg border-2 text-left transition-all {selectedCollectionId ===
                                null
                                    ? 'border-[#018790] bg-[#00b7b5]/10'
                                    : 'border-zinc-200 hover:border-zinc-300'}"
                            >
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center"
                                    >
                                        <Icon
                                            icon="mdi:folder-outline"
                                            class="text-lg text-zinc-600"
                                        />
                                    </div>
                                    <div>
                                        <div class="font-medium text-sm">
                                            No Collection
                                        </div>
                                        <div class="text-xs text-zinc-400">
                                            Save without organizing
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {#each collections as collection (collection.id)}
                                <button
                                    onclick={() =>
                                        (selectedCollectionId = collection.id)}
                                    class="w-full p-3 rounded-lg border-2 text-left transition-all {selectedCollectionId ===
                                    collection.id
                                        ? 'border-[#018790] bg-[#00b7b5]/10'
                                        : 'border-zinc-200 hover:border-zinc-300'}"
                                >
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-8 h-8 rounded-lg bg-[#00b7b5]/15 flex items-center justify-center"
                                        >
                                            <Icon
                                                icon="mdi:folder"
                                                class="text-lg text-[#018790]"
                                            />
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <div class="font-medium text-sm">
                                                {collection.topic}
                                            </div>
                                            {#if collection.description}
                                                <div
                                                    class="text-xs text-zinc-400 truncate"
                                                >
                                                    {collection.description}
                                                </div>
                                            {/if}
                                        </div>
                                    </div>
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>

                <!-- Actions -->
                <div class="flex gap-3">
                    <button
                        onclick={() => (showSaveModal = false)}
                        class="flex-1 px-4 py-2.5 text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onclick={handleSaveToCollection}
                        disabled={isSaving}
                        class="flex-1 px-4 py-2.5 bg-[#005461] text-white rounded-lg text-sm font-medium hover:bg-[#018790] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {#if isSaving}
                            <Icon
                                icon="mdi:loading"
                                class="text-base animate-spin"
                            />
                            <span>Saving...</span>
                        {:else}
                            <Icon icon="mdi:check" class="text-base" />
                            <span>Save Document</span>
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    /* GitHub Dark Theme for Carta Markdown Editor */
    :global(.carta-theme__github) {
        --background: #0d1117;
        --background-light: #161b22;
        --border: #2b3138;
        --accent: #1f6feb;
    }

    /* Core Editor Styles */
    :global(.carta-theme__github.carta-editor) {
        background-color: #ffffff;
        border: none;
        border-radius: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    :global(.carta-theme__github.carta-editor:focus-within) {
        outline: none;
    }

    :global(.carta-theme__github.carta-editor .carta-wrapper) {
        padding: 1rem;
        flex-grow: 1;
        height: 100%;
        overflow: hidden;
    }

    :global(.carta-theme__github.carta-editor .carta-container) {
        height: 100%;
    }

    :global(.carta-theme__github.carta-editor .carta-input-wrapper) {
        height: 100%;
        overflow: auto;
    }

    :global(.carta-theme__github.carta-editor .carta-input),
    :global(.carta-theme__github.carta-editor .carta-renderer) {
        height: 100%;
        overflow: auto;
    }

    :global(.carta-theme__github.carta-editor .carta-font-code) {
        font-family: var(--font-fira-code);
        caret-color: #24292f;
        font-size: 0.8rem;
    }

    /* Toolbar Styles */
    :global(.carta-theme__github.carta-editor .carta-toolbar) {
        height: 2.5rem;
        background-color: #f6f8fa;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }

    :global(.carta-theme__github.carta-editor .carta-toolbar .carta-icon) {
        width: 2rem;
        height: 2rem;
    }

    :global(
        .carta-theme__github.carta-editor .carta-toolbar .carta-icon:hover
    ) {
        color: #24292f;
        background-color: #f3f4f6;
    }

    :global(.carta-theme__github.carta-editor .carta-toolbar-left button),
    :global(.carta-theme__github.carta-editor .carta-toolbar-right),
    :global(.carta-theme__github.carta-editor .carta-filler) {
        border-bottom: none;
    }

    :global(
        .carta-theme__github.carta-editor .carta-toolbar-left > *:first-child
    ) {
        border-top-left-radius: 0;
    }

    :global(.carta-theme__github.carta-editor .carta-toolbar-left > *) {
        padding-left: 1rem;
        padding-right: 1rem;
        font-size: 0.95rem;
    }

    :global(.carta-theme__github.carta-editor .carta-toolbar-left button) {
        height: 100%;
    }

    :global(
        .carta-theme__github.carta-editor .carta-toolbar-left .carta-active
    ) {
        background-color: #ffffff;
        color: #24292f;
        border-right: 1px solid #d0d7de;
        border-bottom: 1px solid #ffffff;
    }

    :global(
        .carta-theme__github.carta-editor
            .carta-toolbar-left
            .carta-active:not(:first-child)
    ) {
        border-left: 1px solid #d0d7de;
    }

    :global(.carta-theme__github.carta-editor .carta-toolbar-right) {
        padding-right: 12px;
    }

    /* Icons Menu */
    :global(.carta-theme__github.carta-editor .carta-icons-menu) {
        padding: 8px;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        min-width: 180px;
        background: #ffffff;
    }

    :global(
        .carta-theme__github.carta-editor .carta-icons-menu .carta-icon-full
    ) {
        padding-left: 6px;
        padding-right: 6px;
        margin-top: 2px;
    }

    :global(
        .carta-theme__github.carta-editor
            .carta-icons-menu
            .carta-icon-full:first-child
    ) {
        margin-top: 0;
    }

    :global(
        .carta-theme__github.carta-editor
            .carta-icons-menu
            .carta-icon-full:hover
    ) {
        color: white;
        background-color: #2b3138;
    }

    :global(
        .carta-theme__github.carta-editor
            .carta-icons-menu
            .carta-icon-full
            span
    ) {
        margin-left: 6px;
        color: white;
        font-size: 0.85rem;
    }

    /* Emoji Plugin */
    :global(.carta-theme__github.carta-emoji) {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        width: 19rem;
        max-height: 14rem;
        overflow-x: auto;
        overflow-y: auto;
        border-radius: 4px;
        font-family: inherit;
        background-color: #ffffff;
        word-break: break-word;
        scroll-padding: 6px;
    }

    :global(.carta-theme__github.carta-emoji button) {
        background: #f6f8fa;
        cursor: pointer;
        display: inline-block;
        border-radius: 4px;
        border: 0;
        padding: 0;
        margin: 0.175rem;
        min-width: 2rem;
        height: 2rem;
        font-size: 1.2rem;
        line-height: 100%;
        text-align: center;
        white-space: nowrap;
    }

    :global(.carta-theme__github.carta-emoji button:hover),
    :global(.carta-theme__github.carta-emoji button.carta-active) {
        background: #f3f4f6;
    }

    /* Slash Plugin */
    :global(.carta-theme__github.carta-slash) {
        width: 18rem;
        max-height: 14rem;
        overflow-y: scroll;
        border-radius: 4px;
        font-family: inherit;
        background-color: #ffffff;
        padding: 6px;
        scroll-padding: 6px;
    }

    :global(.carta-theme__github.carta-slash span) {
        width: fit-content;
    }

    :global(.carta-theme__github.carta-slash button) {
        background: none;
        width: 100%;
        padding: 10px;
        border: 0;
        border-radius: 4px;
    }

    :global(.carta-theme__github.carta-slash .carta-slash-group) {
        padding: 0 4px 0 4px;
        margin-bottom: 4px;
        font-size: 0.8rem;
    }

    :global(.carta-theme__github.carta-slash button.carta-active),
    :global(.carta-theme__github.carta-slash button:hover) {
        background: #f6f8fa;
        cursor: pointer;
    }

    :global(.carta-theme__github.carta-slash .carta-snippet-title) {
        font-size: 0.85rem;
        font-weight: 600;
    }

    :global(.carta-theme__github.carta-slash .carta-snippet-description) {
        font-size: 0.8rem;
        text-overflow: ellipsis;
    }

    /* Shiki Syntax Highlighting for Dark Mode */
    :global(html.dark .carta-theme__github .shiki),
    :global(html.dark .carta-theme__github .shiki span) {
        color: var(--shiki-dark) !important;
    }
</style>
