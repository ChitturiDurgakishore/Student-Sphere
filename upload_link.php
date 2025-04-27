<?php
// Connection details
$servername = "sql12.freesqldatabase.com"; // if you're using XAMPP/WAMP on your system
$username = "sql12775674";         // default username
$password = "KVs9aS426Z";             // default password (empty by default)
$database = "sql12775674"; // <<=== CHANGE THIS to your DB name!

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

$subject = $data['subject'];
$uploadDate = $data['uploadDate'];
$link = $data['link'];
$uploadedBy = $data['uploadedBy'];

// Prepare SQL
$sql = "INSERT INTO File_links (Subject, UploadDate, Link, UploadedBy) 
        VALUES (?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $subject, $uploadDate, $link, $uploadedBy);

// Execute and respond
if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "File metadata stored successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to store file metadata"]);
}

$stmt->close();
$conn->close();
?>
