<?php
/**
 * Demo content seeder: the sample content of New Design.pdf (news, open
 * positions, the Indonesia Pavilion project) plus OLD's mock portfolios, so
 * the Services grid is not empty.
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

// The CLI runs without a logged-in user, so WordPress would kses-filter the
// titles ("Design & Build" stored as "Design &amp; Build", which the editor
// then shows literally). The content below is trusted.
kses_remove_filters();

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
 *
 * The URL is root-relative ("/wp-content/uploads/…"): the CLI has no request
 * host, so an absolute one would be http://localhost:4600/… and break for
 * anyone opening the site through another address.
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
        return $cache[$rel] = ['id' => $existing[0], 'url' => wp_make_link_relative(wp_get_attachment_url($existing[0]))];
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

    return $cache[$rel] = ['id' => $id, 'url' => wp_make_link_relative(wp_get_attachment_url($id))];
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

/** "<p>…</p>" per blank-line-separated paragraph, for post_content. */
function samudra_demo_html($text) {
    return implode("\n\n", array_map(function ($p) {
        return '<!-- wp:paragraph -->' . "\n" . '<p>' . esc_html(trim($p)) . '</p>' . "\n" . '<!-- /wp:paragraph -->';
    }, preg_split('/\n\s*\n/', trim($text))));
}

/** Delete demo items of a type whose slug is no longer in the demo set. */
function samudra_demo_prune($type, $keep) {
    $ids = get_posts([
        'post_type'   => $type,
        'post_status' => 'any',
        'numberposts' => -1,
        'fields'      => 'ids',
        'meta_key'    => SAMUDRA_DEMO_META,
        'meta_value'  => '1',
    ]);
    $removed = 0;
    foreach ($ids as $id) {
        if (!in_array(get_post_field('post_name', $id), $keep, true)) {
            wp_delete_post($id, true);
            $removed++;
        }
    }
    return $removed;
}

// ─── Portfolios ─────────────────────────────────────────────────────
// The project of the design, plus OLD's mock projects (public/data/
// portfolioItems.jsx) so the Services grid has something in every category.
$pavilion_id = 'Osaka, Kansai, Jepang, 13 April 2025 – Samudra Dyan Praga dipercaya sebagai kontraktor profesional dalam pembangunan Indonesia Pavilion pada ajang Expo 2025 Osaka yang digelar pada 13 April hingga 13 Oktober 2025 di Osaka, Kansai, Jepang. Kepercayaan tersebut menjadi bagian dari dukungan sektor swasta nasional dalam menghadirkan representasi Indonesia di forum global yang diikuti 158 negara dan diproyeksikan menarik lebih dari 28 juta pengunjung.

Dengan mengusung tema “Thriving in Harmony – Nature, Culture, Future”, Paviliun Indonesia dirancang menyerupai kapal sebagai simbol warisan maritim Nusantara dan perjalanan menuju masa depan berkelanjutan. Dalam proyek ini, Samudra Dyan Praga bertanggung jawab atas pembangunan struktur utama paviliun serta instalasi area pameran yang mendukung pengalaman berkesan bagi pengunjung. Kontributor utama, Didit Hediprasetyo Foundation, turut terlibat dalam aspek desain, termasuk pengembangan interior serta kurasi berbagai program kegiatan di dalam paviliun, seperti rolling exhibition dan cultural performance yang menjadi daya tarik dinamis sepanjang periode Expo.

Proses konstruksi dilakukan dengan memperhatikan standar internasional yang berlaku di Jepang, termasuk penerapan prinsip keberlanjutan dalam pemilihan material dan sistem bangunan. Samudra Dyan Praga juga memastikan kesiapan ruang-ruang strategis untuk mendukung pengalaman pengunjung. Di dalam Paviliun Indonesia, pengunjung diajak menjelajahi zona yang memadukan kekayaan biodiversitas, ekspresi seni kontemporer, teknologi imersif, hingga narasi transformasi menuju Indonesia Emas 2045. Instalasi seni yang menginterpretasi satwa endemik Indonesia, pengalaman sinematik bertajuk “Nusantara Odyssey”, hingga ruang forum bisnis menjadi bagian dari ekosistem pameran yang terintegrasi.

