import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET - Fetch a specific nav item by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const response = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
      },
      body: JSON.stringify({
        query: `
          query GetNavItemById($id: String!) {
            getNavItemById(id: $id) {
              _id
              name
              href
              order
              isVisible
              subMenus {
                name
                href
              }
              createdAt
              updatedAt
            }
          }
        `,
        variables: { id },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json(
        { error: data.errors[0].message },
        { status: 400 },
      );
    }

    return NextResponse.json(data.data.getNavItemById);
  } catch (error) {
    console.error("Error fetching nav item:", error);
    return NextResponse.json(
      { error: "Failed to fetch nav item" },
      { status: 500 },
    );
  }
}

// PUT - Update a specific nav item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const input = await request.json();

    const response = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
      },
      body: JSON.stringify({
        query: `
          mutation UpdateNavItem($id: String!, $input: UpdateNavItemInput!) {
            updateNavItem(id: $id, input: $input) {
              _id
              name
              href
              order
              isVisible
              subMenus {
                name
                href
              }
              updatedAt
            }
          }
        `,
        variables: { id, input },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json(
        { error: data.errors[0].message },
        { status: 400 },
      );
    }

    return NextResponse.json(data.data.updateNavItem);
  } catch (error) {
    console.error("Error updating nav item:", error);
    return NextResponse.json(
      { error: "Failed to update nav item" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a specific nav item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const response = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
      },
      body: JSON.stringify({
        query: `
          mutation DeleteNavItem($id: String!) {
            deleteNavItem(id: $id)
          }
        `,
        variables: { id },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json(
        { error: data.errors[0].message },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: data.data.deleteNavItem });
  } catch (error) {
    console.error("Error deleting nav item:", error);
    return NextResponse.json(
      { error: "Failed to delete nav item" },
      { status: 500 },
    );
  }
}
