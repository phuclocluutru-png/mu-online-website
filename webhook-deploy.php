<?php
/**
 * GitHub Webhook Auto Deploy Script
 * Đặt file này trong thư mục hosting và cấu hình webhook trên GitHub
 */

// Secret key để bảo mật (đặt trong GitHub webhook settings)
define('SECRET', 'your-secret-key-here');

// Đường dẫn đến thư mục project
define('PROJECT_DIR', '/path/to/your/website/mu/');

// Git repository URL
define('REPO_URL', 'https://github.com/phuclocluutru-png/mu-online-website.git');

// Verify GitHub signature
function verifySignature($payload, $signature) {
    $calculated = 'sha256=' . hash_hmac('sha256', $payload, SECRET);
    return hash_equals($calculated, $signature);
}

// Get POST data
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Verify signature
if (!verifySignature($payload, $signature)) {
    http_response_code(403);
    die('Forbidden');
}

// Parse payload
$data = json_decode($payload, true);

// Check if it's a push to main branch
if ($data['ref'] === 'refs/heads/main') {
    
    // Log the deployment
    $log = date('Y-m-d H:i:s') . " - Deploying from GitHub\n";
    file_put_contents('deploy.log', $log, FILE_APPEND);
    
    // Change to project directory
    chdir(PROJECT_DIR);
    
    // Pull latest changes
    $commands = [
        'git fetch origin main',
        'git reset --hard origin/main',
        'git clean -fd'
    ];
    
    foreach ($commands as $command) {
        $output = shell_exec($command . ' 2>&1');
        $log = date('Y-m-d H:i:s') . " - $command: $output\n";
        file_put_contents('deploy.log', $log, FILE_APPEND);
    }
    
    echo "Deployment successful!";
} else {
    echo "No deployment needed";
}
?>
