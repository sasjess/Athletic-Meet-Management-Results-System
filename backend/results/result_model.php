<?php
require_once("../config/db.php");

class ResultModel {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Check athlete exists
    private function athleteExists($athlete_id) {
        $stmt = $this->conn->prepare("SELECT id FROM athletes WHERE id = ?");
        $stmt->execute([$athlete_id]);
        return $stmt->rowCount() > 0;
    }

    // Check event exists
    private function eventExists($event_id) {
        $stmt = $this->conn->prepare("SELECT id FROM events WHERE id = ?");
        $stmt->execute([$event_id]);
        return $stmt->rowCount() > 0;
    }

    // Prevent duplicate (same athlete + event)
    private function isDuplicate($athlete_id, $event_id) {
        $stmt = $this->conn->prepare(
            "SELECT id FROM results WHERE athlete_id = ? AND event_id = ?"
        );
        $stmt->execute([$athlete_id, $event_id]);
        return $stmt->rowCount() > 0;
    }

    // Points calculation
    private function calculatePoints($position) {
        switch ($position) {
            case 1: return 10;
            case 2: return 7;
            case 3: return 5;
            default: return 0;
        }
    }

    // Validate input
    private function validate($data) {
        if (!is_numeric($data['position']) || $data['position'] <= 0) {
            return "Invalid position";
        }
        if (!is_numeric($data['score']) && !empty($data['score'])) {
            return "Invalid score";
        }
        if (!empty($data['time']) && !preg_match("/^\d+(\.\d+)?$/", $data['time'])) {
            return "Invalid time format";
        }
        return null;
    }

    // CREATE
    public function create($data) {
        if (!$this->athleteExists($data['athlete_id'])) {
            return ["error" => "Athlete not found"];
        }

        if (!$this->eventExists($data['event_id'])) {
            return ["error" => "Event not found"];
        }

        if ($this->isDuplicate($data['athlete_id'], $data['event_id'])) {
            return ["error" => "Duplicate result entry"];
        }

        $validationError = $this->validate($data);
        if ($validationError) {
            return ["error" => $validationError];
        }

        $points = $this->calculatePoints($data['position']);

        $stmt = $this->conn->prepare("
            INSERT INTO results 
            (athlete_id, event_id, meet_id, position, time, score, points)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        $success = $stmt->execute([
            $data['athlete_id'],
            $data['event_id'],
            $data['meet_id'],
            $data['position'],
            $data['time'],
            $data['score'],
            $points
        ]);

        return $success
            ? ["success" => true, "message" => "Result created"]
            : ["error" => "Failed to create result"];
    }

    // UPDATE
    public function update($id, $data) {
        $validationError = $this->validate($data);
        if ($validationError) {
            return ["error" => $validationError];
        }

        $points = $this->calculatePoints($data['position']);

        $stmt = $this->conn->prepare("
            UPDATE results
            SET position=?, time=?, score=?, points=?
            WHERE id=?
        ");

        $success = $stmt->execute([
            $data['position'],
            $data['time'],
            $data['score'],
            $points,
            $id
        ]);

        return $success
            ? ["success" => true, "message" => "Result updated"]
            : ["error" => "Update failed"];
    }

    // LIST
    public function getAll() {
        $stmt = $this->conn->prepare("
            SELECT r.*, a.name as athlete_name, e.name as event_name
            FROM results r
            JOIN athletes a ON r.athlete_id = a.id
            JOIN events e ON r.event_id = e.id
        ");
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}