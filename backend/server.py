from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Header, Query, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import requests
import bcrypt
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from jose import jwt, JWTError

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Mongo
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-secret')
JWT_ALG = "HS256"
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@trabalengua.cl')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

# Object storage
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "trabalengua"
storage_key: Optional[str] = None

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


app = FastAPI()
api_router = APIRouter(prefix="/api")

# --- Constants ---
SIZES = ["4", "6", "8", "10", "12", "14", "16", "S", "M", "L", "XL"]

PRODUCT_TYPES = [
    {"key": "buzo_completo", "name": "Buzo Completo"},
    {"key": "pantalon_buzo", "name": "Pantalón de Buzo"},
    {"key": "polera_buzo", "name": "Polera de Buzo"},
    {"key": "polera_corta", "name": "Polera manga corta"},
    {"key": "polera_larga", "name": "Polera manga larga"},
    {"key": "polar", "name": "Polar"},
    {"key": "delantal_cotona", "name": "Delantales y cotonas"},
    {"key": "cotonas", "name": "Cotonas"},
]

# Order used in Talca's extended catalog
TALCA_PRODUCT_ORDER = [
    "buzo_completo",
    "pantalon_buzo",
    "polera_buzo",
    "polera_corta",
    "polera_larga",
    "polar",
    "delantal_cotona",
    "cotonas",
]

# Original 4-item catalog for other schools
DEFAULT_SCHOOL_PRODUCTS = ["buzo_completo", "pantalon_buzo", "polera_buzo", "polar"]

# Extra items for Talca (added via migration on startup)
TALCA_EXTRA_PRODUCTS = ["polera_corta", "polera_larga", "delantal_cotona", "cotonas"]

SCHOOLS_SEED = [
    {"slug": "colegio-talca", "name": "Colegio Talca", "order": 0, "featured": True,
     "description": "Nuestro colegio principal. Uniformes con calidad y detalle."},
    {"slug": "colegio-concepcion", "name": "Colegio Concepción", "order": 1, "featured": False,
     "description": "Uniformes oficiales del Colegio Concepción."},
    {"slug": "colegio-baltazar", "name": "Colegio Baltazar", "order": 2, "featured": False,
     "description": "Uniformes oficiales del Colegio Baltazar."},
    {"slug": "colegio-montessori", "name": "Colegio Montessori", "order": 3, "featured": False,
     "description": "Uniformes oficiales del Colegio Montessori."},
    {"slug": "escuela-carlos-spano", "name": "Escuela Carlos Spano", "order": 4, "featured": False,
     "description": "Uniformes oficiales de la Escuela Carlos Spano."},
    {"slug": "escuela-amancay", "name": "Escuela Amancay", "order": 5, "featured": False,
     "description": "Uniformes oficiales de la Escuela Amancay."},
]

DEFAULT_IMAGES = {
    "buzo_completo": "https://images.unsplash.com/photo-1632232963035-bc14755747c9?w=800",
    "pantalon_buzo": "https://images.unsplash.com/photo-1600294421265-c354b772e790?w=800",
    "polera_buzo": "https://images.unsplash.com/photo-1721134574801-2b0833d3b6a4?w=800",
    "polera_corta": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800",
    "polera_larga": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800",
    "polar": "https://images.pexels.com/photos/12246169/pexels-photo-12246169.jpeg?w=800",
    "delantal_cotona": "https://images.unsplash.com/photo-1597843797221-e34b4a320b97?w=800",
    "cotonas": "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800",
}

DEFAULT_PRICES = {
    "buzo_completo": 28990,
    "pantalon_buzo": 15990,
    "polera_buzo": 12990,
    "polera_corta": 9990,
    "polera_larga": 10990,
    "polar": 19990,
    "delantal_cotona": 13990,
    "cotonas": 12990,
}

