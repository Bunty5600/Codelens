import os
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions
from api.database import get_db
from api.models import user as user_model

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
if not CLERK_SECRET_KEY:
    raise RuntimeError(
        "CLERK_SECRET_KEY environment variable is not set. "
        "Add it to your .env file (Clerk dashboard -> API Keys) before starting the server."
    )

clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)

# Only accept tokens minted for these frontend origins. Reuses the same
# env var main.py uses for CORS so there's a single source of truth.
AUTHORIZED_PARTIES = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if o.strip()
]


def _get_or_create_local_user(db: Session, clerk_user_id: str) -> user_model.User:
    db_user = (
        db.query(user_model.User)
        .filter(user_model.User.clerk_id == clerk_user_id)
        .first()
    )
    if db_user:
        return db_user

    # First request we've seen from this Clerk user - provision a local row
    # so Analysis.user_id has an integer PK to point at. Email/name are
    # fetched via the Clerk API since the session token itself doesn't
    # always carry them.
    email, name = None, None
    try:
        clerk_user = clerk.users.get(user_id=clerk_user_id)
        if clerk_user.email_addresses:
            email = clerk_user.email_addresses[0].email_address
        name = " ".join(filter(None, [clerk_user.first_name, clerk_user.last_name])) or None
    except Exception:
        # Non-fatal: we can still create the local row and backfill
        # email/name later; auth itself already succeeded.
        pass

    db_user = user_model.User(clerk_id=clerk_user_id, email=email, name=name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_current_user(request: Request, db: Session = Depends(get_db)) -> user_model.User:
    """
    FastAPI dependency. Verifies the Clerk session token on the incoming
    request and returns the matching local User row.
    """
    try:
        request_state = clerk.authenticate_request(
            request,
            AuthenticateRequestOptions(authorized_parties=AUTHORIZED_PARTIES),
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Could not verify authentication token")

    if not getattr(request_state, "is_signed_in", False):
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verified against clerk-backend-api 6.0.1: RequestState.payload is the
    # decoded JWT claims dict, and "sub" is the Clerk user ID.
    payload = getattr(request_state, "payload", None) or {}
    clerk_user_id = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=401, detail="Invalid session token")

    return _get_or_create_local_user(db, clerk_user_id)