Selain pembangunan fisik, Samudra Dyan Praga juga berperan dalam manajemen penyelenggaraan pameran secara menyeluruh, mulai dari tahap pra-pameran, operasional selama pameran berlangsung, hingga penutupan acara. Keterlibatan ini menegaskan kapasitas Samudra Dyan Praga tidak hanya sebagai kontraktor konstruksi, tetapi juga sebagai mitra strategis dalam memastikan seluruh konsep dan agenda Paviliun Indonesia terealisasi secara optimal di panggung dunia.';

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
    ['giant-christmas-tree-installation', 'Giant Christmas Tree Installation', 'Special Project', 3,
        'A 15-meter tall Christmas tree installation at a major shopping mall in Jakarta, featuring custom ornaments and lighting.'],
    ['outdoor-concert-tent-setup', 'Outdoor Concert Tent Setup Bali', 'Tent Service', 2,
        'Large-scale tent service for an outdoor music festival in Bali. Multiple tent structures covering 5000 sqm.'],
    ['iims-2024-booth', 'Indonesia International Motor Show 2024', 'Exhibition Construction', 3,
        'Exhibition booth construction for multiple automotive brands at IIMS 2024. Premium booth design with interactive displays.'],
    ['corporate-event-tent-surabaya', 'Corporate Event Tent Service Surabaya', 'Tent Service', 2,
        'Professional tent setup for a large corporate gathering in Surabaya. Climate-controlled structures with elegant interior finishing.'],
    ['restaurant-interior-bali', 'Beachfront Restaurant Interior Bali', 'Interior Design & Build', 3,
        'Interior design and build for a premium beachfront restaurant in Seminyak, Bali. Tropical modern aesthetic with natural materials.'],
    ['art-installation-museum', 'Interactive Art Installation Museum', 'Special Project', 2,
        'Special project for an interactive art museum. Custom-built installations with LED technology and motion sensors.'],
    ['giias-2023-exhibition', 'GIIAS 2023 Exhibition Stand', 'Exhibition Construction', 4,
        'Premium exhibition stand for Gaikindo Indonesia International Auto Show 2023. Multi-level booth structure with VIP lounge.'],
];

$image = samudra_demo_media($hero);
// Oldest first, one day apart, so "newest first" keeps OLD's list order.
$count = count($portfolios);
foreach ($portfolios as $i => [$slug, $title, $category, $gallery_count, $description]) {
    $id = samudra_demo_post('portfolio', $slug, [
        'post_title'   => $title,
        'post_content' => '',
        'post_date'    => gmdate('Y-m-d H:i:s', strtotime('2025-01-01 09:00:00') + ($count - $i) * DAY_IN_SECONDS),
    ], [
        'portfolio_description'    => $description,
        'portfolio_hero_image'     => $image['url'],
        'portfolio_gallery_images' => wp_json_encode(array_fill(0, $gallery_count, $image['url'])),
    ]);
    if (!$id) continue;
    if ($image['id']) set_post_thumbnail($id, $image['id']);
    wp_set_object_terms($id, [$category], 'portfolio_category');
}

// The design's project: newest, so it leads the grid.
$aerial  = samudra_demo_media('/images/home/hero-osaka.webp');
$render  = samudra_demo_media('/images/services/special-project.webp');
$sign    = samudra_demo_media('/images/demo/indonesia-pavilion.webp');
$id = samudra_demo_post('portfolio', 'pavilion-indonesia-osaka-world-expo-2025', [
    'post_title'   => 'Pavilion Indonesia - Osaka World Expo 2025',
    'post_content' => samudra_demo_html($pavilion_id),
    'post_date'    => '2025-04-13 09:00:00',
], [
    'portfolio_description'    => 'Professional contractor for the construction of the Indonesia Pavilion at Expo 2025 Osaka, from the main structure to the exhibition areas.',
    'portfolio_hero_image'     => $aerial['url'],
    'portfolio_gallery_images' => wp_json_encode(array_values(array_filter([$aerial['url'], $render['url'], $sign['url']]))),
]);
if ($id) {
    if ($render['id']) set_post_thumbnail($id, $render['id']);
    wp_set_object_terms($id, ['Special Project'], 'portfolio_category');
}
$slugs = array_merge(array_column($portfolios, 0), ['pavilion-indonesia-osaka-world-expo-2025']);
printf("  ✓ %d portfolios (%d stale removed)\n", count($slugs), samudra_demo_prune('portfolio', $slugs));

