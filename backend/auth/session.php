<?php
// backend/auth/session.php
// ─────────────────────────────────────────────────────────────────────────────
// Central session manager.
//
// Rules:
//   • Never read or write $_SESSION directly in any other file.
//     All session access goes through this class.
//   • Call SessionManager::start() at the top of every endpoint that
//     needs authentication — even before reading $_POST or php://input.
// ─────────────────────────────────────────────────────────────────────────────

class SessionManager {

    // ─────────────────────────────────────────────────────────────────────────
    // Boot a hardened PHP session.
    // Safe to call multiple times — skips if already active.
    // ─────────────────────────────────────────────────────────────────────────
    public static function start(): void {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        // Harden the session cookie before session_start()
        session_set_cookie_params([
            'lifetime' => 0,          // Deleted when browser closes
            'path'     => '/',
            'domain'   => '',         // Current domain only
            'secure'   => false,      // Set TRUE in production (HTTPS)
            'httponly' => true,       // JS cannot read cookie → blocks XSS theft
            'samesite' => 'Strict',   // Browser won't send cookie on cross-site requests → blocks CSRF
        ]);

        // Custom name hides the default "PHPSESSID" fingerprint
        session_name('ATHLETIC_SESS');
        session_start();

        // Regenerate session ID the very first time this session is created.
        // Prevents session fixation: attacker cannot pre-set an ID they know.
        if (empty($_SESSION['_initiated'])) {
            session_regenerate_id(true);
            $_SESSION['_initiated'] = true;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Write user data into the session after a successful login.
    // Regenerates the session ID to prevent session fixation on privilege gain.
    // ─────────────────────────────────────────────────────────────────────────
    public static function setUser(array $user): void {
        // New ID on every elevation of privilege (login)
        session_regenerate_id(true);

        $_SESSION['user_id']     = (int) $user['id'];
        $_SESSION['username']    = $user['username'];
        $_SESSION['full_name']   = $user['full_name'];
        $_SESSION['role']        = $user['role'];
        $_SESSION['logged_in']   = true;
        $_SESSION['login_time']  = time();
        $_SESSION['last_active'] = time();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Returns true only when:
    //   1. A logged_in flag exists in the session, AND
    //   2. The session has not been idle for more than IDLE_TIMEOUT seconds.
    //
    // Destroys the session automatically on timeout.
    // ─────────────────────────────────────────────────────────────────────────
    public static function isLoggedIn(): bool {
        if (empty($_SESSION['logged_in'])) {
            return false;
        }

        $idleTimeout = 30 * 60; // 30 minutes

        if ((time() - ($_SESSION['last_active'] ?? 0)) > $idleTimeout) {
            self::destroy();
            return false;
        }

        // Refresh the idle clock on every validated request
        $_SESSION['last_active'] = time();
        return true;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Getters — read individual session values safely.
    // Always return null instead of throwing if the key is missing.
    // ─────────────────────────────────────────────────────────────────────────
    public static function getUserId(): ?int {
        return isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
    }

    public static function getUsername(): ?string {
        return $_SESSION['username'] ?? null;
    }

    public static function getFullName(): ?string {
        return $_SESSION['full_name'] ?? null;
    }

    public static function getRole(): ?string {
        return $_SESSION['role'] ?? null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Return all safe user fields as one array.
    // Never include password hash here.
    // ─────────────────────────────────────────────────────────────────────────
    public static function getUserData(): array {
        return [
            'id'        => self::getUserId(),
            'username'  => self::getUsername(),
            'full_name' => self::getFullName(),
            'role'      => self::getRole(),
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Fully destroy the session: wipe server-side data AND browser cookie.
    // Call this on logout and on idle timeout.
    // ─────────────────────────────────────────────────────────────────────────
    public static function destroy(): void {
        // 1. Wipe all session variables
        $_SESSION = [];

        // 2. Delete the cookie from the browser by expiring it in the past
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $p['path'],
                $p['domain'],
                $p['secure'],
                $p['httponly']
            );
        }

        // 3. Destroy the server-side session file
        session_destroy();
    }
}