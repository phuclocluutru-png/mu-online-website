<?php
// Simple server-side proxy to fetch WordPress posts/categories for legacy WebBrowser (no CORS/TLS support)
// Usage:
//   proxy.php?action=categories
//   proxy.php?action=posts&cat=slug   (cat optional; if missing => latest)

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$API_BASE = 'https://pkclear.com/wp-json/wp/v2';

function get_json($url) {
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 5,
            'ignore_errors' => true
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false
        ]
    ]);
    $data = @file_get_contents($url, false, $ctx);
    if ($data === false) return null;
    $json = json_decode($data, true);
    return $json;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'categories') {
    $cats = get_json($API_BASE . '/categories?per_page=100');
    if (!$cats) {
        http_response_code(502);
        echo json_encode(['error' => 'fetch_failed']);
        exit;
    }
    $out = [];
    foreach ($cats as $c) {
        $out[] = [
            'id' => $c['id'],
            'slug' => $c['slug'],
            'name' => $c['name']
        ];
    }
    echo json_encode($out);
    exit;
}

if ($action === 'posts') {
    $cat = isset($_GET['cat']) ? trim($_GET['cat']) : '';
    $url = $API_BASE . '/posts?per_page=20&_embed';
    if ($cat !== '') {
        $url .= '&categories=' . rawurlencode($cat);
    }
    $posts = get_json($url);
    if (!$posts) {
        http_response_code(502);
        echo json_encode(['error' => 'fetch_failed']);
        exit;
    }
    echo json_encode($posts);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'invalid_action']);
