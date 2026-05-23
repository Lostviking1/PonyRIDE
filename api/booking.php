<?php
declare(strict_types=1);

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxR7VR13e0_kTXo81PcY-TxIv2MxWTeENlIqKYQf3WP-roFb2HKigaOUr9uQRwJb__a/exec';
const REQUIRED_FIELDS = ['name', 'phone', 'model', 'rentalTerm', 'rentalPurpose', 'source', 'submittedAt'];

header('Content-Type: application/json; charset=utf-8');

function respond(int $statusCode, array $body): void
{
    http_response_code($statusCode);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function trimmed_string($value, int $maxLength): string
{
    $string = trim((string) ($value ?? ''));
    return function_exists('mb_substr') ? mb_substr($string, 0, $maxLength) : substr($string, 0, $maxLength);
}

function payload_from_request(): array
{
    $input = json_decode((string) file_get_contents('php://input'), true);
    if (!is_array($input)) {
        $input = [];
    }

    return [
        'name' => trimmed_string($input['name'] ?? '', 50),
        'phone' => trimmed_string($input['phone'] ?? '', 32),
        'model' => trimmed_string($input['model'] ?? '', 32),
        'rentalTerm' => trimmed_string($input['rentalTerm'] ?? '', 32),
        'rentalPurpose' => trimmed_string($input['rentalPurpose'] ?? '', 48),
        'fromBashkortostanCity' => !empty($input['fromBashkortostanCity']),
        'city' => trimmed_string($input['city'] ?? '', 80),
        'comment' => trimmed_string($input['comment'] ?? '', 1200),
        'consent' => ($input['consent'] ?? false) === true,
        'source' => trimmed_string($input['source'] ?? '', 80),
        'submittedAt' => trimmed_string($input['submittedAt'] ?? '', 64),
    ];
}

function invalid_reason(array $payload): string
{
    foreach (REQUIRED_FIELDS as $field) {
        if ($payload[$field] === '') {
            return 'Заполните обязательные поля.';
        }
    }

    if (!$payload['consent']) {
        return 'Нужно согласие на обработку данных.';
    }

    if ($payload['fromBashkortostanCity'] && $payload['city'] === '') {
        return 'Укажите город.';
    }

    return '';
}

function post_to_google(array $payload): array
{
    if (!function_exists('curl_init')) {
        return ['ok' => false, 'status' => 0, 'body' => 'PHP cURL is unavailable.'];
    }

    $curl = curl_init(GOOGLE_APPS_SCRIPT_URL);
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: text/plain;charset=utf-8'],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 20,
    ]);

    $body = curl_exec($curl);
    $statusCode = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    curl_close($curl);

    if ($body === false) {
        return ['ok' => false, 'status' => $statusCode, 'body' => $error];
    }

    $result = json_decode((string) $body, true);
    return [
        'ok' => $statusCode >= 200 && $statusCode < 300 && is_array($result) && ($result['ok'] ?? false) === true,
        'status' => $statusCode,
        'body' => (string) $body,
    ];
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'Метод не поддерживается.']);
}

$payload = payload_from_request();
$reason = invalid_reason($payload);
if ($reason !== '') {
    respond(400, ['ok' => false, 'error' => $reason]);
}

$googleResult = post_to_google($payload);
if (!$googleResult['ok']) {
    respond(502, ['ok' => false, 'error' => 'Google Таблица не подтвердила запись заявки.']);
}

respond(200, ['ok' => true]);
