<?php
/**
 * Demo content seeder — OLD's mock data turned into real WordPress content.
 *
 * Piped into the container's PHP over stdin by scripts/seed-demo.js, like
 * wp-reseed.php, so it never ships inside theme/ or becomes reachable over
 * HTTP.
 *
 * Every post and attachment it creates is tagged `_samudra_demo = 1`;
 * SAMUDRA_DEMO_CLEAN=1 deletes exactly those and nothing else. Posts are
 * matched by slug, so running it twice updates instead of duplicating.
 */

if (PHP_SAPI !== 'cli') {
    exit(1);
}

// PHP does not define STDERR when it reads its script from stdin.
function samudra_demo_err($message) {
    static $stream = null;
    $stream = $stream ?: fopen('php://stderr', 'w');
    fwrite($stream, $message);
}

require_once '/var/www/html/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

if (!function_exists('samudra_cpt_fields')) {
    samudra_demo_err("The samudra-react theme is not active, so its post types are missing.\n");
    exit(1);
}

const SAMUDRA_DEMO_META = '_samudra_demo';

// ─── Clean ──────────────────────────────────────────────────────────
if (getenv('SAMUDRA_DEMO_CLEAN') === '1') {
    $ids = get_posts([
        'post_type'   => ['post', 'portfolio', 'career', 'attachment'],
        'post_status' => 'any',
        'numberposts' => -1,
        'fields'      => 'ids',
        'meta_key'    => SAMUDRA_DEMO_META,
        'meta_value'  => '1',
    ]);
    foreach ($ids as $id) {
        if (get_post_type($id) === 'attachment') {
            wp_delete_attachment($id, true);
        } else {
            wp_delete_post($id, true);
        }
    }
    printf("  ✓ removed %d demo item%s\n", count($ids), count($ids) === 1 ? '' : 's');
    exit(0);
}

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Import theme/dist/<path> into the Media Library once and return its URL.
 * Repeated paths reuse the same attachment.
 */
function samudra_demo_media($rel) {
    static $cache = [];
    if (isset($cache[$rel])) return $cache[$rel];

    $existing = get_posts([
        'post_type'   => 'attachment',
        'post_status' => 'inherit',
        'numberposts' => 1,
        'fields'      => 'ids',
        'meta_key'    => '_samudra_demo_src',
        'meta_value'  => $rel,
    ]);
    if ($existing) {
        return $cache[$rel] = ['id' => $existing[0], 'url' => wp_get_attachment_url($existing[0])];
    }

    $src = get_template_directory() . '/dist/' . ltrim($rel, '/');
    if (!file_exists($src)) {
        samudra_demo_err("  ! missing $rel\n");
        return $cache[$rel] = ['id' => 0, 'url' => ''];
    }

    $upload = wp_upload_dir();
    $filename = wp_unique_filename($upload['path'], basename($src));
    $dest = trailingslashit($upload['path']) . $filename;
    copy($src, $dest);
    $type = wp_check_filetype($filename, null);
    $id = wp_insert_attachment([
        'guid'           => trailingslashit($upload['url']) . $filename,
        'post_mime_type' => $type['type'],
        'post_title'     => sanitize_file_name(pathinfo($filename, PATHINFO_FILENAME)),
        'post_status'    => 'inherit',
    ], $dest);
    wp_update_attachment_metadata($id, wp_generate_attachment_metadata($id, $dest));
    update_post_meta($id, SAMUDRA_DEMO_META, '1');
    update_post_meta($id, '_samudra_demo_src', $rel);

    return $cache[$rel] = ['id' => $id, 'url' => wp_get_attachment_url($id)];
}

/** Create or update a post by slug; returns its id. */
function samudra_demo_post($type, $slug, $fields, $meta = []) {
    $existing = get_page_by_path($slug, OBJECT, $type);
    $args = array_merge([
        'post_type'   => $type,
        'post_name'   => $slug,
        'post_status' => 'publish',
    ], $fields);
    if ($existing) {
        $args['ID'] = $existing->ID;
        $id = wp_update_post($args, true);
    } else {
        $id = wp_insert_post($args, true);
    }
    if (is_wp_error($id)) {
        samudra_demo_err("  ! {$type} {$slug}: " . $id->get_error_message() . "\n");
        return 0;
    }
    // wp_slash because update_post_meta() unslashes internally — otherwise
    // the backslashes in JSON values get stripped.
    foreach ($meta as $k => $v) {
        update_post_meta($id, $k, wp_slash($v));
    }
    update_post_meta($id, SAMUDRA_DEMO_META, '1');
    return $id;
}

