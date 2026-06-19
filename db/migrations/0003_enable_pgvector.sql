-- Habilita la extensión pgvector (tipo `vector` para embeddings).
-- Requiere una imagen de Postgres con pgvector instalado
-- (docker-compose usa pgvector/pgvector:pg16).
CREATE EXTENSION IF NOT EXISTS vector;