# Product name per type_key for Talca (with renamed "Polerón de buzo")
TALCA_PRODUCT_NAMES = {
    "buzo_completo": "Buzo Completo",
    "pantalon_buzo": "Pantalón de Buzo",
    "polera_buzo": "Polerón de buzo",
    "polera_corta": "Polera manga corta",
    "polera_larga": "Polera manga larga",
    "polar": "Polar",
    "delantal_cotona": "Delantales y cotonas",
    "cotonas": "Cotonas",
}


DEFAULT_HERO_IMAGE = "https://images.pexels.com/photos/5710140/pexels-photo-5710140.jpeg?auto=compress&cs=tinysrgb&w=1400"
DEFAULT_BORDADO_IMAGE = "https://images.unsplash.com/photo-1631947430066-48c30d57b943?w=800&q=80"
DEFAULT_BORDADOS_HERO_IMAGE = "https://images.unsplash.com/photo-1631947430066-48c30d57b943?w=1200&q=80"

# IDs generados en el frontend sin API (SchoolPage fallback): "{school_slug}-{type_key}"
PRODUCT_TYPE_KEYS_FOR_FALLBACK = list(
    dict.fromkeys([*TALCA_PRODUCT_ORDER, *DEFAULT_SCHOOL_PRODUCTS, "cotonas_delantales"])
)


async def resolve_product_doc(product_id: str) -> Optional[dict]:
    """Resuelve producto por id Mongo o por id sintético slug-type_key del catálogo offline."""
    prod = await db.products.find_one({"id": product_id}, {"_id": 0})
    if prod:
        return prod
    for tk in sorted(PRODUCT_TYPE_KEYS_FOR_FALLBACK, key=len, reverse=True):
        suffix = f"-{tk}"
        if not product_id.endswith(suffix):
            continue
        slug = product_id[: -len(suffix)]
        if not slug:
            continue
        row = await db.products.find_one({"school_slug": slug, "type_key": tk}, {"_id": 0})
        if row:
            return row
    return None


# --- Models ---
class LoginIn(BaseModel):
    email: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SizeStock(BaseModel):
    size: str
    stock: int = 0
    price: int = 0


class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    school_id: str
    school_slug: str
    school_name: str
    type_key: str
    name: str
    image_url: Optional[str] = None
    image_path: Optional[str] = None
    sizes: List[SizeStock] = []
    base_price: int = 0


class ProductUpdate(BaseModel):
    sizes: Optional[List[SizeStock]] = None
    base_price: Optional[int] = None
    image_url: Optional[str] = None
    name: Optional[str] = None


class School(BaseModel):
    id: str
    slug: str
    name: str
    description: str = ""
    order: int = 0
    featured: bool = False


class OrderItemIn(BaseModel):
    product_id: str
    school_name: str
    product_name: str
    size: str
    quantity: int
    unit_price: int


class OrderCreate(BaseModel):
    customer_name: str
    whatsapp: str
    email: str
    items: List[OrderItemIn]
    delivery_method: str = "pickup"  # "pickup" | "delivery"


class Order(BaseModel):
    id: str
    customer_name: str
    whatsapp: str
    email: str
    items: List[Dict[str, Any]]
    subtotal: int = 0
    delivery_method: str = "pickup"
    delivery_fee: int = 0
    total: int
    status: str = "pending"
    is_deleted: bool = False
    created_at: str


DELIVERY_FEE = 4990


# --- Auth helpers ---
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())


def create_token(email: str) -> str:
    payload = {"sub": email, "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def require_admin(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Token inválido")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")


