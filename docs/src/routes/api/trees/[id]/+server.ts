import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getDb, collectionTrees, treeNodes, collections } from "$lib/db";
import { eq, and, asc, isNull } from "drizzle-orm";

/**
 * GET /api/trees/[id]?userEmail=xxx
 * Get a single tree with all its nodes (hierarchical structure)
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

    const [tree] = await db!
      .select()
      .from(collectionTrees)
      .where(
        and(
          eq(collectionTrees.id, treeId),
          eq(collectionTrees.userEmail, userEmail),
        ),
      )
      .limit(1);

    if (!tree) {
      return json({ error: "Tree not found" }, { status: 404 });
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

    return json({ tree, nodes: flatNodes });
  } catch (error) {
    console.error("Error fetching tree:", error);
    return json({ error: "Failed to fetch tree" }, { status: 500 });
  }
};

/**
 * PUT /api/trees/[id]
 * Update tree name or icon
 * Body: { name?: string, icon?: string, userEmail: string }
 */
export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const db = getDb();
    const treeId = parseInt(params.id, 10);
    const body = await request.json();

    const { name, icon, userEmail } = body;

    if (isNaN(treeId)) {
      return json({ error: "Invalid tree ID" }, { status: 400 });
    }

    if (!userEmail) {
      return json({ error: "userEmail is required" }, { status: 400 });
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name.trim();
    if (icon !== undefined) updateData.icon = icon;

    const [updated] = await db!
      .update(collectionTrees)
      .set(updateData)
      .where(
        and(
          eq(collectionTrees.id, treeId),
          eq(collectionTrees.userEmail, userEmail),
        ),
      )
      .returning();

    if (!updated) {
      return json({ error: "Tree not found" }, { status: 404 });
    }

    return json(updated);
  } catch (error) {
    console.error("Error updating tree:", error);
    return json({ error: "Failed to update tree" }, { status: 500 });
  }
};

/**
 * DELETE /api/trees/[id]?userEmail=xxx
 * Delete a tree and all its nodes (cascade)
 */
export const DELETE: RequestHandler = async ({ params, url }) => {
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

    const deleted = await db!
      .delete(collectionTrees)
      .where(
        and(
          eq(collectionTrees.id, treeId),
          eq(collectionTrees.userEmail, userEmail),
        ),
      )
      .returning();

    if (deleted.length === 0) {
      return json({ error: "Tree not found" }, { status: 404 });
    }

    return json({ success: true, deleted: deleted[0] });
  } catch (error) {
    console.error("Error deleting tree:", error);
    return json({ error: "Failed to delete tree" }, { status: 500 });
  }
};
