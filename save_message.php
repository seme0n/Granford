<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['name'])) {
    echo json_encode(['ok' => false, 'error' => 'Заполните имя']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO messages (name, phone, email, car_model, message) VALUES (?,?,?,?,?)");
$stmt->execute([
    $data['name'],
    $data['phone'] ?? '',
    $data['email'] ?? '',
    $data['car_model'] ?? '',
    $data['message'] ?? ''
]);

echo json_encode(['ok' => true]);