// ─── Portfolio categories ───────────────────────────────────────────
samudra_seed_portfolio_categories();
echo "  ✓ portfolio categories\n";

// ─── Portfolios (OLD public/data/portfolioItems.jsx) ────────────────
$hero = '/images/services/hero.png';
$portfolios = [
    ['christmas-decoration-astra-international', 'Christmas Decoration for PT Astra International TBK Building', 'Exhibition Construction', 9,
        'Daihatsu indonesia masters 2021. With DIA Brands, one of the leading brand agency from Singapore. We participate in the well-known badminton tournament that took place at the Bali International Convention Center in Nusa Dua, Badung Regency, Bali, Indonesia, from 16 to 21 November 2021.'],
    ['daihatsu-indonesia-masters-2021', 'Daihatsu Indonesia Masters 2021', 'Exhibition Construction', 3,
        'With DIA Brands, one of the leading brand agency from Singapore. We participate in the well-known badminton tournament that took place at the Bali International Convention Center in Nusa Dua.'],
    ['wedding-celebration-festival', 'Wedding Celebration Festival 2023', 'Exhibition Construction', 2,
        'A grand wedding expo held at Jakarta Convention Center showcasing the finest in wedding planning, decoration, and services.'],
    ['modern-office-interior-jakarta', 'Modern Office Interior Design Jakarta', 'Interior Design & Build', 3,
        'Complete interior redesign for a corporate office in South Jakarta. Modern minimalist approach with sustainable materials.'],
    ['showroom-design-bmw', 'BMW Showroom Design & Build', 'Interior Design & Build', 2,
        'Full showroom design and construction for BMW Indonesia. Premium materials and lighting to showcase luxury vehicles.'],
    ['giant-christmas-tree-installation', 'Giant Christmas Tree Installation', 'Special Projects', 3,
        'A 15-meter tall Christmas tree installation at a major shopping mall in Jakarta, featuring custom ornaments and lighting.'],
    ['outdoor-concert-tent-setup', 'Outdoor Concert Tent Setup Bali', 'Tent Service', 2,
        'Large-scale tent service for an outdoor music festival in Bali. Multiple tent structures covering 5000 sqm.'],
    ['iims-2024-booth', 'Indonesia International Motor Show 2024', 'Exhibition Construction', 3,
        'Exhibition booth construction for multiple automotive brands at IIMS 2024. Premium booth design with interactive displays.'],
    ['corporate-event-tent-surabaya', 'Corporate Event Tent Service Surabaya', 'Tent Service', 2,
        'Professional tent setup for a large corporate gathering in Surabaya. Climate-controlled structures with elegant interior finishing.'],
    ['restaurant-interior-bali', 'Beachfront Restaurant Interior Bali', 'Interior Design & Build', 3,
        'Interior design and build for a premium beachfront restaurant in Seminyak, Bali. Tropical modern aesthetic with natural materials.'],
    ['art-installation-museum', 'Interactive Art Installation Museum', 'Special Projects', 2,
        'Special project for an interactive art museum. Custom-built installations with LED technology and motion sensors.'],
    ['giias-2023-exhibition', 'GIIAS 2023 Exhibition Stand', 'Exhibition Construction', 4,
        'Premium exhibition stand for Gaikindo Indonesia International Auto Show 2023. Multi-level booth structure with VIP lounge.'],
];

$image = samudra_demo_media($hero);
// Oldest first, one day apart, so "newest first" keeps OLD's list order.
$count = count($portfolios);
foreach ($portfolios as $i => [$slug, $title, $category, $gallery_count, $description]) {
    $id = samudra_demo_post('portfolio', $slug, [
        'post_title' => $title,
        'post_date'  => gmdate('Y-m-d H:i:s', strtotime('2025-01-01 09:00:00') + ($count - $i) * DAY_IN_SECONDS),
    ], [
        'portfolio_description'    => $description,
        'portfolio_hero_image'     => $image['url'],
        'portfolio_gallery_images' => wp_json_encode(array_fill(0, $gallery_count, $image['url'])),
    ]);
    if (!$id) continue;
    if ($image['id']) set_post_thumbnail($id, $image['id']);
    wp_set_object_terms($id, [$category], 'portfolio_category');
}
printf("  ✓ %d portfolios\n", $count);