// ─── News (New Design.pdf) ──────────────────────────────────────────
// Images the design uses that are not in "New Design Assets" yet stay
// empty until the originals arrive. Posts sharing a day get different hours
// so BACK / NEXT can order them.
$pavilion_en = 'Osaka, Kansai, Japan, April 13, 2025 – Samudra Dyan Praga has been appointed as the professional contractor for the construction of the Indonesia Pavilion at Expo 2025 Osaka, held from April 13 to October 13, 2025, in Osaka, Kansai, Japan. This appointment reflects the active support of the national private sector in representing Indonesia on a global platform, which features 158 participating countries and is projected to attract over 28 million visitors.

Carrying the theme "Thriving in Harmony – Nature, Culture, Future", the Indonesia Pavilion is designed in the shape of a ship, symbolizing the maritime heritage of the Indonesian archipelago (Nusantara) and its journey toward a sustainable future. In this project, Samudra Dyan Praga is responsible for the main structural construction of the pavilion as well as the installation of exhibition areas that foster memorable visitor experiences. Key contributor, Didit Hediprasetyo Foundation, is actively involved in the design aspects, including interior development and the curation of various programs within the pavilion, such as rolling exhibitions and cultural performances that offer dynamic attractions throughout the Expo period.

The construction process strictly adheres to international standards applicable in Japan, including the implementation of sustainability principles in material selection and building systems. Samudra Dyan Praga also ensures the readiness of strategic spaces to enrich the visitor experience. Inside the Indonesia Pavilion, visitors are invited to explore curated zones combining rich biodiversity, contemporary artistic expressions, immersive technology, and the narrative of Indonesia’s transformation toward Indonesia Emas 2045. Highlights include art installations interpreting Indonesia\'s endemic fauna, a cinematic experience titled "Nusantara Odyssey", and dedicated business forum spaces integrated into a cohesive exhibition ecosystem.

Beyond physical construction, Samudra Dyan Praga plays a pivotal role in overall exhibition management, spanning pre-exhibition preparations, operational management during the event, through to event closing. This involvement highlights Samudra Dyan Praga\'s capability not only as a construction contractor, but also as a strategic partner ensuring that all concepts and agendas for the Indonesia Pavilion are seamlessly realized on the global stage.';

