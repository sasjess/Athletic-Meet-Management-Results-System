<?php
// backend/auth/auth_model.php
// ─────────────────────────────────────────────────────────────────────────────
// Data layer — all DB queries for authentication.
// No HTTP logic. No echo. No header(). Only database operations.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/../config/db.php';

class AuthModel {

    private PDO $pdo;

    public function __construct() {
        $this->pdo = getDBConnection();
    }

    // ── Find user by username (used by login.php and signup.php) ─────────────
    // NEVER add WHERE password = ? here — verify in PHP with password_verify()
    public function findUserByUsername(string $username): ?array {
        $stmt = $this->pdo->prepare(
            "SELECT id, username, password, full_name, email, role, is_active
             FROM   users
             WHERE  username = :username
             LIMIT  1"
        );
        $stmt->execute([':username' => $username]);
        return $stmt->fetch() ?: null;
    }

    // ── Find user by ID (reload session data) ────────────────────────────────
    public function findUserById(int $id): ?array {
        $stmt = $this->pdo->prepare(
            "SELECT id, username, full_name, email, role, is_active
             FROM   users
             WHERE  id = :id
             LIMIT  1"
        );
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    // ── Create a new user (used by signup.php) ────────────────────────────────
    // Returns the new user's ID on success, null on failure.
    // $hashedPassword must already be hashed with password_hash() before calling this.
    // $role defaults to 'viewer' — an admin promotes users manually.
    public function createUser(
        string $username,
        string $hashedPassword,
        string $fullName,
        string $role = 'viewer',
        ?string $email = null
    ): ?int {
        try {
            $stmt = $this->pdo->prepare(
                "INSERT INTO users (username, password, full_name, email, role, is_active)
                 VALUES (:username, :password, :full_name, :email, :role, 1)"
            );
            $stmt->execute([
                ':username'  => $username,
                ':password'  => $hashedPassword,
                ':full_name' => $fullName,
                ':email'     => $email,
                ':role'      => $role,
            ]);
            return (int) $this->pdo->lastInsertId();
        } catch (PDOException $e) {
            // Duplicate username (unique key violation) → return null
            return null;
        }
    }

    // ── Stamp last_login timestamp on every successful login ─────────────────
    public function recordLogin(int $userId): void {
        $this->pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = :id")
                  ->execute([':id' => $userId]);
    }

    // ── Upgrade password hash cost transparently ──────────────────────────────
    public function updatePasswordHash(int $userId, string $newHash): void {
        $this->pdo->prepare("UPDATE users SET password = :password WHERE id = :id")
                  ->execute([':password' => $newHash, ':id' => $userId]);
    }
}