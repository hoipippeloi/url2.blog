<script lang="ts">
  import Icon from "@iconify/svelte";
  import { onMount, onDestroy } from "svelte";
  import { collectionTreeStore, type TreeNode, type CollectionTree } from "$lib/stores/collectionTree";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  interface TreeNodeWithChildren extends TreeNode {
    children?: TreeNodeWithChildren[];
  }

  let { userEmail }: { userEmail: string | null } = $props();

  let isLoadingTrees = $state(false);
  let isCreatingTree = $state(false);
  let newTreeName = $state("");
  let showCreateTreeInput = $state(false);
  let editingNodeId = $state<number | null>(null);
  let editingNodeName = $state("");
  let isCreatingFolder = $state(false);
  let newFolderName = $state("");
  let newFolderParentId = $state<number | null>(null);
  let draggedNodeId = $state<number | null>(null);
  let dropTargetId = $state<number | null>(null);

  let trees = $state<CollectionTree[]>([]);
  let currentTree = $state<CollectionTree | null>(null);
  let nodes = $state<TreeNode[]>([]);
  let isLoading = $state(false);
  let isDrawerOpen = $state(false);
  
  let unsubscribe: (() => void) | null = null;

  onMount(() => {
    collectionTreeStore.syncWithUrl();
    unsubscribe = page.subscribe(($page) => {
      isDrawerOpen = $page.url.searchParams.get("tree") === "open";
    });
    if (userEmail) {
      fetchTrees();
    }
  });
  
  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  async function fetchTrees() {
    if (!userEmail) return;
    isLoadingTrees = true;
    try {
      const res = await fetch(`/api/trees?userEmail=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const data: CollectionTree[] = await res.json();
        collectionTreeStore.trees.set(data);
        trees = data;
        if (data.length > 0 && !currentTree) {
          await selectTree(data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching trees:", error);
    } finally {
      isLoadingTrees = false;
    }
  }

  async function selectTree(tree: CollectionTree) {
    collectionTreeStore.currentTree.set(tree);
    currentTree = tree;
    await fetchNodes(tree.id);
  }

  async function fetchNodes(treeId: number) {
    if (!userEmail) return;
    collectionTreeStore.isLoading.set(true);
    isLoading = true;
    try {
      const res = await fetch(`/api/trees/${treeId}/nodes?userEmail=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const data: TreeNode[] = await res.json();
        collectionTreeStore.nodes.set(data);
        nodes = data;
      }
    } catch (error) {
      console.error("Error fetching nodes:", error);
    } finally {
      collectionTreeStore.isLoading.set(false);
      isLoading = false;
    }
  }

  async function createTree() {
    if (!userEmail || !newTreeName.trim()) return;
    isCreatingTree = true;
    try {
      const res = await fetch("/api/trees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTreeName.trim(), userEmail }),
      });
      if (res.ok) {
        const tree: CollectionTree = await res.json();
        collectionTreeStore.trees.update((t) => [...t, tree]);
        trees = [...trees, tree];
        await selectTree(tree);
        newTreeName = "";
        showCreateTreeInput = false;
      }
    } catch (error) {
      console.error("Error creating tree:", error);
    } finally {
      isCreatingTree = false;
    }
  }

  async function deleteTree(treeId: number, e: Event) {
    e.stopPropagation();
    if (!userEmail || !confirm("Delete this tree and all its contents?")) return;
    try {
      const res = await fetch(`/api/trees?id=${treeId}&userEmail=${encodeURIComponent(userEmail)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        collectionTreeStore.trees.update((t) => t.filter((x) => x.id !== treeId));
        trees = trees.filter((x) => x.id !== treeId);
        if (currentTree?.id === treeId) {
          const remaining = trees;
          if (remaining.length > 0) {
            await selectTree(remaining[0]);
          } else {
            collectionTreeStore.currentTree.set(null);
            currentTree = null;
            collectionTreeStore.nodes.set([]);
            nodes = [];
          }
        }
      }
    } catch (error) {
      console.error("Error deleting tree:", error);
    }
  }

  async function createFolder(parentId: number | null = null) {
    if (!currentTree || !newFolderName.trim()) return;
    isCreatingFolder = true;
    try {
      const res = await fetch(`/api/trees/${currentTree.id}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeType: "folder",
          name: newFolderName.trim(),
          parentId,
        }),
      });
      if (res.ok) {
        await fetchNodes(currentTree.id);
        newFolderName = "";
        newFolderParentId = null;
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    } finally {
      isCreatingFolder = false;
    }
  }

  async function createCollectionNode(collectionId: number, parentId: number | null = null) {
    if (!currentTree) return;
    try {
      const res = await fetch(`/api/trees/${currentTree.id}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeType: "collection",
          collectionId,
          parentId,
        }),
      });
      if (res.ok) {
        await fetchNodes(currentTree.id);
      }
    } catch (error) {
      console.error("Error creating collection node:", error);
    }
  }

  async function updateNode(nodeId: number, updates: Partial<TreeNode>) {
    if (!currentTree) return;
    try {
      const res = await fetch(`/api/trees/${currentTree.id}/nodes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId, ...updates }),
      });
      if (res.ok) {
        await fetchNodes(currentTree.id);
      }
    } catch (error) {
      console.error("Error updating node:", error);
    }
  }

  async function deleteNode(nodeId: number) {
    if (!currentTree) return;
    if (!confirm("Delete this node?")) return;
    try {
      const res = await fetch(
        `/api/trees/${currentTree.id}/nodes?nodeId=${nodeId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        await fetchNodes(currentTree.id);
      }
    } catch (error) {
      console.error("Error deleting node:", error);
    }
  }

  async function toggleFolderExpand(node: TreeNode) {
    if (node.nodeType !== "folder") return;
    await updateNode(node.id, { isExpanded: !node.isExpanded });
  }

  function buildTree(nodeList: TreeNode[], parentId: number | null = null): TreeNodeWithChildren[] {
    return nodeList
      .filter((n) => n.parentId === parentId)
      .sort((a, b) => (a.position || 0) - (b.position || 1))
      .map((node) => ({
        ...node,
        isExpanded: node.isExpanded ?? true,
        children: buildTree(nodeList, node.id),
      }));
  }

  function handleDragStart(e: DragEvent, node: TreeNode) {
    draggedNodeId = node.id;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(node.id));
    }
  }

  function handleDragEnd() {
    draggedNodeId = null;
    dropTargetId = null;
  }

  function handleDragOver(e: DragEvent, node: TreeNode | null) {
    e.preventDefault();
    const targetId = node?.id ?? null;
    if (targetId !== dropTargetId) {
      dropTargetId = targetId;
    }
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
  }

  async function handleDrop(e: DragEvent, targetNode: TreeNode | null) {
    e.preventDefault();
    if (!draggedNodeId || !currentTree) return;
    const draggedNode = nodes.find((n) => n.id === draggedNodeId);
    if (!draggedNode) return;
    if (draggedNodeId === targetNode?.id) return;
    const newParentId = targetNode?.nodeType === "folder" ? targetNode.id : targetNode?.parentId ?? null;
    await updateNode(draggedNodeId, { parentId: newParentId });
    draggedNodeId = null;
    dropTargetId = null;
  }

  async function handleExternalCollectionDrop(e: DragEvent, targetNode: TreeNode | null) {
    e.preventDefault();
    const collectionIdStr = e.dataTransfer?.getData("application/collection-id");
    if (!collectionIdStr || !currentTree) return;
    const collectionId = parseInt(collectionIdStr, 10);
    if (isNaN(collectionId)) return;
    const parentId = targetNode?.nodeType === "folder" ? targetNode.id : targetNode?.parentId ?? null;
    await createCollectionNode(collectionId, parentId);
    dropTargetId = null;
  }

  function handleDrawerDrop(e: DragEvent) {
    const hasCollectionData = e.dataTransfer?.types.includes("application/collection-id");
    if (hasCollectionData) {
      handleExternalCollectionDrop(e, null);
    }
  }

  function startEditNode(node: TreeNode) {
    if (node.nodeType !== "folder") return;
    editingNodeId = node.id;
    editingNodeName = node.name || "";
  }

  async function finishEditNode() {
    if (editingNodeId && editingNodeName.trim()) {
      await updateNode(editingNodeId, { name: editingNodeName.trim() });
    }
    editingNodeId = null;
    editingNodeName = "";
  }

  let treeItems = $derived(buildTree(nodes, null));
</script>

<div
  class="drawer-backdrop"
  class:open={isDrawerOpen}
  onclick={() => collectionTreeStore.close()}
  onkeydown={(e) => e.key === "Escape" && collectionTreeStore.close()}
  role="button"
  tabindex={isDrawerOpen ? 0 : -1}
></div>

<aside
  class="drawer"
  class:open={isDrawerOpen}
  ondragover={(e) => e.preventDefault()}
  ondrop={handleDrawerDrop}
>
  <div class="drawer-header">
    <div class="drawer-title">
      <Icon icon="mdi:file-tree" class="text-lg" />
      <span>Collection Trees</span>
    </div>
    <button
      class="close-btn"
      onclick={() => collectionTreeStore.close()}
      aria-label="Close drawer"
    >
      <Icon icon="mdi:close" class="text-lg" />
    </button>
  </div>

  <div class="drawer-content">
    {#if isLoadingTrees}
      <div class="loading-state">
        <Icon icon="mdi:loading" class="animate-spin text-xl text-zinc-400" />
      </div>
    {:else if trees.length === 0}
      <div class="empty-state">
        <Icon icon="mdi:file-tree-outline" class="text-4xl text-zinc-300 mb-3" />
        <p class="text-sm text-zinc-500 mb-4">No trees yet</p>
        {#if showCreateTreeInput}
          <form class="create-form" onsubmit={(e) => { e.preventDefault(); createTree(); }}>
            <input
              type="text"
              bind:value={newTreeName}
              placeholder="Tree name..."
              autofocus
              disabled={isCreatingTree}
            />
            <div class="form-actions">
              <button type="submit" disabled={isCreatingTree || !newTreeName.trim()}>
                {#if isCreatingTree}
                  <Icon icon="mdi:loading" class="animate-spin" />
                {:else}
                  <Icon icon="mdi:check" />
                {/if}
              </button>
              <button type="button" onclick={() => { showCreateTreeInput = false; newTreeName = ""; }}>
                <Icon icon="mdi:close" />
              </button>
            </div>
          </form>
        {:else}
          <button class="btn-primary" onclick={() => (showCreateTreeInput = true)}>
            <Icon icon="mdi:plus" class="mr-1" />
            Create Tree
          </button>
        {/if}
      </div>
    {:else}
      <div class="tree-selector">
        <select
          value={currentTree?.id || ""}
          onchange={(e) => {
            const tree = trees.find((t) => t.id === parseInt(e.currentTarget.value, 10));
            if (tree) selectTree(tree);
          }}
        >
          {#each trees as tree}
            <option value={tree.id}>{tree.name}</option>
          {/each}
        </select>
        <button
          class="btn-icon"
          onclick={() => {
            if (currentTree) {
              deleteTree(currentTree.id, new Event("click") as any);
            }
          }}
          title="Delete tree"
        >
          <Icon icon="mdi:trash-can-outline" class="text-sm" />
        </button>
        {#if showCreateTreeInput}
          <form
            class="inline-form"
            onsubmit={(e) => {
              e.preventDefault();
              createTree();
            }}
          >
            <input
              type="text"
              bind:value={newTreeName}
              placeholder="New tree..."
              autofocus
              disabled={isCreatingTree}
            />
            <button type="submit" disabled={isCreatingTree || !newTreeName.trim()}>
              {#if isCreatingTree}
                <Icon icon="mdi:loading" class="animate-spin" />
              {:else}
                <Icon icon="mdi:check" />
              {/if}
            </button>
            <button type="button" onclick={() => { showCreateTreeInput = false; newTreeName = ""; }}>
              <Icon icon="mdi:close" />
            </button>
          </form>
        {:else}
          <button
            class="btn-icon"
            onclick={() => (showCreateTreeInput = true)}
            title="Create tree"
          >
            <Icon icon="mdi:plus" class="text-sm" />
          </button>
        {/if}
      </div>

      {#if currentTree}
        <div class="tree-actions">
          {#if newFolderParentId !== null || newFolderName !== ""}
            <form
              class="inline-form"
              onsubmit={(e) => {
                e.preventDefault();
                createFolder();
              }}
            >
              <input
                type="text"
                bind:value={newFolderName}
                placeholder="Folder name..."
                autofocus
                disabled={isCreatingFolder}
              />
              <button type="submit" disabled={isCreatingFolder || !newFolderName.trim()}>
                {#if isCreatingFolder}
                  <Icon icon="mdi:loading" class="animate-spin" />
                {:else}
                  <Icon icon="mdi:check" />
                {/if}
              </button>
              <button
                type="button"
                onclick={() => {
                  newFolderName = "";
                  newFolderParentId = null;
                }}
                title="Cancel"
              >
                <Icon icon="mdi:close" class="text-sm" />
              </button>
            </form>
          {:else}
            <button
              class="btn-secondary"
              onclick={() => {
                newFolderParentId = null;
                newFolderName = "";
              }}
            >
              <Icon icon="mdi:folder-plus" class="mr-1" />
              New Folder
            </button>
          {/if}
        </div>

        <div class="tree-container">
          {#if isLoading}
            <div class="loading-state">
              <Icon icon="mdi:loading" class="animate-spin text-xl text-zinc-400" />
            </div>
          {:else if treeItems.length === 0}
            <div class="empty-tree">
              <p class="text-sm text-zinc-400">Drag collections here to organize them</p>
            </div>
          {:else}
            <ul class="tree-list">
              {#each treeItems as node (node.id)}
                {@const isDropTarget = dropTargetId === node.id}
                {@const isDragged = draggedNodeId === node.id}
                {@const isEditing = editingNodeId === node.id}
                {@const canDrop = node.nodeType === "folder"}
                <li
                  class="tree-node"
                  class:dragging={isDragged}
                  class:drop-target={isDropTarget && canDrop}
                  draggable="true"
                  ondragstart={(e) => handleDragStart(e, node)}
                  ondragend={handleDragEnd}
                  ondragover={(e) => canDrop && handleDragOver(e, node)}
                  ondrop={(e) => handleDrop(e, node)}
                  role="treeitem"
                >
                  <div class="node-content">
                    {#if node.nodeType === "folder"}
                      <button
                        class="expand-btn"
                        onclick={() => toggleFolderExpand(node)}
                        aria-label={node.isExpanded ? "Collapse" : "Expand"}
                      >
                        <Icon
                          icon={node.isExpanded ? "mdi:chevron-down" : "mdi:chevron-right"}
                          class="text-sm"
                        />
                      </button>
                      <Icon
                        icon={node.isExpanded ? "mdi:folder-open" : "mdi:folder"}
                        class="text-amber-500"
                      />
                      {#if isEditing}
                        <input
                          type="text"
                          bind:value={editingNodeName}
                          onblur={finishEditNode}
                          onkeydown={(e) => e.key === "Enter" && finishEditNode()}
                          class="edit-input"
                          autofocus
                        />
                      {:else}
                        <span class="node-name">{node.name}</span>
                      {/if}
                      <div class="node-actions">
                        <button
                          class="btn-icon-small"
                          onclick={() => {
                            newFolderParentId = node.id;
                            newFolderName = "";
                          }}
                          title="Add subfolder"
                        >
                          <Icon icon="mdi:folder-plus" class="text-xs" />
                        </button>
                        <button
                          class="btn-icon-small"
                          onclick={() => startEditNode(node)}
                          title="Rename"
                        >
                          <Icon icon="mdi:pencil" class="text-xs" />
                        </button>
                        <button
                          class="btn-icon-small delete"
                          onclick={() => deleteNode(node.id)}
                          title="Delete"
                        >
                          <Icon icon="mdi:trash-can-outline" class="text-xs" />
                        </button>
                      </div>
                    {:else}
                      <span class="expand-placeholder"></span>
                      <Icon icon="mdi:collection" class="text-teal-500" />
                      <a href="/collection/{node.collection?.id}" class="node-name collection-link">
                        {node.collection?.topic || "Unknown Collection"}
                      </a>
                      <div class="node-actions">
                        <button
                          class="btn-icon-small delete"
                          onclick={() => deleteNode(node.id)}
                          title="Remove from tree"
                        >
                          <Icon icon="mdi:trash-can-outline" class="text-xs" />
                        </button>
                      </div>
                    {/if}
                  </div>

                  {#if node.nodeType === "folder" && node.isExpanded && node.children && node.children.length > 0}
                    <ul class="tree-list nested">
                      {#each node.children as child (child.id)}
                        {@const isChildDropTarget = dropTargetId === child.id}
                        {@const isChildDragged = draggedNodeId === child.id}
                        {@const isChildEditing = editingNodeId === child.id}
                        {@const childCanDrop = child.nodeType === "folder"}
                        <li
                          class="tree-node"
                          class:dragging={isChildDragged}
                          class:drop-target={isChildDropTarget && childCanDrop}
                          draggable="true"
                          ondragstart={(e) => handleDragStart(e, child)}
                          ondragend={handleDragEnd}
                          ondragover={(e) => childCanDrop && handleDragOver(e, child)}
                          ondrop={(e) => handleDrop(e, child)}
                          role="treeitem"
                        >
                          <div class="node-content">
                            {#if child.nodeType === "folder"}
                              <button
                                class="expand-btn"
                                onclick={() => toggleFolderExpand(child)}
                                aria-label={child.isExpanded ? "Collapse" : "Expand"}
                              >
                                <Icon
                                  icon={child.isExpanded ? "mdi:chevron-down" : "mdi:chevron-right"}
                                  class="text-sm"
                                />
                              </button>
                              <Icon
                                icon={child.isExpanded ? "mdi:folder-open" : "mdi:folder"}
                                class="text-amber-500"
                              />
                              {#if isChildEditing}
                                <input
                                  type="text"
                                  bind:value={editingNodeName}
                                  onblur={finishEditNode}
                                  onkeydown={(e) => e.key === "Enter" && finishEditNode()}
                                  class="edit-input"
                                  autofocus
                                />
                              {:else}
                                <span class="node-name">{child.name}</span>
                              {/if}
                              <div class="node-actions">
                                <button
                                  class="btn-icon-small"
                                  onclick={() => {
                                    newFolderParentId = child.id;
                                    newFolderName = "";
                                  }}
                                  title="Add subfolder"
                                >
                                  <Icon icon="mdi:folder-plus" class="text-xs" />
                                </button>
                                <button
                                  class="btn-icon-small"
                                  onclick={() => startEditNode(child)}
                                  title="Rename"
                                >
                                  <Icon icon="mdi:pencil" class="text-xs" />
                                </button>
                                <button
                                  class="btn-icon-small delete"
                                  onclick={() => deleteNode(child.id)}
                                  title="Delete"
                                >
                                  <Icon icon="mdi:trash-can-outline" class="text-xs" />
                                </button>
                              </div>
                            {:else}
                              <span class="expand-placeholder"></span>
                              <Icon icon="mdi:collection" class="text-teal-500" />
                              <a
                                href="/collection/{child.collection?.id}"
                                class="node-name collection-link"
                              >
                                {child.collection?.topic || "Unknown Collection"}
                              </a>
                              <div class="node-actions">
                                <button
                                  class="btn-icon-small delete"
                                  onclick={() => deleteNode(child.id)}
                                  title="Remove from tree"
                                >
                                  <Icon icon="mdi:trash-can-outline" class="text-xs" />
                                </button>
                              </div>
                            {/if}
                          </div>
                        </li>
                      {/each}
                    </ul>
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</aside>

<style>
  .drawer-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s;
    z-index: 40;
  }

  .drawer-backdrop.open {
    opacity: 1;
    visibility: visible;
  }

  .drawer {
    position: fixed;
    top: 0;
    left: 0;
    width: 320px;
    height: 100vh;
    background: white;
    border-right: 1px solid #e4e4e7;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 50;
    display: flex;
    flex-direction: column;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  }

  .drawer.open {
    transform: translateX(0);
  }

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #e4e4e7;
    background: #fafafa;
  }

  .drawer-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #18181b;
  }

  .close-btn {
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #71717a;
    transition: background 0.2s;
  }

  .close-btn:hover {
    background: #e4e4e7;
  }

  .drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }

  .tree-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .tree-selector select {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #e4e4e7;
    border-radius: 0.5rem;
    background: white;
    font-size: 0.875rem;
    min-width: 0;
  }

  .tree-actions {
    margin-bottom: 1rem;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background: #18181b;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-primary:hover {
    background: #27272a;
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background: white;
    color: #18181b;
    border: 1px solid #e4e4e7;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-secondary:hover {
    background: #f4f4f5;
    border-color: #a1a1aa;
  }

  .btn-icon {
    padding: 0.5rem;
    border: 1px solid #e4e4e7;
    border-radius: 0.5rem;
    background: white;
    cursor: pointer;
    color: #71717a;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-icon:hover {
    background: #f4f4f5;
    color: #18181b;
  }

  .btn-icon-small {
    padding: 0.25rem;
    border: none;
    border-radius: 0.25rem;
    background: transparent;
    cursor: pointer;
    color: #a1a1aa;
    transition: all 0.2s;
    opacity: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tree-node:hover .btn-icon-small {
    opacity: 1;
  }

  .btn-icon-small:hover {
    background: #f4f4f5;
    color: #18181b;
  }

  .btn-icon-small.delete:hover {
    background: #fef2f2;
    color: #dc2626;
  }

  .create-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .create-form input {
    padding: 0.5rem;
    border: 1px solid #e4e4e7;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    width: 100%;
  }

  .form-actions {
    display: flex;
    gap: 0.5rem;
  }

  .form-actions button {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #e4e4e7;
    border-radius: 0.5rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .form-actions button:hover {
    background: #f4f4f5;
  }

  .inline-form {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex: 1;
    min-width: 0;
  }

  .inline-form input {
    flex: 1;
    padding: 0.375rem 0.5rem;
    border: 1px solid #e4e4e7;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    min-width: 80px;
  }

  .inline-form button {
    padding: 0.375rem;
    border: 1px solid #e4e4e7;
    border-radius: 0.375rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .inline-form button:hover {
    background: #f4f4f5;
  }

  .tree-container {
    min-height: 100px;
  }

  .empty-tree {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    border: 2px dashed #e4e4e7;
    border-radius: 0.5rem;
    background: #fafafa;
  }

  .tree-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .tree-list.nested {
    padding-left: 1.5rem;
    margin-top: 0.25rem;
  }

  .tree-node {
    user-select: none;
  }

  .tree-node.dragging {
    opacity: 0.5;
  }

  .tree-node.drop-target > .node-content {
    background: #dbeafe;
    border-color: #3b82f6;
  }

  .node-content {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid transparent;
    cursor: grab;
    transition: all 0.15s;
  }

  .node-content:hover {
    background: #f4f4f5;
  }

  .expand-btn {
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #71717a;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  .expand-placeholder {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  .node-name {
    flex: 1;
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .collection-link {
    color: #0d9488;
    text-decoration: none;
  }

  .collection-link:hover {
    text-decoration: underline;
  }

  .node-actions {
    display: flex;
    gap: 0.125rem;
    margin-left: auto;
    flex-shrink: 0;
  }

  .edit-input {
    flex: 1;
    padding: 0.125rem 0.375rem;
    border: 1px solid #3b82f6;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    outline: none;
    min-width: 0;
  }
</style>
