<?php
/**
 * Re-seeds the `samudra_data_*` options from theme/data/*.json.
 *
 * This is piped into the container's PHP over stdin by scripts/reseed-wp.js —
 * it is deliberately NOT shipped inside theme/, so there is no chance of it
 * ever being reachable over HTTP on a deployed site.
 *
 * It performs exactly what the "Reset to Default" button on each Site Content
 * admin page does, just for every section in one go, so the CLI and the admin
 * UI can never drift apart.
 */

if (PHP_SAPI !== 'cli') {
    exit(1);
}

// PHP does not define the STDERR/STDOUT constants when it reads its script
// from stdin, which is how this file is delivered, so open the stream by name.
$stderr = fopen('php://stderr', 'w');

require_once '/var/www/html/wp-load.php';

if (!function_exists('samudra_get_default_seeds')) {
    fwrite($stderr, "The samudra-react theme is not active, so its seed helpers are missing.\n");
    exit(1);
}

// theme/data is bind-mounted from the host, so this reads whatever the sync
// step just wrote — no container rebuild needed.
$seeds = samudra_get_default_seeds();

$requested = array_filter(array_map('trim', explode(',', (string) getenv('SAMUDRA_KEYS'))));
$keys      = $requested ?: array_keys($seeds);

$unknown = array_diff($keys, array_keys($seeds));
if ($unknown) {
    fwrite($stderr, 'Unknown section(s): ' . implode(', ', $unknown) . "\n");
    fwrite($stderr, 'Available: ' . implode(', ', array_keys($seeds)) . "\n");
    exit(1);
}

foreach ($keys as $key) {
    if (empty($seeds[$key])) {
        fwrite($stderr, sprintf("  ! %-16s skipped — data/%s.json is missing or empty\n", $key, $key));
        continue;
    }
    update_option('samudra_data_' . $key, $seeds[$key]);
    printf("  ✓ %-16s reseeded (%d top-level field%s)\n",
        $key, count($seeds[$key]), count($seeds[$key]) === 1 ? '' : 's');
}
