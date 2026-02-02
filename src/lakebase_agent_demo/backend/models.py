from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from .. import __version__


class VersionOut(BaseModel):
    version: str

    @classmethod
    def from_metadata(cls):
        return cls(version=__version__)


# ============================================================================
# Category Models
# ============================================================================


class CategoryOut(BaseModel):
    """Category response model."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
    created_at: datetime


# ============================================================================
# Inventory Models
# ============================================================================


class InventoryOut(BaseModel):
    """Inventory response model."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    updated_at: datetime


# ============================================================================
# Product Models
# ============================================================================


class ProductOut(BaseModel):
    """Product response model."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
    price: Decimal
    image_url: str | None = None
    category_id: int
    created_at: datetime
    updated_at: datetime
    # Nested relationships
    category: CategoryOut | None = None
    inventory: InventoryOut | None = None


class ProductListOut(BaseModel):
    """Product list item (without nested relationships for performance)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
    price: Decimal
    image_url: str | None = None
    category_id: int
    category_name: str | None = None
    quantity: int | None = None