# --- Startup: seed ---
@app.on_event("startup")
async def startup():
    # storage
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")

    # admin
    admin_email_key = ADMIN_EMAIL.lower().strip()
    existing = await db.users.find_one({"email": admin_email_key}, {"_id": 0})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email_key,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin user seeded: {admin_email_key}")
    # Normalizar mayúsculas en emails admin existentes (login usa email en minúsculas)
    legacy_admins = await db.users.find({"role": "admin"}, {"_id": 0, "id": 1, "email": 1}).to_list(50)
    for u in legacy_admins:
        em = u.get("email") or ""
        if em and em != em.lower():
            await db.users.update_one({"id": u["id"]}, {"$set": {"email": em.lower()}})
            logger.info(f"Admin email normalized: {em!r} → {em.lower()!r}")

    # schools
    for s in SCHOOLS_SEED:
        existing_school = await db.schools.find_one({"slug": s["slug"]})
        if not existing_school:
            school_id = str(uuid.uuid4())
            await db.schools.insert_one({"id": school_id, **s})
            # Decide product list: Talca gets extended catalog, others get default 4
            type_keys = TALCA_PRODUCT_ORDER if s["slug"] == "colegio-talca" else DEFAULT_SCHOOL_PRODUCTS
            name_map = TALCA_PRODUCT_NAMES if s["slug"] == "colegio-talca" else {k: next(pt["name"] for pt in PRODUCT_TYPES if pt["key"] == k) for k in type_keys}
            for key in type_keys:
                prod_id = str(uuid.uuid4())
                sizes_init = [{"size": sz, "stock": 5, "price": DEFAULT_PRICES[key]} for sz in SIZES]
                await db.products.insert_one({
                    "id": prod_id,
                    "school_id": school_id,
                    "school_slug": s["slug"],
                    "school_name": s["name"],
                    "type_key": key,
                    "name": name_map[key],
                    "image_url": DEFAULT_IMAGES[key],
                    "image_path": None,
                    "sizes": sizes_init,
                    "base_price": DEFAULT_PRICES[key],
                    "created_at": datetime.now(timezone.utc).isoformat(),
                })
            logger.info(f"Seeded school + products: {s['name']}")

    # Idempotent migration: Colegio Talca extended catalog + rename polera_buzo
    talca = await db.schools.find_one({"slug": "colegio-talca"}, {"_id": 0})
    if talca:
        # Rename polera_buzo display name for Talca
        await db.products.update_one(
            {"school_slug": "colegio-talca", "type_key": "polera_buzo"},
            {"$set": {"name": "Polerón de buzo"}}
        )
        # Ensure the 3 new Talca products exist
        for key in TALCA_EXTRA_PRODUCTS:
            exists = await db.products.find_one(
                {"school_slug": "colegio-talca", "type_key": key}
            )
            if not exists:
                sizes_init = [{"size": sz, "stock": 5, "price": DEFAULT_PRICES[key]} for sz in SIZES]
                await db.products.insert_one({
                    "id": str(uuid.uuid4()),
                    "school_id": talca["id"],
                    "school_slug": "colegio-talca",
                    "school_name": talca["name"],
                    "type_key": key,
                    "name": TALCA_PRODUCT_NAMES[key],
                    "image_url": DEFAULT_IMAGES[key],
                    "image_path": None,
                    "sizes": sizes_init,
                    "base_price": DEFAULT_PRICES[key],
                    "created_at": datetime.now(timezone.utc).isoformat(),
                })
                logger.info(f"Talca extra product added: {key}")

    # settings singleton
    existing_settings = await db.settings.find_one({"id": "main"})
    if not existing_settings:
        await db.settings.insert_one({
            "id": "main",
            "hero_image_url": DEFAULT_HERO_IMAGE,
            "hero_image_path": None,
            "bordado_image_url": DEFAULT_BORDADO_IMAGE,
            "bordado_image_path": None,
            "bordados_hero_image_url": DEFAULT_BORDADOS_HERO_IMAGE,
            "bordados_hero_image_path": None,
        })
        logger.info("Default settings seeded")
    else:
        backfill = {}
        if not existing_settings.get("bordado_image_url"):
            backfill["bordado_image_url"] = DEFAULT_BORDADO_IMAGE
        if not existing_settings.get("bordados_hero_image_url"):
            backfill["bordados_hero_image_url"] = DEFAULT_BORDADOS_HERO_IMAGE
        if backfill:
            await db.settings.update_one({"id": "main"}, {"$set": backfill})


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# --- Routes ---
@api_router.get("/")
async def root():
    return {"message": "Trabalengua Escolares API"}


