USE lifeline_db;

-- Create an initial admin user if not exists
-- The password is 'admin123' hashed with bcrypt
INSERT INTO users (name, email, password, role, is_active)
SELECT 'System Admin', 'admin@lifeline.com', '$2b$10$bm8sQnG9Pfx/KcyrcJIVSebGeJ4GKNGIeTMUK6QizfMEF9UpBISZG', 'admin', 1
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@lifeline.com'
);
