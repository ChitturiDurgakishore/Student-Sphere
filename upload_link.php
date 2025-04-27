<?php
// Database Connection
$servername = "sql12.freesqldatabase.com";
$username = "sql12775674";
$password = "KVs9aS426Z";
$database = "sql12775674";

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

// Retrieve POST data
$data = json_decode(file_get_contents("php://input"), true);

$subject = $data['subject'];
$uploadDate = $data['uploadDate'];
$link = $data['link'];
$uploadedBy = $data['uploadedBy'];

// Prepare SQL
$sql = "INSERT INTO File_links (Subject, UploadDate, Link, UploadedBy) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $subject, $uploadDate, $link, $uploadedBy);

// Execute Query
if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "File metadata stored successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to store file metadata: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
