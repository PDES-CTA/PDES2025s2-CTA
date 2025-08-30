-- creaciónd e tabla
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    edad INTEGER NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- datos ejemplo
INSERT INTO usuarios (nombre, email, edad) VALUES 
('Juan Pérez', 'juan@email.com', 25),
('María García', 'maria@email.com', 30),
('Carlos López', 'carlos@email.com', 28),
('Ana Rodríguez', 'ana@email.com', 22),
('Luis Martínez', 'luis@email.com', 35);