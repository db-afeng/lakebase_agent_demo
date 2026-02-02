from typing import Annotated

from databricks.sdk import WorkspaceClient
from databricks.sdk.service.iam import User as UserOut
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from .._metadata import api_prefix
from .db_models import Category, Inventory, Product
from .dependencies import DbSessionDep, get_obo_ws
from .models import CategoryOut, ProductListOut, ProductOut, VersionOut

api = APIRouter(prefix=api_prefix)


# ============================================================================
# System Endpoints
# ============================================================================


@api.get("/version", response_model=VersionOut, operation_id="version")
async def version():
    return VersionOut.from_metadata()


@api.get("/current-user", response_model=UserOut, operation_id="currentUser")
def me(obo_ws: Annotated[WorkspaceClient, Depends(get_obo_ws)]):
    return obo_ws.current_user.me()


# ============================================================================
# Category Endpoints
# ============================================================================


@api.get("/categories", response_model=list[CategoryOut], operation_id="getCategories")
async def get_categories(session: DbSessionDep):
    """Get all product categories."""
    result = await session.execute(select(Category).order_by(Category.id))
    return result.scalars().all()


@api.get(
    "/categories/{category_id}", response_model=CategoryOut, operation_id="getCategory"
)
async def get_category(category_id: int, session: DbSessionDep):
    """Get a specific category by ID."""
    result = await session.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


# ============================================================================
# Product Endpoints
# ============================================================================


@api.get("/products", response_model=list[ProductListOut], operation_id="getProducts")
async def get_products(
    session: DbSessionDep,
    category_id: Annotated[int | None, Query(description="Filter by category")] = None,
):
    """Get all products, optionally filtered by category."""
    query = (
        select(
            Product.id,
            Product.name,
            Product.description,
            Product.price,
            Product.image_url,
            Product.category_id,
            Category.name.label("category_name"),
            Inventory.quantity,
        )
        .join(Category, Product.category_id == Category.id)
        .outerjoin(Inventory, Product.id == Inventory.product_id)
        .order_by(Product.id)
    )

    if category_id is not None:
        query = query.where(Product.category_id == category_id)

    result = await session.execute(query)
    rows = result.all()

    return [
        ProductListOut(
            id=row.id,
            name=row.name,
            description=row.description,
            price=row.price,
            image_url=row.image_url,
            category_id=row.category_id,
            category_name=row.category_name,
            quantity=row.quantity,
        )
        for row in rows
    ]


@api.get(
    "/products/{product_id}", response_model=ProductOut, operation_id="getProduct"
)
async def get_product(product_id: int, session: DbSessionDep):
    """Get a specific product by ID with full details."""
    result = await session.execute(
        select(Product)
        .where(Product.id == product_id)
        .options(selectinload(Product.category), selectinload(Product.inventory))
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