# Helper: For Talca, buzo_completo stock per size is min(pantalon, poleron) same size.
async def apply_talca_buzo_dynamic_stock(products: List[dict]) -> List[dict]:
    """Mutates product dicts in-place for Talca's buzo_completo to reflect dynamic stock."""
    talca_products = [p for p in products if p.get("school_slug") == "colegio-talca"]
    if not talca_products:
        return products
    pant = next((p for p in talca_products if p["type_key"] == "pantalon_buzo"), None)
    pol = next((p for p in talca_products if p["type_key"] == "polera_buzo"), None)
    buzo = next((p for p in talca_products if p["type_key"] == "buzo_completo"), None)
    if not (pant and pol and buzo):
        return products
    pant_by_size = {s["size"]: s for s in pant.get("sizes", [])}
    pol_by_size = {s["size"]: s for s in pol.get("sizes", [])}
    new_sizes = []
    for s in buzo.get("sizes", []):
        p_row = pant_by_size.get(s["size"])
        po_row = pol_by_size.get(s["size"])
        dynamic_stock = min(
            p_row["stock"] if p_row else 0,
            po_row["stock"] if po_row else 0,
        )
        new_sizes.append({**s, "stock": dynamic_stock})
    buzo["sizes"] = new_sizes
    buzo["dynamic_stock"] = True
    return products


async def sync_talca_buzo_stocks_from_buzo_document(buzo_sizes: List[dict]) -> None:
    """Al guardar tallas del Buzo Completo (Talca), replica el stock en pantalón y polerón para que el mínimo coincida."""
    pant = await db.products.find_one(
        {"school_slug": "colegio-talca", "type_key": "pantalon_buzo"}, {"_id": 0}
    )
    pol = await db.products.find_one(
        {"school_slug": "colegio-talca", "type_key": "polera_buzo"}, {"_id": 0}
    )
    if not pant or not pol:
        return
    stock_map = {str(s["size"]): int(s.get("stock", 0)) for s in buzo_sizes}
    new_pant = [{**s, "stock": stock_map.get(s["size"], int(s.get("stock", 0)))} for s in pant.get("sizes", [])]
    new_pol = [{**s, "stock": stock_map.get(s["size"], int(s.get("stock", 0)))} for s in pol.get("sizes", [])]
    await db.products.update_one({"id": pant["id"]}, {"$set": {"sizes": new_pant}})
    await db.products.update_one({"id": pol["id"]}, {"$set": {"sizes": new_pol}})


async def get_talca_dynamic_buzo_sizes() -> Optional[List[dict]]:
    """Returns dynamic sizes array for Talca's buzo_completo."""
    pant = await db.products.find_one(
        {"school_slug": "colegio-talca", "type_key": "pantalon_buzo"}, {"_id": 0}
    )
    pol = await db.products.find_one(
        {"school_slug": "colegio-talca", "type_key": "polera_buzo"}, {"_id": 0}
    )
    buzo = await db.products.find_one(
        {"school_slug": "colegio-talca", "type_key": "buzo_completo"}, {"_id": 0}
    )
    if not (pant and pol and buzo):
        return None
    pant_by = {s["size"]: s for s in pant.get("sizes", [])}
    pol_by = {s["size"]: s for s in pol.get("sizes", [])}
    return [
        {**s, "stock": min(
            pant_by.get(s["size"], {}).get("stock", 0),
            pol_by.get(s["size"], {}).get("stock", 0),
        )}
        for s in buzo.get("sizes", [])
    ]


@api_router.post("/auth/login", response_model=TokenOut)
async def login(data: LoginIn):
    user = await db.users.find_one({"email": data.email.lower().strip()}, {"_id": 0})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    token = create_token(user["email"])
    return TokenOut(access_token=token)


@api_router.get("/auth/me")
async def me(admin_email: str = Depends(require_admin)):
    return {"email": admin_email, "role": "admin"}


