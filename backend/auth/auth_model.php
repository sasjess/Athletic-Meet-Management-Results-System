<?php
// backend/auth/auth_model.php
// ─────────────────────────────────────────────────────────────────────────────
// Data layer — all DB queries related to authentication.
// Zero HTTP logic here. Only talk to the database.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/../config/db.php';

class AuthModel {

    private PDO $pdo;

    public function __construct() {
        $this->pdo = getDBConnection();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Find a user row by username.
    //
    // Returns the full DB row as an array, or null if not found.
    // IMPORTANT: NEVER add a WHERE password = ? clause here.
    //            Password verification must happen in PHP via password_verify(),
    //            not inside the SQL query.
    // ─────────────────────────────────────────────────────────────────────────
    public function findUserByUsername(string $username): ?array {
        $stmt = $this->pdo->prepare(
            "SELECT id,
                    username,
                    password,
                    full_name,
                    email,
                    role,
                    is_active
             FROM   users
             WHERE  username = :username
             LIMIT  1"
        );

        $stmt->execute([':username' => $username]);
        $row = $stmt->fetch();

        return $row ?: null;    // return null instead of false when not found
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Find a user row by primary key.
    // Used to reload fresh user data into the session if needed.
    // ─────────────────────────────────────────────────────────────────────────
    public function findUserById(int $id): ?array {
        $stmt = $this->pdo->prepare(
            "SELECT id,
                    username,
                    full_name,
                    email,
                    role,
                    is_active
             FROM   users
             WHERE  id = :id
             LIMIT  1"
        );

        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return $row ?: null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Stamp the last_login timestamp on every successful login.
    // Useful for audit trails and "last seen" displays.
    // ─────────────────────────────────────────────────────────────────────────
    public function recordLogin(int $userId): void {
        $stmt = $this->pdo->prepare(
            "UPDATE users
             SET    last_login = NOW()
             WHERE  id = :id"
        );
        $stmt->execute([':id' => $userId]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Re-hash the password transparently when the bcrypt cost has been raised.
    // Called from login.php when password_needs_rehash() returns true.
    // ─────────────────────────────────────────────────────────────────────────
    public function updatePasswordHash(int $userId, string $newHash): void {
        $stmt = $this->pdo->prepare(
            "UPDATE users
             SET    password = :password
             WHERE  id = :id"
        );
        $stmt->execute([
            ':password' => $newHash,
            ':id'       => $userId,
        ]);
    }
}