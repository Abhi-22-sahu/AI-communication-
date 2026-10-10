
import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from Backend.database.connection import get_db
from Backend.models.user import User
from Backend.utils.security import JWT_ALGORITHM, JWT_SECRET_KEY

logger = logging.getLogger(__name__)

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        user_id = int(user_id)

    except (JWTError, ValueError, TypeError) as exc:
        logger.warning(
            "JWT validation failed: %s",
            type(exc).__name__,
        )
        raise credentials_exception from exc

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        logger.warning(
            "JWT valid, but user ID %s was not found",
            user_id,
        )
        raise credentials_exception

    return user
