from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, timedelta
from db import get_db
from auth import verify_google_token

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later if needed
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- AUTH ----------
@app.post("/api/auth/google")
def google_login(id_token: str = Body(..., embed=True)):
    user = verify_google_token(id_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    if not user["email"].endswith("@hyderabad.bits-pilani.ac.in"):
        raise HTTPException(status_code=403, detail="BITS email required")

    conn = get_db()
    cur = conn.cursor()

    cur.execute('SELECT user_id FROM "USER" WHERE email=%s', (user["email"],))
    row = cur.fetchone()

    if row:
        user_id = row[0]
    else:
        cur.execute("""
            INSERT INTO "USER" (name, email, bits_id, login_timestamp)
            VALUES (%s, %s, %s, NOW())
            RETURNING user_id
        """, (user["name"], user["email"], user["email"].split('@')[0]))
        user_id = cur.fetchone()[0]
        conn.commit()

    cur.close()
    conn.close()
    return {"user_id": user_id, "email": user["email"]}

# ---------- ADD ITEM ----------
@app.post("/api/items")
def add_item(item_name: str, description: str, location: str,
             date_found: date, image_url: str,
             category_id: int, user_id: int):
    
    item_name = item_name.strip('"')
    description = description.strip('"')
    location = location.strip('"')
    image_url = image_url.strip('"')

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "SELECT 1 FROM CATEGORY WHERE category_id=%s",
        (category_id,)
    )
    if not cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(400, "Invalid category")

    cur.execute("""
        INSERT INTO ITEM
        (item_name, description, location_found, date_found,
         image_url, status, uploaded_by, category_id)
        VALUES (%s,%s,%s,%s,%s,'FOUND',%s,%s)
    """, (item_name, description, location, date_found,
          image_url, user_id, category_id))

    conn.commit()
    cur.close()
    conn.close()
    return {"status": "Item added"}

# ---------- GET ITEMS WITH FILTERS ----------
@app.get("/api/items")
def get_items(
    category: str | None = None,
    days: int | None = None,
    location: str | None = None,
    search: str | None = None
):
    query = """
        SELECT I.item_id, I.item_name, I.location_found, I.date_found,
               I.image_url, C.category_name
        FROM ITEM I
        JOIN CATEGORY C ON I.category_id = C.category_id
        WHERE I.status='FOUND'
    """
    params = []

    if category:
        query += " AND C.category_name=%s"
        params.append(category)

    if days:
        query += " AND I.date_found >= %s"
        params.append(date.today() - timedelta(days=days))

    if location:
        query += " AND LOWER(I.location_found) LIKE LOWER(%s)"
        params.append(f"%{location}%")

    if search:
        query += " AND LOWER(I.item_name) LIKE LOWER(%s)"
        params.append(f"%{search}%")

    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return rows

# ---------- CLAIM ITEM ----------
@app.post("/api/claim")
def claim_item(item_id: int, user_id: int):
    conn = get_db()
    conn.autocommit = False
    cur = conn.cursor()

    cur.execute(
        "SELECT status FROM ITEM WHERE item_id=%s",
        (item_id,)
    )
    status = cur.fetchone()

    if not status or status[0] != "FOUND":
        raise HTTPException(status_code=400, detail="Item not available for claim")
    
    cur.execute(
        'SELECT user_id FROM "USER" WHERE user_id=%s',
        (user_id,)
    )
    if not cur.fetchone():
        raise HTTPException(400, "Invalid user")


    cur.execute("""
        INSERT INTO CLAIM (item_id, claimed_by, claim_date, expiry_date)
        VALUES (%s,%s,CURRENT_DATE,CURRENT_DATE + INTERVAL '7 day')
    """, (item_id, user_id))

    cur.execute("""
        UPDATE ITEM SET status='CLAIMED' WHERE item_id=%s
    """, (item_id,))

    conn.commit()
    cur.close()
    conn.close()
    return {"status": "Item claimed"}

# ---------- ACTIVE CLAIMS ----------
@app.get("/api/claims/active")
def active_claims():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT I.item_name, U.name, D.id_type, D.id_number, C.expiry_date
        FROM CLAIM C
        JOIN ITEM I ON C.item_id = I.item_id
        JOIN "USER" U ON C.claimed_by = U.user_id
        LEFT JOIN CLAIMANT_ID_DETAILS D ON C.item_id = D.claim_id
        WHERE CURRENT_DATE <= C.expiry_date
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows
