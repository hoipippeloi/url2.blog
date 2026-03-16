import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getDb, collectionTrees, treeNodes, collections } from "$lib/db";
import { desc, eq, and, isNull } from "drizzle-orm";

/**
 * GET /api/trees?userEmail=xxx
 * List all trees for a user with their root nodes count
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    const db = getDb();
    const userEmail = url.searchParams.get("userEmail");

    if (!userEmail) {
      return json({ error: "userEmail is required" }, { status: 400 });
    }

    const trees = await db!
      .select()
      .from(collectionTrees)
      .where(eq(collectionTrees.userEmail, userEmail))
      .orderBy(desc(collectionTrees.updatedAt));

    const treesWithCounts = await Promise.all(
      trees.map(async (tree) => {
        const rootNodes = await db!
          .select()
          .from(treeNodes)
          .where(
            and(eq(treeNodes.treeId, tree.id), isNull(treeNodes.parentId)),
          );
        return { ...tree, rootNodeCount: rootNodes.length };
      }),
    );

    return json(treesWithCounts);
  } catch (error) {
    console.error("Error fetching trees:", error);
    return json({ error: "Failed to fetch trees" }, { status: 500 });
  }
};

/**
 * POST /api/trees
 * Create a new tree
 * Body: { name: string, userEmail: string, icon?: string }
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const db = getDb();
    const body = await request.json();

    const { name, userEmail, icon } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return json({ error: "Name is required" }, { status: 400 });
    }

    if (!userEmail) {
      return json({ error: "userEmail is required" }, { status: 400 });
    }

    const [newTree] = await db!
      .insert(collectionTrees)
      .values({
        name: name.trim(),
        userEmail,
        icon: icon || null,
      })
      .returning();

    return json(newTree, { status: 201 });
  } catch (error) {
    console.error("Error creating tree:", error);
    return json({ error: "Failed to create tree" }, { status: 500 });
  }
};

/**
 * DELETE /api/trees?id=xx&userEmail=xxx
 * Delete a tree and all its nodes (cascade)
 */
export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const db = getDb();
    const id = url.searchParams.get("id");
    const userEmail = url.searchParams.get("userEmail");

    if (!id) {
      return json({ error: "ID is required" }, { status: 400 });
    }

    if (!userEmail) {
      return json({ error: "userEmail is required" }, { status: 400 });
    }

    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return json({ error: "Invalid ID" }, { status: 400 });
    }

    const deleted = await db!
      .delete(collectionTrees)
      .where(
        and(
          eq(collectionTrees.id, numericId),
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
