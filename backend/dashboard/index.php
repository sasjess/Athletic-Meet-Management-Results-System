<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../helpers/functions.php";
require_once __DIR__ . "/../helpers/jwt.php";

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Only GET allowed"]);
    exit;
}

$user = null;
$headers = function_exists('getallheaders') ? getallheaders() : [];
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? null);

if ($authHeader) {
    $token = str_replace("Bearer ", "", $authHeader);
    $user = verifyJWT($token);
}

// Helper: execute a prepared statement and return result rows
function fetchAll($stmt) {
    if (!$stmt) return [];
    $stmt->execute();
    $res = $stmt->get_result();
    $rows = [];
    while ($r = $res->fetch_assoc()) $rows[] = $r;
    $stmt->close();
    return $rows;
}

try {
    // CURRENT MEET (only the ongoing meet) - fetched first since stats depend on it
    $currentMeet = null;
    $stmt = $conn->prepare("SELECT meet_id, year, meet_name, start_date, end_date, status FROM meets WHERE status = 'Ongoing' LIMIT 1");
    $stmt->execute();
    $res = $stmt->get_result();
    if ($row = $res->fetch_assoc()) {
        $currentMeet = $row;
    }
    $stmt->close();

    // STATS (scoped to the ongoing meet)
    $stats = [
        'totalSchools' => 0,
        'totalAthletes' => 0,
        'totalEvents' => 0,
        'totalResults' => 0,
    ];

    if ($currentMeet && isset($currentMeet['meet_id'])) {
        $meetIdForStats = $currentMeet['meet_id'];

        // Total events assigned to the ongoing meet
        $stmt = $conn->prepare("SELECT COUNT(DISTINCT me.event_id) as total FROM meet_events me WHERE me.meet_id = ?");
        $stmt->bind_param('i', $meetIdForStats);
        $stmt->execute();
        $stmt->bind_result($total);
        $stmt->fetch();
        $stats['totalEvents'] = (int)$total;
        $stmt->close();

        // Total distinct athletes entered in events belonging to the ongoing meet
        $stmt = $conn->prepare("
            SELECT COUNT(DISTINCT ae.bib_no) as total
            FROM athlete_event ae
            JOIN meet_events me ON ae.event_id = me.event_id
            WHERE me.meet_id = ?
        ");
        $stmt->bind_param('i', $meetIdForStats);
        $stmt->execute();
        $stmt->bind_result($total);
        $stmt->fetch();
        $stats['totalAthletes'] = (int)$total;
        $stmt->close();

        // Total distinct schools with athletes entered in the ongoing meet
        $stmt = $conn->prepare("
            SELECT COUNT(DISTINCT a.school_id) as total
            FROM athlete_event ae
            JOIN meet_events me ON ae.event_id = me.event_id
            JOIN athletes a ON ae.bib_no = a.bib_no
            WHERE me.meet_id = ? AND a.school_id IS NOT NULL
        ");
        $stmt->bind_param('i', $meetIdForStats);
        $stmt->execute();
        $stmt->bind_result($total);
        $stmt->fetch();
        $stats['totalSchools'] = (int)$total;
        $stmt->close();

        // Total results recorded for the ongoing meet
        $stmt = $conn->prepare("SELECT COUNT(*) as total FROM results r WHERE r.meet_id = ?");
        $stmt->bind_param('i', $meetIdForStats);
        $stmt->execute();
        $stmt->bind_result($total);
        $stmt->fetch();
        $stats['totalResults'] = (int)$total;
        $stmt->close();
    }

    // UPCOMING EVENTS for the ongoing meet (if any)
    $upcomingEvents = [];
    if ($currentMeet && isset($currentMeet['meet_id'])) {
        $sql = "SELECT me.event_id, e.event_name, e.event_type, GROUP_CONCAT(DISTINCT g.name) as genders, GROUP_CONCAT(DISTINCT s.stage_name) as stages
                FROM meet_events me
                JOIN events e ON me.event_id = e.event_id
                LEFT JOIN gender_events ge ON e.event_id = ge.event_id
                LEFT JOIN gender g ON ge.gender_id = g.gender_id
                LEFT JOIN event_stages es ON e.event_id = es.event_id
                LEFT JOIN stages s ON es.stage_id = s.stage_id
                WHERE me.meet_id = ?
                GROUP BY me.event_id, e.event_name, e.event_type
                ORDER BY e.event_name ASC";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $currentMeet['meet_id']);
        $upcomingEvents = fetchAll($stmt);
    }

    // RECENT RESULTS (ONGOING MEET ONLY)
    $recentResults = [];
    if ($currentMeet && isset($currentMeet['meet_id'])) {
        $sql = "SELECT r.id, r.bib_no, a.name AS athlete_name, s.school_name, r.event_id, e.event_name, r.performance_time, r.performance_distance, r.points, r.position, r.created_at
                FROM results r
                JOIN athletes a ON r.bib_no = a.bib_no
                LEFT JOIN schools s ON a.school_id = s.school_id
                LEFT JOIN events e ON r.event_id = e.event_id
                WHERE r.meet_id = ?
                ORDER BY r.created_at DESC
                LIMIT 10";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $currentMeet['meet_id']);
        $recentResults = fetchAll($stmt);
    }

    // PAST MEETS
    $sql = "SELECT meet_id, year, meet_name, start_date, end_date, status
            FROM meets
            WHERE status = 'Completed'
            ORDER BY end_date DESC
            LIMIT 5";
    $stmt = $conn->prepare($sql);
    $pastMeets = fetchAll($stmt);

    // TOP ATHLETES (top 10 by total points, ONGOING MEET ONLY)
    $topAthletes = [];
    if ($currentMeet && isset($currentMeet['meet_id'])) {
        $sql = "SELECT a.bib_no, a.name AS athlete_name, s.school_name, COALESCE(SUM(r.points),0) AS total_points
                FROM results r
                JOIN athletes a ON r.bib_no = a.bib_no
                LEFT JOIN schools s ON a.school_id = s.school_id
                WHERE r.meet_id = ?
                GROUP BY a.bib_no
                ORDER BY total_points DESC
                LIMIT 10";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $currentMeet['meet_id']);
        $topAthletes = fetchAll($stmt);
    }

    // TOP SCHOOLS (overall and by gender, ONGOING MEET ONLY)
    $topSchoolsOverall = [];
    $rowsByGender = [];

    if ($currentMeet && isset($currentMeet['meet_id'])) {
        $sqlOverall = "SELECT s.school_id, s.school_name, COALESCE(SUM(r.points),0) AS total_points
                       FROM results r
                       JOIN athletes a ON r.bib_no = a.bib_no
                       JOIN schools s ON a.school_id = s.school_id
                       WHERE r.meet_id = ?
                       GROUP BY s.school_id
                       ORDER BY total_points DESC
                       LIMIT 10";
        $stmt = $conn->prepare($sqlOverall);
        $stmt->bind_param('i', $currentMeet['meet_id']);
        $topSchoolsOverall = fetchAll($stmt);

        $sqlByGender = "SELECT s.school_id, s.school_name, s.gender_id, g.name AS gender_name, COALESCE(SUM(r.points),0) AS total_points
                        FROM results r
                        JOIN athletes a ON r.bib_no = a.bib_no
                        JOIN schools s ON a.school_id = s.school_id
                        LEFT JOIN gender g ON s.gender_id = g.gender_id
                        WHERE r.meet_id = ?
                        GROUP BY s.school_id, s.gender_id
                        ORDER BY total_points DESC";
        $stmt = $conn->prepare($sqlByGender);
        $stmt->bind_param('i', $currentMeet['meet_id']);
        $rowsByGender = fetchAll($stmt);
    }

    // Organize by gender map
    $topSchoolsByGender = [];
    foreach ($rowsByGender as $r) {
        $gender = $r['gender_name'] ?? $r['gender_id'];
        if (!isset($topSchoolsByGender[$gender])) $topSchoolsByGender[$gender] = [];
        $topSchoolsByGender[$gender][] = [
            'school_id' => (int)$r['school_id'],
            'school_name' => $r['school_name'],
            'total_points' => (float)$r['total_points']
        ];
    }

    // Final response structure
    $response = [
        'status' => 'success',
        'data' => [
            'stats' => $stats,
            'topSchools' => [
                'overall' => $topSchoolsOverall,
                'byGender' => $topSchoolsByGender
            ],
            'topAthletes' => $topAthletes,
            'recentResults' => $recentResults,
            'pastMeets' => $pastMeets,
            'upcomingEvents' => $upcomingEvents,
            'currentMeet' => $currentMeet
        ]
    ];

    echo json_encode($response);

} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $ex->getMessage()]);
}

?>