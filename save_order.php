<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php'; // файл с подключением

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['items'])) {
    echo json_encode(['ok' => false, 'error' => 'Пустой заказ']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO orders (user_name, user_phone, user_email, items, total) VALUES (?,?,?,?,?)");
$stmt->execute([
    $data['name'] ?? 'Не указано',
    $data['phone'] ?? 'Не указано',
    $data['email'] ?? '',
    json_encode($data['items'], JSON_UNESCAPED_UNICODE),
    $data['total']
]);

echo json_encode(['ok' => true, 'order_id' => $pdo->lastInsertId()]);