// ─── News (OLD public/data/eventItems.jsx) ──────────────────────────
$lorem = implode("\n\n", [
    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duisas autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, cons ectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
    'Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, seda diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.',
    'Lorem ipsum dolor sit amet, cons ectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duissad autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue.',
]);

$news = [
    ['christmas-decoration-astra-international', 'Christmas Decoration for PT Astra International TBK Building', '2026-01-22',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'],
    ['daihatsu-indonesia-masters-2026', 'Daihatsu Indonesia Masters 2026 Event Coverage', '2026-01-18',
        'With DIA Brands, one of the leading brand agency from Singapore. We participate in the well-known badminton tournament.'],
    ['samudra-wins-best-booth-award', 'Samudra Wins Best Booth Award at IIMS 2025', '2025-12-15',
        'Samudra Dyan Praga received the prestigious Best Booth Award for outstanding exhibition design at the Indonesia International Motor Show.'],
    ['new-office-opening-bali', 'Grand Opening of Samudra Bali Branch Office', '2025-11-28',
        'Samudra Dyan Praga expands its presence with a new branch office in Bali to serve clients across Eastern Indonesia.'],
    ['wedding-expo-jakarta-2025', 'Wedding Celebration Festival 2025 Highlights', '2025-10-10',
        'A grand wedding expo held at Jakarta Convention Center showcasing the finest in wedding planning, decoration, and services.'],
    ['corporate-sustainability-initiative', 'Samudra Launches Green Exhibition Initiative', '2025-09-05',
        'Our commitment to sustainable exhibition practices with eco-friendly materials and zero-waste booth construction.'],
    ['giias-2025-record-breaking', 'GIIAS 2025 Sets Record with 15 Booth Constructions', '2025-08-20',
        'Samudra managed a record 15 exhibition booths at Gaikindo Indonesia International Auto Show 2025.'],
    ['tent-service-expansion-surabaya', 'Tent Service Division Expands to Surabaya', '2025-07-14',
        'New tent service warehouse and operations center opens in Surabaya to cover East Java event demands.'],
    ['interior-design-award-2025', 'Samudra Receives Interior Design Excellence Award', '2025-06-01',
        'Recognition for outstanding commercial interior design projects across Indonesia.'],
];

foreach ($news as [$slug, $title, $date, $excerpt]) {
    $id = samudra_demo_post('post', $slug, [
        'post_title'   => $title,
        'post_date'    => $date . ' 09:00:00',
        'post_excerpt' => $excerpt,
        'post_content' => $lorem,
    ]);
    if ($id && $image['id']) set_post_thumbnail($id, $image['id']);
}
printf("  ✓ %d news posts\n", count($news));

// ─── Careers (OLD has no mock positions; clearly marked placeholders) ──
$careers = [
    ['demo-exhibition-project-manager', '[DEMO] Exhibition Project Manager', 'Full Time', 'Jakarta',
        'Lead exhibition booth projects from client brief to handover, coordinating design, production and on-site teams.'],
    ['demo-3d-booth-designer', '[DEMO] 3D Booth Designer', 'Full Time', 'Jakarta',
        'Turn client briefs into 3D booth concepts and production-ready drawings for exhibitions across Indonesia.'],
    ['demo-site-supervisor', '[DEMO] Site Supervisor', 'Contract', 'Surabaya',
        'Supervise booth and tent installation on site, keeping work safe, on schedule and to specification.'],
];
foreach ($careers as $i => [$slug, $title, $type, $location, $description]) {
    samudra_demo_post('career', $slug, [
        'post_title' => $title,
        'post_date'  => gmdate('Y-m-d H:i:s', strtotime('2025-06-01 09:00:00') + (count($careers) - $i) * DAY_IN_SECONDS),
    ], [
        'career_type'        => $type,
        'career_location'    => $location,
        'career_description' => $description,
        'career_apply_url'   => '',
    ]);
}
printf("  ✓ %d career positions\n", count($careers));
