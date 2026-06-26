from pydantic import BaseModel


class SignupRequest(BaseModel):
    username: str
    name: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    name: str
