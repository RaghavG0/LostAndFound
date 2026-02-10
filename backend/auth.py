from google.oauth2 import id_token
from google.auth.transport import requests as grequests
import os

def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            grequests.Request(),
            os.getenv("GOOGLE_CLIENT_ID")
        )
        if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            return None
        return {
            "email": idinfo["email"],
            "name": idinfo.get("name", "")
        }
    except Exception:
        return None
