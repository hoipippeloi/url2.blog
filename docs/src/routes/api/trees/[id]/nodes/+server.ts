import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getDb, treeNodes, collections } from "$lib/db";
import { eq, and, asc, isNull, sql } from "drizzle-orm";

/**
 * GET /api/trees/[id]/nodes?userEmail=xxx
 * Get all nodes for a tree (flat list, client builds hierarchy)
 */
export const GET: RequestHandler = async ({ params, url }) => {
  try {
    const db = getDb();
    const treeId = parseInt(params.id, 10);
    const userEmail = url.searchParams.get("userEmail");

    if (isNaN(treeId)) {
      return json({ error: "Invalid tree ID" }, { status: 400 });
    }

    if (!userEmail) {
      return json({ error: "userEmail is required" }, { status: 400 });
    }

    const nodes = await db!
      .select({
        node: treeNodes,
        collection: collections,
      })
      .from(treeNodes)
      .leftJoin(collections, eq(treeNodes.collectionId, collections.id))
      .where(eq(treeNodes.treeId, treeId))
      .orderBy(asc(treeNodes.position));

    const flatNodes = nodes.map(({ node, collection }) => ({
      ...node,
      collection: collection || null,
    }));

    return json(flatNodes);
  } catch (error) {
    console.error("Error fetching nodes:", error);
    return json({ error: "Failed to fetch nodes" }, { status: 500 });
  }
}

/**
 * POST /api/trees/[id]/nodes
 * Create a new node (folder or collection reference)
 * Body: {
 *   nodeType: "folder" | "collection",
 *   name?: string (for folders),
 *   collectionId?: number (for collection nodes),
 *   parentId?: number (null for root level),
 *   position?: number
 * }
 */
export const POST: RequestHandler = async ({ params, request }) => {
  try {
    const db = getDb();
    const treeId = parseInt(params.id, 10);
    const body = await request.json();

    const { nodeType, name, collectionId, parentId, position } = body;

    if (isNaN(treeId)) {
      return json({ error: "Invalid tree ID" }, { status: 400 });
    }

    if (!nodeType || !["folder", "collection"].includes(nodeType)) {
      return json(
        { error: "nodeType must be 'folder' or 'collection'" },
        { status: 400 },
      );
    }

    if (nodeType === "folder" && (!name || name.trim() === "")) {
      return json(
        { error: "name is required for folder nodes" },
        { status: 400 },
      );
    }

    if (nodeType === "collection" && !collectionId) {
      return json(
        { error: "collectionId is required for collection nodes" },
        { status: 400 },
      );
    }

    // Get max position for siblings
    let maxPosition = 0;
    const siblings = await db!
      .select()
      .from(treeNodes)
      .where(
        and(
          eq(treeNodes.treeId, treeId),
          parentId
            ? eq(treeNodes.parentId, parentId)
            : isNull(treeNodes.parentId),
        ),
      );

    if (siblings.length > 0) {
      maxPosition = Math.max(...siblings.map((s) => s.position || 0));
    }

    const nodePosition = position !== undefined ? position : maxPosition + 1;

    const [newNode] = await db!
      .insert(treeNodes)
      .values({
        treeId,
        parentId: parentId || null,
        nodeType,
        name: nodeType === "folder" ? name.trim() : null,
        collectionId: nodeType === "collection" ? collectionId : null,
        position: nodePosition,
      })
      .returning();

    // Fetch collection data if this is a collection node
    let collection = null;
    if (nodeType === "collection" && collectionId) {
      const [col] = await db!
        .select()
        .from(collections)
        .where(eq(collections.id, collectionId))
        .limit(1);
      collection = col || null;
    }

    return json({ ...newNode, collection }, { status: 201 });
  } catch (error) {
    console.error("Error creating node:", error);
    return json({ error: "Failed to create node" }, { status: 500 });
  }
};

/**
 * PUT /api/trees/[id]/nodes
 * Update a node (move, rename, reorder)
 * Body: {
 *   nodeId: number,
 *   name?: string,
 *   parentId?: number | null,
 *   position?: number,
 *   isExpanded?: boolean
 * }
 */
export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const db = getDb();
    const treeId = parseInt(params.id, 10);
    const body = await request.json();

    const { nodeId, name, parentId, position, isExpanded } = body;

    if (isNaN(treeId)) {
      return json({ error: "Invalid tree ID" }, { status: 400 });
    }

    if (!nodeId) {
      return json({ error: "nodeId is required" }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (parentId !== undefined) updateData.parentId = parentId;
    if (position !== undefined) updateData.position = position;
    if (isExpanded !== undefined) updateData.isExpanded = isExpanded;

    if (Object.keys(updateData).length === 0) {
      return json({ error: "No update fields provided" }, { status: 400 });
    }

    const [updated] = await db!
      .update(treeNodes)
      .set(updateData)
      .where(and(eq(treeNodes.id, nodeId), eq(treeNodes.treeId, treeId)))
      .returning();

    if (!updated) {
      return json({ error: "Node not found" }, { status: 404 });
    }

    // Fetch collection data if this is a collection node
    let collection = null;
    if (updated.collectionId) {
      const [col] = await db!
        .select()
        .from(collections)
        .where(eq(collections.id, updated.collectionId))
        .limit(1);
      collection = col || null;
    }

    return json({ ...updated, collection });
  } catch (error) {
    console.error("Error updating node:", error);
    return json({ error: "Failed to update node" }, { status: 500 });
  }
};

/**
 * DELETE /api/trees/[id]/nodes?nodeId=xx
 * Delete a node (cascade deletes children)
 */
export const DELETE: RequestHandler = async ({ params, url }) => {
  try {
    const db = getDb();
    const treeId = parseInt(params.id, 10);
    const nodeId = url.searchParams.get("nodeId");

    if (isNaN(treeId)) {
      return json({ error: "Invalid tree ID" }, { status: 400 });
    }

    if (!nodeId) {
      return json({ error: "nodeId is required" }, { status: 400 });
    }

    const numericNodeId = parseInt(nodeId, 10);
    if (isNaN(numericNodeId)) {
      return json({ error: "Invalid nodeId" }, { status: 400 });
    }

    const deleted = await db!
      .delete(treeNodes)
      .where(and(eq(treeNodes.id, numericNodeId), eq(treeNodes.treeId, treeId)))
      .returning();

    if (deleted.length === 0) {
      return json({ error: "Node not found" }, { status: 404 });
    }

    return json({ success: true, deleted: deleted[0] });
  } catch (error) {
    console.error("Error deleting node:", error);
    return json({ error: "Failed to delete node" }, { status: 500 });
  }
};
