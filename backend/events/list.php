List.php
<?php
require 'db.php';

$sql = "SELECT * FROM events ORDER BY event_id DESC";
$result = $conn->query($sql);
?>

<table border="1">
    <tr>
        <th>ID</th>
        <th>Event Name</th>
        <th>Type</th>
        <th>Gender</th>
        <th>Date</th>
        <th>Actions</th>
    </tr>

<?php while ($row = $result->fetch_assoc()) { ?>
    <tr>
        <td><?= $row['event_id'] ?></td>
        <td><?= $row['event_name'] ?></td>
        <td><?= $row['event_type'] ?></td>
        <td><?= $row['gender'] ?></td>
        <td><?= $row['created_at'] ?></td>
        <td>
            <a href="update.php?id=<?= $row['event_id'] ?>">Edit</a> |
            <a href="delete.php?id=<?= $row['event_id'] ?>" onclick="return confirm('Delete this event?')">Delete</a>
        </td>
    </tr>
<?php } ?>

</table>