@api_router.get("/schools", response_model=List[School])
async def get_schools():
    schools = await db.schools.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return schools


@api_router.get("/schools/{slug}")
async def get_school(slug: str):
    school = await db.schools.find_one({"slug": slug}, {"_id": 0})
    if not school:
        raise HTTPException(status_code=404, detail="Colegio no encontrado")
    products = await db.products.find({"school_slug": slug}, {"_id": 0}).to_list(100)
    if slug == "colegio-talca":
        order_map = {k: i for i, k in enumerate(TALCA_PRODUCT_ORDER)}
        await apply_talca_buzo_dynamic_stock(products)
    else:
        order_map = {p["key"]: i for i, p in enumerate(PRODUCT_TYPES)}
    products.sort(key=lambda p: order_map.get(p["type_key"], 99))
    return {"school": school, "products": products}


@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    prod = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    # Talca buzo_completo → dynamic stock
    if prod.get("school_slug") == "colegio-talca" and prod.get("type_key") == "buzo_completo":
        dyn = await get_talca_dynamic_buzo_sizes()
        if dyn is not None:
            prod["sizes"] = dyn
            prod["dynamic_stock"] = True
    return prod


@api_router.post("/orders", response_model=Order)
async def create_order(data: OrderCreate):
    if not data.items:
        raise HTTPException(status_code=400, detail="Carrito vacío")
    if data.delivery_method not in {"pickup", "delivery"}:
        raise HTTPException(status_code=400, detail="Método de entrega inválido")
    # Validate and decrement stock
    subtotal = 0
    items_saved = []
    for item in data.items:
        prod = await resolve_product_doc(item.product_id)
        if not prod:
            raise HTTPException(status_code=400, detail=f"Producto no existe: {item.product_name}")
        pid = prod["id"]

        is_talca_buzo = (
            prod.get("school_slug") == "colegio-talca"
            and prod.get("type_key") == "buzo_completo"
        )

        if is_talca_buzo:
            # Dynamic stock: check + decrement BOTH pantalon_buzo AND polera_buzo for this size
            pant = await db.products.find_one(
                {"school_slug": "colegio-talca", "type_key": "pantalon_buzo"}, {"_id": 0}
            )
            pol = await db.products.find_one(
                {"school_slug": "colegio-talca", "type_key": "polera_buzo"}, {"_id": 0}
            )
            if not pant or not pol:
                raise HTTPException(status_code=400, detail="Buzo completo no disponible")
            pant_row = next((s for s in pant["sizes"] if s["size"] == item.size), None)
            pol_row = next((s for s in pol["sizes"] if s["size"] == item.size), None)
            if not pant_row or not pol_row:
                raise HTTPException(status_code=400, detail=f"Talla {item.size} no disponible")
            available = min(pant_row["stock"], pol_row["stock"])
            if available < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para Buzo Completo talla {item.size} (máx {available})"
                )
            # decrement both
            new_pant_sizes = [
                {**s, "stock": s["stock"] - item.quantity} if s["size"] == item.size else s
                for s in pant["sizes"]
            ]
            new_pol_sizes = [
                {**s, "stock": s["stock"] - item.quantity} if s["size"] == item.size else s
                for s in pol["sizes"]
            ]
            await db.products.update_one({"id": pant["id"]}, {"$set": {"sizes": new_pant_sizes}})
            await db.products.update_one({"id": pol["id"]}, {"$set": {"sizes": new_pol_sizes}})
            # Use buzo_completo's own size row for unit_price (admin-configurable)
            buzo_row = next((s for s in prod["sizes"] if s["size"] == item.size), None)
            unit_price = buzo_row["price"] if buzo_row else prod.get("base_price", 0)
            item_subtotal = unit_price * item.quantity
            subtotal += item_subtotal
            items_saved.append({
                "product_id": pid,
                "school_name": item.school_name,
                "product_name": item.product_name,
                "size": item.size,
                "quantity": item.quantity,
                "unit_price": unit_price,
                "subtotal": item_subtotal,
                "composite": True,
            })
            continue

        # Standard single-product path
        size_row = next((s for s in prod["sizes"] if s["size"] == item.size), None)
        if not size_row:
            raise HTTPException(status_code=400, detail=f"Talla {item.size} no disponible")
        if size_row["stock"] < item.quantity:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para {item.product_name} talla {item.size}")
        # decrement
        new_sizes = [
            {**s, "stock": s["stock"] - item.quantity} if s["size"] == item.size else s
            for s in prod["sizes"]
        ]
        await db.products.update_one({"id": pid}, {"$set": {"sizes": new_sizes}})
        item_subtotal = size_row["price"] * item.quantity
        subtotal += item_subtotal
        items_saved.append({
            "product_id": pid,
            "school_name": item.school_name,
            "product_name": item.product_name,
            "size": item.size,
            "quantity": item.quantity,
            "unit_price": size_row["price"],
            "subtotal": item_subtotal,
        })

    delivery_fee = DELIVERY_FEE if data.delivery_method == "delivery" else 0
    total = subtotal + delivery_fee

    order_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    order_doc = {
        "id": order_id,
        "customer_name": data.customer_name,
        "whatsapp": data.whatsapp,
        "email": data.email,
        "items": items_saved,
        "subtotal": subtotal,
        "delivery_method": data.delivery_method,
        "delivery_fee": delivery_fee,
        "total": total,
        "status": "pending",
        "is_deleted": False,
        "created_at": created_at,
    }
    await db.orders.insert_one(dict(order_doc))
    return Order(**order_doc)


