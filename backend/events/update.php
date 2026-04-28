<?php
require 'db.php';

$id = $_GET['id'] ?? null;

// FETCH DATA FOR FORM
if ($id) {
    $stmt = $conn->prepare("SELECT * FROM events WHERE event_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $event = $result->fetch_assoc();
}

// UPDATE DATA
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $id = $_POST['event_id'];
    $name = $_POST['event_name'];
    $type = $_POST['event_type'];
    $gender = $_POST['gender'];

    $stmt = $conn->prepare("UPDATE events SET event_name=?, event_type=?, gender=? WHERE event_id=?");
    $stmt->bind_param("sssi", $name, $type, $gender, $id);

    if ($stmt->execute()) {
        echo "Updated successfully";
    } else {
        echo "Error updating";
    }
}
?>

<!-- SIMPLE FORM -->
<form method="POST">
    <input type="hidden" name="event_id" value="<?= $event['event_id'] ?? '' ?>">

    <input type="text" name="event_name" value="<?= $event['event_name'] ?? '' ?>" required>

    <select name="event_type">
        <option value="Track" <?= ($event['event_type'] ?? '') == 'Track' ? 'selected' : '' ?>>Track</option>
        <option value="Field" <?= ($event['event_type'] ?? '') == 'Field' ? 'selected' : '' ?>>Field</option>
    </select>

    <select name="gender">
        <option value="Male" <?= ($event['gender'] ?? '') == 'Male' ? 'selected' : '' ?>>Male</option>
        <option value="Female" <?= ($event['gender'] ?? '') == 'Female' ? 'selected' : '' ?>>Female</option>
        <option value="Mixed" <?= ($event['gender'] ?? '') == 'Mixed' ? 'selected' : '' ?>>Mixed</option>
    </select>

    <button type="submit">Update</button>
</form>
