from sqlalchemy import Column , Integer , String , Float

from app.core.database import Base


class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)

    ticker = Column(String, nullable=False) # 주식 번호

    trade_type = Column(String, nullable=False)

    quantity = Column(Integer, nullable=False) # 수량

    price = Column(Float, nullable=False)