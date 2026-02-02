"""Seed data for Data & Bricks Store.

Revision ID: 002_seed_data
Revises: 001_initial
Create Date: 2026-02-02

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "002_seed_data"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Seed data for categories
CATEGORIES = [
    {
        "id": 1,
        "name": "Premium Data",
        "description": "High-quality, artisanal data sets for the discerning data connoisseur.",
    },
    {
        "id": 2,
        "name": "Vintage Data",
        "description": "Classic data formats from a simpler time. Nostalgia included at no extra cost.",
    },
    {
        "id": 3,
        "name": "Artisan Bricks",
        "description": "Handcrafted bricks for the modern builder. Each one unique.",
    },
    {
        "id": 4,
        "name": "Industrial Bricks",
        "description": "Heavy-duty bricks for serious construction projects.",
    },
]

# Seed data for products
PRODUCTS = [
    # Premium Data
    {
        "id": 1,
        "name": "Premium JSON Blob",
        "description": "A perfectly structured JSON object with over 1000 nested properties. Minified and beautified versions included.",
        "price": 49.99,
        "image_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400",
        "category_id": 1,
    },
    {
        "id": 2,
        "name": "Enterprise Parquet File",
        "description": "Columnar storage at its finest. Optimized for Spark, ready for production.",
        "price": 199.99,
        "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
        "category_id": 1,
    },
    {
        "id": 3,
        "name": "Organic CSV Dataset",
        "description": "Locally sourced, farm-to-table CSV. No pesticides, no NULL values.",
        "price": 29.99,
        "image_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
        "category_id": 1,
    },
    {
        "id": 4,
        "name": "Delta Lake Subscription",
        "description": "ACID transactions, time travel, and schema enforcement. Monthly subscription.",
        "price": 99.99,
        "image_url": "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400",
        "category_id": 1,
    },
    # Vintage Data
    {
        "id": 5,
        "name": "Vintage XML Dataset",
        "description": "Remember when data had angles? Hand-tagged with love. DTD included.",
        "price": 19.99,
        "image_url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
        "category_id": 2,
    },
    {
        "id": 6,
        "name": "Classic SQL Dump",
        "description": "A perfectly preserved MySQL dump from 2008. Triggers and stored procedures intact.",
        "price": 39.99,
        "image_url": "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400",
        "category_id": 2,
    },
    {
        "id": 7,
        "name": "Retro Fixed-Width File",
        "description": "Experience data like grandpa used to process. 80 columns of pure nostalgia.",
        "price": 14.99,
        "image_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400",
        "category_id": 2,
    },
    # Artisan Bricks
    {
        "id": 8,
        "name": "Artisan Red Brick",
        "description": "Hand-molded terracotta brick. Perfect for that rustic data center aesthetic.",
        "price": 5.99,
        "image_url": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",
        "category_id": 3,
    },
    {
        "id": 9,
        "name": "Reclaimed Vintage Brick",
        "description": "Salvaged from a 19th century warehouse. Each brick tells a story.",
        "price": 12.99,
        "image_url": "https://images.unsplash.com/photo-1595844730298-b960ff98fee0?w=400",
        "category_id": 3,
    },
    {
        "id": 10,
        "name": "Designer Glass Brick",
        "description": "Translucent elegance for modern builds. LED-compatible.",
        "price": 24.99,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        "category_id": 3,
    },
    # Industrial Bricks
    {
        "id": 11,
        "name": "Industrial Cinder Block",
        "description": "Heavy-duty concrete block. Load-bearing certified. Forklift recommended.",
        "price": 3.49,
        "image_url": "https://images.unsplash.com/photo-1590644067639-f1050a6a20a8?w=400",
        "category_id": 4,
    },
    {
        "id": 12,
        "name": "Fire-Resistant Brick",
        "description": "Rated for 2000°F. Perfect for server room firewalls (the physical kind).",
        "price": 8.99,
        "image_url": "https://images.unsplash.com/photo-1587582423116-ec07293f0395?w=400",
        "category_id": 4,
    },
    {
        "id": 13,
        "name": "Bulk Paver Brick (100 pack)",
        "description": "Standard interlocking pavers. Build a patio, a driveway, or a very slow database.",
        "price": 149.99,
        "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        "category_id": 4,
    },
]

# Seed data for inventory
INVENTORY = [
    {"id": 1, "product_id": 1, "quantity": 1000},
    {"id": 2, "product_id": 2, "quantity": 50},
    {"id": 3, "product_id": 3, "quantity": 5000},
    {"id": 4, "product_id": 4, "quantity": 999},
    {"id": 5, "product_id": 5, "quantity": 200},
    {"id": 6, "product_id": 6, "quantity": 75},
    {"id": 7, "product_id": 7, "quantity": 300},
    {"id": 8, "product_id": 8, "quantity": 10000},
    {"id": 9, "product_id": 9, "quantity": 150},
    {"id": 10, "product_id": 10, "quantity": 500},
    {"id": 11, "product_id": 11, "quantity": 25000},
    {"id": 12, "product_id": 12, "quantity": 3000},
    {"id": 13, "product_id": 13, "quantity": 100},
]


def upgrade() -> None:
    # Insert categories
    for cat in CATEGORIES:
        op.execute(
            f"""
            INSERT INTO categories (id, name, description)
            VALUES ({cat['id']}, '{cat['name']}', '{cat['description']}')
            """
        )

    # Insert products
    for prod in PRODUCTS:
        desc = prod["description"].replace("'", "''")  # Escape single quotes
        op.execute(
            f"""
            INSERT INTO products (id, name, description, price, image_url, category_id)
            VALUES ({prod['id']}, '{prod['name']}', '{desc}', {prod['price']}, '{prod['image_url']}', {prod['category_id']})
            """
        )

    # Insert inventory
    for inv in INVENTORY:
        op.execute(
            f"""
            INSERT INTO inventory (id, product_id, quantity)
            VALUES ({inv['id']}, {inv['product_id']}, {inv['quantity']})
            """
        )

    # Reset sequences to be after our inserted IDs
    op.execute("SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories))")
    op.execute("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))")
    op.execute("SELECT setval('inventory_id_seq', (SELECT MAX(id) FROM inventory))")


def downgrade() -> None:
    op.execute("DELETE FROM inventory")
    op.execute("DELETE FROM products")
    op.execute("DELETE FROM categories")
