from sqlalchemy import Column, Integer, String, Float, Date

from app.core.database import Base


class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, nullable=False)
    trade_type = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    market = Column(String, nullable=False, server_default="NASDAQ")
    trade_date = Column(Date, nullable=True)