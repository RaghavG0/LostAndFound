from dotenv import load_dotenv
load_dotenv()

import os
import shutil
import uuid
from datetime import date
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from db import get_db
from auth import verify_google_token


app = FastAPI()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://lost-and-found-bits.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# REQUEST MODELS
# ==========================

class GoogleLoginRequest(BaseModel):
    id_token: str


class ClaimRequest(BaseModel):
    item_id: int
    user_id: int
    id_number: str
    room_number: str
    phone_number: str


# ==========================
# AUTH
# ==========================

@app.post("/api/auth/google")
def google_login(payload: GoogleLoginRequest):

    user = verify_google_token(payload.id_token)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    if not user["email"].endswith("@hyderabad.bits-pilani.ac.in"):
        raise HTTPException(status_code=403, detail="BITS email required")

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute('SELECT user_id FROM "USER" WHERE email=%s', (user["email"],))
        row = cur.fetchone()

        if row:
            user_id = row[0]
        else:
            cur.execute("""
                INSERT INTO "USER" (name, email, bits_id)
                VALUES (%s, %s, %s)
                RETURNING user_id
            """, (user["name"], user["email"], user["email"].split('@')[0]))
            user_id = cur.fetchone()[0]
            conn.commit()

        return {"user_id": user_id, "email": user["email"]}

    finally:
        cur.close()
        conn.close()


# ==========================
# ADD ITEM (REPORT)
# ==========================

@app.post("/api/items")
def add_item(
    item_name: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    date_found: date = Form(...),
    category_id: int = Form(...),
    user_id: int = Form(...),
    image: UploadFile = File(None),
    phone_number: str = Form(...),
    room_number: str = Form(...)
):
    filename = None

    if image:
        if image.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(400, "Only JPG and PNG allowed")

        extension = image.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE "USER"
            SET phone_number=%s,
                room_number=%s
            WHERE user_id=%s
            """, (phone_number, room_number, user_id))
        cur.execute("""
            INSERT INTO ITEM
            (item_name, description, location_found, date_found,
             image_url, uploaded_by, current_holder, holder_phone, holder_room, category_id)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            item_name,
            description,
            location,
            date_found,
            f"/uploads/{filename}" if filename else None,
            user_id,
            user_id,
            phone_number,
            room_number,
            category_id
        ))

        conn.commit()
        return {"status": "Item added"}

    finally:
        cur.close()
        conn.close()


# ==========================
# GET ITEMS (WITH REPORTER DETAILS)
# ==========================

@app.get("/api/items")
def get_items(
    category: str | None = None,
    days: int | None = None,
    location: str | None = None,
    search: str | None = None
):
    query = """
        SELECT 
            I.item_id,
            I.item_name,
            I.description,
            I.location_found,
            I.date_found,
            I.image_url,
            C.category_name,
            U.name,
            I.holder_phone,
            I.holder_room
        FROM ITEM I
        JOIN CATEGORY C ON I.category_id = C.category_id
        JOIN "USER" U ON I.current_holder = U.user_id
        WHERE I.status='FOUND'
    """

    params = []

    if category:
        query += " AND C.category_name=%s"
        params.append(category)

    if days:
        query += " AND I.date_found >= CURRENT_DATE - INTERVAL %s"
        params.append(f"{days} days")

    if location:
        query += " AND LOWER(I.location_found) LIKE LOWER(%s)"
        params.append(f"%{location}%")

    if search:
        query += " AND LOWER(I.item_name) LIKE LOWER(%s)"
        params.append(f"%{search}%")

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(query, tuple(params))
        rows = cur.fetchall()

        return [
            {
                "item_id": r[0],
                "item_name": r[1],
                "description": r[2],
                "location_found": r[3],
                "date_found": r[4],
                "image_url": r[5],
                "category_name": r[6],
                "reporter_name": r[7],
                "reporter_phone": r[8],
                "reporter_room": r[9],
            }
            for r in rows
        ]
    finally:
        cur.close()
        conn.close()


# ==========================
# CLAIM ITEM
# ==========================