# --- Admin ---
@api_router.get("/admin/products")
async def admin_products(admin_email: str = Depends(require_admin)):
    products = await db.products.find({}, {"_id": 0}).to_list(500)
    # Apply dynamic stock for Talca buzo_completo so admin sees the real computed value
    await apply_talca_buzo_dynamic_stock(products)
    return products


@api_router.patch("/admin/products/{product_id}")
async def admin_update_product(product_id: str, data: ProductUpdate, admin_email: str = Depends(require_admin)):
    prod = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    update: Dict[str, Any] = {}
    if data.sizes is not None:
        new_sizes = [s.model_dump() for s in data.sizes]
        if prod.get("school_slug") == "colegio-talca" and prod.get("type_key") == "buzo_completo":
            await sync_talca_buzo_stocks_from_buzo_document(new_sizes)
        update["sizes"] = new_sizes
    if data.base_price is not None:
        update["base_price"] = data.base_price
    if data.image_url is not None:
        update["image_url"] = data.image_url
    if data.name is not None:
        name = data.name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Nombre vacío")
        update["name"] = name
    if not update:
        raise HTTPException(status_code=400, detail="Sin cambios")
    res = await db.products.update_one({"id": product_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    out = await db.products.find_one({"id": product_id}, {"_id": 0})
    if out and out.get("school_slug") == "colegio-talca" and out.get("type_key") == "buzo_completo":
        all_talca = await db.products.find({"school_slug": "colegio-talca"}, {"_id": 0}).to_list(100)
        await apply_talca_buzo_dynamic_stock(all_talca)
        buzo = next((p for p in all_talca if p.get("type_key") == "buzo_completo"), None)
        if buzo:
            return buzo
    return out


@api_router.post("/admin/products/{product_id}/image")
async def admin_upload_image(product_id: str, file: UploadFile = File(...), admin_email: str = Depends(require_admin)):
    prod = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    ext = (file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg").lower()
    if ext not in {"jpg", "jpeg", "png", "webp", "gif"}:
        raise HTTPException(status_code=400, detail="Formato no soportado")
    path = f"{APP_NAME}/products/{product_id}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    content_type = file.content_type or f"image/{ 'jpeg' if ext == 'jpg' else ext }"
    result = put_object(path, data, content_type)
    stored_path = result["path"]
    # Save file record
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": stored_path,
        "product_id": product_id,
        "content_type": content_type,
        "size": result.get("size", 0),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    # Update product: point image_url to our serve endpoint
    public_url = f"/api/files/{stored_path}"
    await db.products.update_one(
        {"id": product_id},
        {"$set": {"image_path": stored_path, "image_url": public_url}}
    )
    prod = await db.products.find_one({"id": product_id}, {"_id": 0})
    return prod


@api_router.get("/files/{path:path}")
async def get_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    content, ct = get_object(path)
    return Response(content=content, media_type=record.get("content_type", ct))


@api_router.get("/admin/orders")
async def admin_orders(trash: bool = False, admin_email: str = Depends(require_admin)):
    query = {"is_deleted": True} if trash else {"$or": [{"is_deleted": False}, {"is_deleted": {"$exists": False}}]}
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return orders


class OrderStatusUpdate(BaseModel):
    status: str


class SettingsOut(BaseModel):
    hero_image_url: str
    bordado_image_url: str
    bordados_hero_image_url: str


class SettingsUpdate(BaseModel):
    hero_image_url: Optional[str] = None
    bordado_image_url: Optional[str] = None
    bordados_hero_image_url: Optional[str] = None


@api_router.patch("/admin/orders/{order_id}")
async def admin_update_order(order_id: str, data: OrderStatusUpdate, admin_email: str = Depends(require_admin)):
    allowed = {"pending", "paid", "delivered", "cancelled"}
    if data.status not in allowed:
        raise HTTPException(status_code=400, detail="Estado inválido")
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    old_status = order.get("status", "pending")
    new_status = data.status
    is_restored = order.get("is_stock_restored", False)
    will_be_cancelled = new_status == "cancelled"

    update_fields: Dict[str, Any] = {"status": new_status}

    if not is_restored and will_be_cancelled:
        # Stock currently deducted → restore (add back)
        await _adjust_stock_for_order(order, +1)
        update_fields["is_stock_restored"] = True
    elif is_restored and not will_be_cancelled:
        # Stock previously restored (was cancelled) → re-deduct
        await _adjust_stock_for_order(order, -1)
        update_fields["is_stock_restored"] = False
    # else: no-op transition between non-cancelled statuses or cancelled→cancelled

    await db.orders.update_one({"id": order_id}, {"$set": update_fields})
    fresh = await db.orders.find_one({"id": order_id}, {"_id": 0})
    logger.info(f"Order {order_id[:8]} status {old_status} → {new_status} (restored={update_fields.get('is_stock_restored', is_restored)})")
    return fresh


async def _adjust_stock_for_order(order: dict, sign: int) -> None:
    """Adjust product stock for every item in an order.

    sign = +1 → return stock to inventory (cancellation).
    sign = -1 → deduct stock again (reactivation).
    For Talca's composite Buzo Completo items, both pantalón and polerón are adjusted.
    """
    for item in order.get("items", []):
        size = item["size"]
        qty = item["quantity"]
        if item.get("composite"):
            for type_key in ("pantalon_buzo", "polera_buzo"):
                p = await db.products.find_one(
                    {"school_slug": "colegio-talca", "type_key": type_key}, {"_id": 0}
                )
                if not p:
                    continue
                new_sizes = [
                    {**s, "stock": max(0, s["stock"] + sign * qty)} if s["size"] == size else s
                    for s in p.get("sizes", [])
                ]
                await db.products.update_one({"id": p["id"]}, {"$set": {"sizes": new_sizes}})
        else:
            p = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
            if not p:
                continue
            new_sizes = [
                {**s, "stock": max(0, s["stock"] + sign * qty)} if s["size"] == size else s
                for s in p.get("sizes", [])
            ]
            await db.products.update_one({"id": p["id"]}, {"$set": {"sizes": new_sizes}})


@api_router.delete("/admin/orders/{order_id}")
async def admin_soft_delete_order(order_id: str, admin_email: str = Depends(require_admin)):
    res = await db.orders.update_one({"id": order_id}, {"$set": {"is_deleted": True}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return {"ok": True}


@api_router.post("/admin/orders/{order_id}/restore")
async def admin_restore_order(order_id: str, admin_email: str = Depends(require_admin)):
    res = await db.orders.update_one({"id": order_id}, {"$set": {"is_deleted": False}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return {"ok": True}


@api_router.delete("/admin/orders/{order_id}/permanent")
async def admin_hard_delete_order(order_id: str, admin_email: str = Depends(require_admin)):
    res = await db.orders.delete_one({"id": order_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return {"ok": True}


# --- Settings (public read, admin write) ---
def _settings_to_out(s: Optional[dict]) -> "SettingsOut":
    s = s or {}
    return SettingsOut(
        hero_image_url=s.get("hero_image_url") or DEFAULT_HERO_IMAGE,
        bordado_image_url=s.get("bordado_image_url") or DEFAULT_BORDADO_IMAGE,
        bordados_hero_image_url=s.get("bordados_hero_image_url") or DEFAULT_BORDADOS_HERO_IMAGE,
    )


@api_router.get("/settings", response_model=SettingsOut)
async def get_settings():
    s = await db.settings.find_one({"id": "main"}, {"_id": 0})
    return _settings_to_out(s)


@api_router.patch("/admin/settings", response_model=SettingsOut)
async def admin_update_settings(data: SettingsUpdate, admin_email: str = Depends(require_admin)):
    update: Dict[str, Any] = {}
    if data.hero_image_url is not None:
        update["hero_image_url"] = data.hero_image_url
    if data.bordado_image_url is not None:
        update["bordado_image_url"] = data.bordado_image_url
    if data.bordados_hero_image_url is not None:
        update["bordados_hero_image_url"] = data.bordados_hero_image_url
    if not update:
        raise HTTPException(status_code=400, detail="Sin cambios")
    await db.settings.update_one({"id": "main"}, {"$set": update}, upsert=True)
    s = await db.settings.find_one({"id": "main"}, {"_id": 0})
    return _settings_to_out(s)


async def _upload_settings_image(file: UploadFile, kind: str, url_field: str, path_field: str) -> SettingsOut:
    ext = (file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg").lower()
    if ext not in {"jpg", "jpeg", "png", "webp"}:
        raise HTTPException(status_code=400, detail="Formato no soportado")
    path = f"{APP_NAME}/settings/{kind}-{uuid.uuid4()}.{ext}"
    data = await file.read()
    content_type = file.content_type or f"image/{'jpeg' if ext == 'jpg' else ext}"
    result = put_object(path, data, content_type)
    stored_path = result["path"]
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": stored_path,
        "kind": kind,
        "content_type": content_type,
        "size": result.get("size", 0),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    public_url = f"/api/files/{stored_path}"
    await db.settings.update_one(
        {"id": "main"},
        {"$set": {url_field: public_url, path_field: stored_path}},
        upsert=True,
    )
    s = await db.settings.find_one({"id": "main"}, {"_id": 0})
    return _settings_to_out(s)


@api_router.post("/admin/settings/hero-image", response_model=SettingsOut)
async def admin_upload_hero_image(file: UploadFile = File(...), admin_email: str = Depends(require_admin)):
    return await _upload_settings_image(file, "hero", "hero_image_url", "hero_image_path")


@api_router.post("/admin/settings/bordado-image", response_model=SettingsOut)
async def admin_upload_bordado_image(file: UploadFile = File(...), admin_email: str = Depends(require_admin)):
    return await _upload_settings_image(file, "bordado", "bordado_image_url", "bordado_image_path")


@api_router.post("/admin/settings/bordados-hero-image", response_model=SettingsOut)
async def admin_upload_bordados_hero_image(file: UploadFile = File(...), admin_email: str = Depends(require_admin)):
    return await _upload_settings_image(file, "bordados-hero", "bordados_hero_image_url", "bordados_hero_image_path")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        o.strip()
        for o in os.environ.get(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if o.strip()
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)
