from src.daos.sqlalchemy_base_dao import SQLAlchemyBaseDAO
from src.models import Camera


class CameraDAO(SQLAlchemyBaseDAO[Camera]):
    pass