@app.post("/api/claim")
def claim_item(data: ClaimRequest):

    conn = get_db()
    conn.autocommit = False
    cur = conn.cursor()

    try:
        cur.execute("SELECT status FROM ITEM WHERE item_id=%s", (data.item_id,))
        status = cur.fetchone()

        if not status or status[0] != "FOUND":
            raise HTTPException(400, "Item not available")

        cur.execute("""
            INSERT INTO CLAIM (item_id, claimed_by, room_number, phone_number)
            VALUES (%s,%s,%s,%s)
            RETURNING claim_id
        """, (
            data.item_id,
            data.user_id,
            data.room_number,
            data.phone_number
        ))

        claim_id = cur.fetchone()[0]

        cur.execute("""
            INSERT INTO CLAIMANT_ID_DETAILS (claim_id, id_number)
            VALUES (%s,%s)
        """, (claim_id, data.id_number))

        cur.execute("""
            UPDATE ITEM
            SET status='CLAIMED',
                current_holder=%s,
                holder_phone=%s,
                holder_room=%s
            WHERE item_id=%s
        """, (data.user_id, data.phone_number, data.room_number, data.item_id))

        conn.commit()
        return {"status": "Item claimed"}

    except:
        conn.rollback()
        raise

    finally:
        cur.close()
        conn.close()


# ==========================
# ALL CLAIMS PAGE
# ==========================

@app.get("/api/claims")
def get_all_claims():

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT 
                C.claim_id,
                I.item_id,
                I.item_name,
                I.image_url,
                U.name,
                D.id_number,
                C.room_number,
                C.phone_number,
                C.claim_date
            FROM CLAIM C
            JOIN ITEM I ON C.item_id = I.item_id
            JOIN "USER" U ON C.claimed_by = U.user_id
            LEFT JOIN CLAIMANT_ID_DETAILS D 
                ON D.claim_id = C.claim_id
            ORDER BY C.claim_date DESC
        """)

        rows = cur.fetchall()

        return [
            {
                "claim_id": r[0],
                "item_id": r[1],
                "item_name": r[2],
                "image_url": r[3],
                "name": r[4],
                "id_number": r[5],
                "room_number": r[6],
                "phone_number": r[7],
                "claim_date": r[8],
            }
            for r in rows
        ]
    finally:
        cur.close()
        conn.close()


# ==========================
# MY CLAIMS PAGE
# ==========================

@app.get("/api/claims/my/{user_id}")
def get_my_claims(user_id: int):

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT 
                C.claim_id,
                I.item_id,
                I.item_name,
                I.image_url,
                C.claim_date,
                C.phone_number,
                C.room_number
            FROM CLAIM C
            JOIN ITEM I ON C.item_id = I.item_id
            WHERE C.claimed_by=%s
            ORDER BY C.claim_date DESC
        """, (user_id,))

        rows = cur.fetchall()

        return [
            {
                "claim_id": r[0],
                "item_id": r[1],
                "item_name": r[2],
                "image_url": r[3],
                "claim_date": r[4],
                "phone_number": r[5],
                "room_number": r[6],
            }
            for r in rows
        ]
    finally:
        cur.close()
        conn.close()


# ==========================
# REMOVE CLAIM
# ==========================

@app.delete("/api/claims/{claim_id}")
def remove_claim(claim_id: int):

    conn = get_db()
    conn.autocommit = False
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT item_id, claimed_by, phone_number, room_number
            FROM CLAIM
            WHERE claim_id=%s
        """, (claim_id,))
        row = cur.fetchone()

        if not row:
            raise HTTPException(404, "Claim not found")

        item_id, claimed_by, claim_phone, claim_room = row

        cur.execute("""
            UPDATE ITEM
            SET status='FOUND',
                current_holder=%s,
                holder_phone=%s,
                holder_room=%s
            WHERE item_id=%s
        """, (
            claimed_by,
            claim_phone,
            claim_room,
            item_id
        ))

        cur.execute("DELETE FROM CLAIM WHERE claim_id=%s", (claim_id,))

        conn.commit()
        return {"status": "Claim removed"}

    except:
        conn.rollback()
        raise

    finally:
        cur.close()
        conn.close()

