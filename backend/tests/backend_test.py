"""
Backend tests for Trabalengua Uniformes - Iteration 5.
Focus: Talca extended catalog (7 products), dynamic stock for buzo_completo,
dual-decrement order logic, and regression checks for other schools.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
# Fallback to frontend/.env file
if not BASE_URL:
    from pathlib import Path
    env_file = Path("/app/frontend/.env")
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@trabalengua.cl"
ADMIN_PASSWORD = "admin123"


# --- Fixtures -----------------------------------------------------------------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def admin_session(session, admin_token):
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {admin_token}",
    })
    return s


def _get_school(session, slug):
    r = session.get(f"{API}/schools/{slug}")
    assert r.status_code == 200, f"schools/{slug}: {r.status_code} {r.text}"
    return r.json()


def _product_map(school_json):
    return {p["type_key"]: p for p in school_json["products"]}


# --- Tests: Talca extended catalog --------------------------------------------
class TestTalcaCatalog:
    def test_talca_has_7_products_in_order(self, session):
        data = _get_school(session, "colegio-talca")
        products = data["products"]
        assert len(products) == 7, f"Expected 7 products, got {len(products)}"
        expected_order = [
            "buzo_completo", "pantalon_buzo", "polera_buzo",
            "polera_corta", "polera_larga", "polar", "delantal_cotona",
        ]
        actual_order = [p["type_key"] for p in products]
        assert actual_order == expected_order, f"Order mismatch: {actual_order}"

    def test_talca_polera_buzo_renamed(self, session):
        data = _get_school(session, "colegio-talca")
        pm = _product_map(data)
        assert pm["polera_buzo"]["name"] == "Polerón de buzo"

    def test_talca_buzo_dynamic_stock_true(self, session):
        data = _get_school(session, "colegio-talca")
        pm = _product_map(data)
        assert pm["buzo_completo"].get("dynamic_stock") is True

    def test_talca_buzo_sizes_are_min_of_pant_polera(self, session):
        data = _get_school(session, "colegio-talca")
        pm = _product_map(data)
        pant_by = {s["size"]: s["stock"] for s in pm["pantalon_buzo"]["sizes"]}
        pol_by = {s["size"]: s["stock"] for s in pm["polera_buzo"]["sizes"]}
        for s in pm["buzo_completo"]["sizes"]:
            expected = min(pant_by.get(s["size"], 0), pol_by.get(s["size"], 0))
            assert s["stock"] == expected, (
                f"Size {s['size']} buzo stock={s['stock']} expected min({pant_by.get(s['size'])},"
                f"{pol_by.get(s['size'])})={expected}"
            )

    def test_product_endpoint_talca_buzo_dynamic(self, session):
        data = _get_school(session, "colegio-talca")
        pm = _product_map(data)
        pid = pm["buzo_completo"]["id"]
        r = session.get(f"{API}/products/{pid}")
        assert r.status_code == 200
        prod = r.json()
        assert prod.get("dynamic_stock") is True
        pant_by = {s["size"]: s["stock"] for s in pm["pantalon_buzo"]["sizes"]}
        pol_by = {s["size"]: s["stock"] for s in pm["polera_buzo"]["sizes"]}
        for s in prod["sizes"]:
            assert s["stock"] == min(pant_by.get(s["size"], 0), pol_by.get(s["size"], 0))

    def test_new_talca_products_individually_fetchable(self, session):
        data = _get_school(session, "colegio-talca")
        pm = _product_map(data)
        for key in ("polera_corta", "polera_larga", "delantal_cotona"):
            pid = pm[key]["id"]
            r = session.get(f"{API}/products/{pid}")
            assert r.status_code == 200
            prod = r.json()
            assert prod["type_key"] == key
            # not dynamic
            assert not prod.get("dynamic_stock")


# --- Tests: regression on other schools ---------------------------------------
class TestOtherSchools:
    def test_concepcion_has_4_products(self, session):
        data = _get_school(session, "colegio-concepcion")
        assert len(data["products"]) == 4
        keys = sorted(p["type_key"] for p in data["products"])
        assert keys == sorted(["buzo_completo", "pantalon_buzo", "polera_buzo", "polar"])

    def test_concepcion_polera_buzo_default_name(self, session):
        data = _get_school(session, "colegio-concepcion")
        pm = _product_map(data)
        assert pm["polera_buzo"]["name"] == "Polera de Buzo"

    def test_concepcion_buzo_not_dynamic(self, session):
        data = _get_school(session, "colegio-concepcion")
        pm = _product_map(data)
        assert not pm["buzo_completo"].get("dynamic_stock")


# --- Tests: Orders - Talca buzo dual-decrement --------------------------------
class TestTalcaBuzoOrder:
    SIZE = "10"  # arbitrary middle size

    def _get_stocks(self, session):
        data = _get_school(session, "colegio-talca")
        pm = _product_map(data)
        pant_by = {s["size"]: s["stock"] for s in pm["pantalon_buzo"]["sizes"]}
        pol_by = {s["size"]: s["stock"] for s in pm["polera_buzo"]["sizes"]}
        buzo_own = {s["size"]: s for s in pm["buzo_completo"]["sizes"]}  # these are dynamic
        return pm, pant_by, pol_by, buzo_own

    def test_order_talca_buzo_decrements_both(self, session):
        pm, pant_before, pol_before, buzo_before = self._get_stocks(session)
        buzo_id = pm["buzo_completo"]["id"]
        pant_avail = pant_before.get(self.SIZE, 0)
        pol_avail = pol_before.get(self.SIZE, 0)
        if min(pant_avail, pol_avail) < 1:
            pytest.skip(f"Insufficient stock to test at size {self.SIZE}")

        payload = {
            "customer_name": "TEST_Buyer",
            "whatsapp": "+56911112222",
            "email": "TEST_buyer@example.com",
            "delivery_method": "pickup",
            "items": [{
                "product_id": buzo_id,
                "school_name": "Colegio Talca",
                "product_name": "Buzo Completo",
                "size": self.SIZE,
                "quantity": 1,
                "unit_price": 28990,
            }],
        }
        r = session.post(f"{API}/orders", json=payload)
        assert r.status_code == 200, f"Order failed: {r.status_code} {r.text}"
        order = r.json()
        assert order["subtotal"] > 0
        assert order["total"] == order["subtotal"]  # pickup
        assert order["items"][0].get("composite") is True

        # Verify both decremented by 1, buzo_completo own sizes unchanged, dynamic follows min
        pm2, pant_after, pol_after, buzo_after = self._get_stocks(session)
        assert pant_after[self.SIZE] == pant_before[self.SIZE] - 1, (
            f"pantalon_buzo stock should decrement: before={pant_before[self.SIZE]} "
            f"after={pant_after[self.SIZE]}"
        )
        assert pol_after[self.SIZE] == pol_before[self.SIZE] - 1, (
            f"polera_buzo stock should decrement: before={pol_before[self.SIZE]} "
            f"after={pol_after[self.SIZE]}"
        )
        # Dynamic stock is min of the two
        assert buzo_after[self.SIZE]["stock"] == min(pant_after[self.SIZE], pol_after[self.SIZE])

    def test_order_talca_buzo_exceeding_available_returns_400(self, session):
        pm, pant_before, pol_before, _ = self._get_stocks(session)
        buzo_id = pm["buzo_completo"]["id"]
        available = min(pant_before[self.SIZE], pol_before[self.SIZE])
        too_many = available + 5
        payload = {
            "customer_name": "TEST_Overflow",
            "whatsapp": "+56911112222",
            "email": "TEST_overflow@example.com",
            "delivery_method": "pickup",
            "items": [{
                "product_id": buzo_id,
                "school_name": "Colegio Talca",
                "product_name": "Buzo Completo",
                "size": self.SIZE,
                "quantity": too_many,
                "unit_price": 28990,
            }],
        }
        r = session.post(f"{API}/orders", json=payload)
        assert r.status_code == 400
        body = r.json()
        detail = body.get("detail", "")
        assert "Stock insuficiente" in detail, f"Unexpected detail: {detail}"


# --- Tests: Orders - regression non-Talca buzo --------------------------------
class TestConcepcionBuzoOrder:
    SIZE = "8"

    def test_concepcion_buzo_standard_decrement(self, session):
        # Capture before
        data = _get_school(session, "colegio-concepcion")
        pm = _product_map(data)
        buzo = pm["buzo_completo"]
        buzo_id = buzo["id"]
        before_row = next((s for s in buzo["sizes"] if s["size"] == self.SIZE), None)
        assert before_row, "Size row missing"
        if before_row["stock"] < 1:
            pytest.skip("Insufficient stock")
        pant_before = next(s for s in pm["pantalon_buzo"]["sizes"] if s["size"] == self.SIZE)
        pol_before = next(s for s in pm["polera_buzo"]["sizes"] if s["size"] == self.SIZE)

        payload = {
            "customer_name": "TEST_Concepcion",
            "whatsapp": "+56911112222",
            "email": "TEST_concepcion@example.com",
            "delivery_method": "pickup",
            "items": [{
                "product_id": buzo_id,
                "school_name": "Colegio Concepción",
                "product_name": "Buzo Completo",
                "size": self.SIZE,
                "quantity": 1,
                "unit_price": 28990,
            }],
        }
        r = session.post(f"{API}/orders", json=payload)
        assert r.status_code == 200, f"Order failed: {r.text}"
        # After: buzo_completo own stock should decrement; pant and polera unchanged
        data2 = _get_school(session, "colegio-concepcion")
        pm2 = _product_map(data2)
        buzo_after = next(s for s in pm2["buzo_completo"]["sizes"] if s["size"] == self.SIZE)
        pant_after = next(s for s in pm2["pantalon_buzo"]["sizes"] if s["size"] == self.SIZE)
        pol_after = next(s for s in pm2["polera_buzo"]["sizes"] if s["size"] == self.SIZE)
        assert buzo_after["stock"] == before_row["stock"] - 1
        assert pant_after["stock"] == pant_before["stock"], "Concepción pantalon_buzo must NOT decrement"
        assert pol_after["stock"] == pol_before["stock"], "Concepción polera_buzo must NOT decrement"


# --- Tests: New products can be ordered normally ------------------------------
class TestNewTalcaProductsOrder:
    @pytest.mark.parametrize("type_key", ["polera_corta", "polera_larga", "delantal_cotona"])
    def test_new_talca_product_normal_order(self, session, type_key):
        data = _get_school(session, "colegio-talca")
        pm = _product_map(data)
        prod = pm[type_key]
        size = "M" if any(s["size"] == "M" and s["stock"] > 0 for s in prod["sizes"]) else prod["sizes"][0]["size"]
        before_row = next(s for s in prod["sizes"] if s["size"] == size)
        if before_row["stock"] < 1:
            pytest.skip(f"No stock for {type_key}/{size}")
        payload = {
            "customer_name": f"TEST_{type_key}",
            "whatsapp": "+56911112222",
            "email": f"TEST_{type_key}@example.com",
            "delivery_method": "pickup",
            "items": [{
                "product_id": prod["id"],
                "school_name": "Colegio Talca",
                "product_name": prod["name"],
                "size": size,
                "quantity": 1,
                "unit_price": prod["base_price"],
            }],
        }
        r = session.post(f"{API}/orders", json=payload)
        assert r.status_code == 200, f"{type_key} order failed: {r.text}"
        # Verify decrement
        r2 = session.get(f"{API}/products/{prod['id']}")
        after_row = next(s for s in r2.json()["sizes"] if s["size"] == size)
        assert after_row["stock"] == before_row["stock"] - 1


# --- Tests: Admin endpoints ---------------------------------------------------
class TestAdmin:
    def test_admin_products_includes_new_talca(self, admin_session):
        r = admin_session.get(f"{API}/admin/products")
        assert r.status_code == 200
        products = r.json()
        talca = [p for p in products if p.get("school_slug") == "colegio-talca"]
        keys = sorted(p["type_key"] for p in talca)
        assert keys == sorted([
            "buzo_completo", "pantalon_buzo", "polera_buzo",
            "polera_corta", "polera_larga", "polar", "delantal_cotona",
        ])
        buzo = next(p for p in talca if p["type_key"] == "buzo_completo")
        assert buzo.get("dynamic_stock") is True
