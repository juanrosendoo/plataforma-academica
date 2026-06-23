from sqlalchemy.orm import Session

import models


USUARIOS = [
    {"id": "u1", "nome": "Ana Admin", "email": "admin@uni.edu", "tipo": "Admin"},
    {"id": "u2", "nome": "Prof. Carlos Silva", "email": "professor@uni.edu", "tipo": "Professor"},
    {"id": "u3", "nome": "Prof. Marta Souza", "email": "marta@uni.edu", "tipo": "Professor"},
    {"id": "u4", "nome": "Joao Aluno", "email": "aluno@uni.edu", "tipo": "Aluno"},
    {"id": "u5", "nome": "Maria Estudante", "email": "maria@uni.edu", "tipo": "Aluno"},
    {"id": "u6", "nome": "Pedro Discente", "email": "pedro@uni.edu", "tipo": "Aluno"},
]


def seed_auth_data(db: Session) -> None:
    if db.query(models.Usuario).first():
        return

    for usuario in USUARIOS:
        db.add(models.Usuario(**usuario, senha="senha"))
    db.commit()
