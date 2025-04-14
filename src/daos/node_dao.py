from src.daos.sqlalchemy_base_dao import SQLAlchemyBaseDAO
from src.models import Node


class NodeDAO(SQLAlchemyBaseDAO[Node]):
    pass
