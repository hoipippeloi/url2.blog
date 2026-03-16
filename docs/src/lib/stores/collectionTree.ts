import { writable, get } from "svelte/store";
import { goto } from "$app/navigation";
import { browser } from "$app/environment";

interface TreeNode {
  id: number;
  treeId: number;
  parentId: number | null;
  nodeType: "folder" | "collection";
  name: string | null;
  collectionId: number | null;
  position: number | null;
  isExpanded: boolean | null;
  createdAt: Date | null;
  collection?: {
    id: number;
    topic: string;
    description: string | null;
  } | null;
}

interface CollectionTree {
  id: number;
  userEmail: string;
  name: string;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
  rootNodeCount?: number;
}

interface DragData {
  type: "collection";
  collectionId: number;
  collectionTopic: string;
}

function createCollectionTreeStore() {
  const isOpen = writable(false);
  const trees = writable<CollectionTree[]>([]);
  const currentTree = writable<CollectionTree | null>(null);
  const nodes = writable<TreeNode[]>([]);
  const isLoading = writable(false);
  const dragData = writable<DragData | null>(null);

  function syncWithUrl() {
    if (!browser) return;
    
    const params = new URLSearchParams(window.location.search);
    const shouldBeOpen = params.get("tree") === "open";
    const currentlyOpen = get(isOpen);
    
    if (shouldBeOpen !== currentlyOpen) {
      isOpen.set(shouldBeOpen);
    }
  }

  function toggle() {
    if (!browser) return;
    
    const currentlyOpen = get(isOpen);
    const params = new URLSearchParams(window.location.search);
    
    if (currentlyOpen) {
      params.delete("tree");
    } else {
      params.set("tree", "open");
    }
    
    const newSearch = params.toString();
    const newUrl = newSearch ? `?${newSearch}` : window.location.pathname;
    goto(newUrl, { replaceState: true });
    isOpen.set(!currentlyOpen);
  }

  function open() {
    if (!browser) return;
    
    const params = new URLSearchParams(window.location.search);
    params.set("tree", "open");
    goto(`?${params.toString()}`, { replaceState: true });
    isOpen.set(true);
  }

  function close() {
    if (!browser) return;
    
    const params = new URLSearchParams(window.location.search);
    params.delete("tree");
    const newSearch = params.toString();
    const newUrl = newSearch ? `?${newSearch}` : window.location.pathname;
    goto(newUrl, { replaceState: true });
    isOpen.set(false);
  }

  function startDrag(data: DragData) {
    dragData.set(data);
  }

  function endDrag() {
    dragData.set(null);
  }

  if (browser) {
    syncWithUrl();
    window.addEventListener('popstate', syncWithUrl);
  }

  return {
    isOpen,
    trees,
    currentTree,
    nodes,
    isLoading,
    dragData,
    toggle,
    open,
    close,
    startDrag,
    endDrag,
    syncWithUrl,
  };
}

export const collectionTreeStore = createCollectionTreeStore();
export type { TreeNode, CollectionTree, DragData };