$news = [
    ['indonesia-pavilion-world-expo-osaka-2025', 'Indonesia Pavilion - World Expo Osaka 2025', '2025-04-13 09:00:00',
        'Osaka, Kansai, Japan, April 13, 2025 – Samudra Dyan Praga has been appointed as the professional contractor for the construction of the Indonesia Pavilion at Expo 2025 Osaka,',
        $pavilion_en, '/images/demo/indonesia-pavilion.webp'],
    ['mewujudkan-ruang-pamer-berstandar-internasional', 'Mewujudkan Ruang Pamer Berstandar Internasional : Balik Layar Pembangunan Booth Eksklusif Samudra Dyan Praga', '2026-09-25 09:00:00',
        'JAKARTA, Samudra Dyan Praga — Di tengah pesatnya perkembangan industri MICE (Meetings, Incentives, Conferences, and Exhibitions),', '', '/images/career/hero.webp'],
    ['komitmen-keberlanjutan-material-ramah-lingkungan', 'Komitmen Keberlanjutan: Inovasi Material Ramah Lingkungan pada Konstruksi Pameran Modern', '2026-09-25 08:00:00',
        'JAKARTA, Samudra Dyan Praga — Isu keberlanjutan (sustainability) kini menjadi perhatian utama dalam industri konstruksi dan pameran global.', '', '/images/services/interior-design-build.webp'],
    ['manajemen-operasional-pameran-end-to-end', 'Manajemen Operasional Pameran End-to-End: Solusi Strategis Samudra Dyan Praga untuk Event Berskala Besar', '2026-09-25 07:00:00',
        'JAKARTA, Samudra Dyan Praga — Mengelola pameran berskala besar memerlukan koordinasi yang kompleks,', '', ''],
    ['panduan-memilih-kontraktor-event-profesional', 'Panduan Penting Memilih Kontraktor Event Profesional untuk Pameran Skala Global', '2026-09-25 06:00:00',
        'JAKARTA, Samudra Dyan Praga — Mengikuti pameran skala internasional merupakan investasi besar bagi sebuah perusahaan.', '', ''],
    ['manajemen-risiko-hsse-konstruksi-pameran', 'Mengelola Manajemen Risiko dan Keselamatan Kerja (HSSE) pada Konstruksi Pameran Ketat-Waktu', '2026-09-25 05:00:00',
        'JAKARTA, Samudra Dyan Praga — Proses build-up pameran sering kali dihadapkan pada tenggat waktu yang sangat ketat (tight deadline).', '', ''],
    ['dari-konsep-desain-ke-realisasi-fisik', 'Dari Konsep Desain ke Realisasi Fisik: Tantangan & Teknik Akurasi Konstruksi Pameran Modern', '2026-09-25 04:00:00',
        'JAKARTA, Samudra Dyan Praga — Sering kali terdapat perbedaan antara hasil render desain 3D yang megah dengan realisasi fisik bangunan di arena', '', ''],
    ['sistem-partition-r8-dan-maxima', 'Mengenal Sistem Partition R8 dan Maxima: Mana Material yang Paling Tepat untuk Booth Pameran Anda?', '2026-09-25 03:00:00',
        'JAKARTA, Samudra Dyan Praga — Dalam dunia konstruksi pameran, sistem modular merupakan solusi terpopuler karena efisiensi dan kepraktisannya.', '', ''],
    ['keunggulan-struktur-roder-tent', 'Keunggulan Struktur Roder (Tent Roder) untuk Event Outdoor Berskala Besar dan Area Semi-Permanen', '2026-01-21 09:00:00',
        'JAKARTA, Samudra Dyan Praga — Menyelenggarakan outdoor event berskala besar memerlukan perlindungan struktur yang tidak hanya luas tetapi juga tangguh menghadapi berbagai kondisi cuaca.', '', ''],
];

foreach ($news as [$slug, $title, $date, $excerpt, $content, $cover]) {
    $id = samudra_demo_post('post', $slug, [
        'post_title'   => $title,
        'post_date'    => $date,
        'post_excerpt' => $excerpt,
        'post_content' => samudra_demo_html($content !== '' ? $content : $excerpt),
    ]);
    if (!$id) continue;
    $media = $cover ? samudra_demo_media($cover) : ['id' => 0];
    if ($media['id']) {
        set_post_thumbnail($id, $media['id']);
    } else {
        delete_post_thumbnail($id);
    }
}
printf("  ✓ %d news posts (%d stale removed)\n", count($news), samudra_demo_prune('post', array_column($news, 0)));

// ─── Careers (New Design.pdf) ───────────────────────────────────────
$careers = [
    ['production-operations-manager', 'Production & Operations Manager',
        'Lead and oversee event production and operations, ensuring exceptional execution from MICE projects from planning to completion.'],
    ['procurement-logistic-manager', 'Procurement & Logistic Manager',
        'Manage procurement, purchasing, and logistics for MICE projects, ensuring efficient sourcing, cost control, and on-time delivery.'],
    ['sales-governments', 'Sales - Governments',
        'Build relationships with ministries, SOEs and local governments; develop government projects.'],
    ['sales-corporate-exhibition', 'Sales - Corporate & Exhibition',
        'Grow exhibition and corporate accounts through PEO, PCO and industry relationships.'],
];
foreach ($careers as $i => [$slug, $title, $description]) {
    samudra_demo_post('career', $slug, [
        'post_title' => $title,
        'post_date'  => gmdate('Y-m-d H:i:s', strtotime('2026-09-01 09:00:00') + (count($careers) - $i) * HOUR_IN_SECONDS),
    ], [
        'career_location'     => 'Jakarta, Indonesia',
        'career_type'         => 'Full-time',
        'career_level'        => 'Managerial Position',
        'career_description'  => $description,
        'career_closing_date' => '2026-10-30',
    ]);
}
printf("  ✓ %d career positions (%d stale removed)\n", count($careers), samudra_demo_prune('career', array_column($careers, 0)));
