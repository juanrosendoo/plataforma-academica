from sqlalchemy.orm import Session

import models
from security import hash_password


USUARIOS = [
    {"id": "u1", "nome": "Ana Admin", "email": "admin@uni.edu", "tipo": "Admin", "senha": "admin123"},
    {"id": "u2", "nome": "Prof. Carlos Silva", "email": "professor@uni.edu", "tipo": "Professor", "senha": "professor123"},
    {"id": "u3", "nome": "Prof. Marta Souza", "email": "marta@uni.edu", "tipo": "Professor", "senha": "professor123"},
    {"id": "u4", "nome": "Joao Aluno", "email": "aluno@uni.edu", "tipo": "Aluno", "senha": "aluno123"},
    {"id": "u5", "nome": "Maria Estudante", "email": "maria@uni.edu", "tipo": "Aluno", "senha": "aluno123"},
    {"id": "u6", "nome": "Pedro Discente", "email": "pedro@uni.edu", "tipo": "Aluno", "senha": "aluno123"},
]


def seed_auth_data(db: Session) -> None:
    for usuario in USUARIOS:
        existing = db.query(models.Usuario).filter(models.Usuario.id == usuario["id"]).first()
        password_hash = hash_password(usuario["senha"])
        payload = {**usuario, "senha": password_hash}
        if existing:
            existing.nome = payload["nome"]
            existing.email = payload["email"]
            existing.tipo = payload["tipo"]
            if not existing.senha.startswith("pbkdf2_sha256$"):
                existing.senha = password_hash
        else:
            db.add(models.Usuario(**payload))
    db.commit()
