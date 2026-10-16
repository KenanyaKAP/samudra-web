<?php
/**
 * Samudra React Theme - functions.php
 *
 * Enqueues built React assets (JS/CSS) from Vite's output and exposes the
 * editable site content over the REST API.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// ─── Theme Setup ────────────────────────────────────────────────────
function samudra_theme_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', [
        'search-form', 'comment-form', 'comment-list',
        'gallery', 'caption', 'style', 'script',
    ]);
    add_theme_support('custom-logo');
}
add_action('after_setup_theme', 'samudra_theme_setup');

// ─── Enqueue React Assets ───────────────────────────────────────────
function samudra_enqueue_assets() {
    $theme_dir = get_template_directory();
    $theme_uri = get_template_directory_uri();
    $manifest_path = $theme_dir . '/dist/.vite/manifest.json';

    if (!file_exists($manifest_path)) {
        wp_die(
            'React build not found. Please run <code>npm run build:wp</code> to build the theme assets.',
            'Build Required',
            ['response' => 500]
        );
        return;
    }

    $manifest = json_decode(file_get_contents($manifest_path), true);

    $entry_key = 'index.html';
    if (!isset($manifest[$entry_key])) {
        $entry_key = 'src/main.jsx';
    }
    if (!isset($manifest[$entry_key])) {
        return;
    }

    $entry = $manifest[$entry_key];

    if (isset($entry['css'])) {
        foreach ($entry['css'] as $index => $css_file) {
            wp_enqueue_style(
                'samudra-react-css-' . $index,
                $theme_uri . '/dist/' . $css_file,
                [],
                null
            );
        }
    }

    wp_enqueue_script(
        'samudra-react-js',
        $theme_uri . '/dist/' . $entry['file'],
        [],
        null,
        true
    );

    add_filter('script_loader_tag', function ($tag, $handle) {
        if ($handle === 'samudra-react-js') {
            $tag = str_replace('<script ', '<script type="module" ', $tag);
        }
        return $tag;
    }, 10, 2);

    wp_localize_script('samudra-react-js', 'wpData', [
        'restUrl'  => esc_url_raw(rest_url()),
        'nonce'    => wp_create_nonce('wp_rest'),
        'themeUrl' => $theme_uri,
        'siteUrl'  => home_url('/'),
        'siteName' => get_bloginfo('name'),
    ]);
}
add_action('wp_enqueue_scripts', 'samudra_enqueue_assets');

// ─── Remove WordPress default cruft ─────────────────────────────────
function samudra_cleanup_head() {
    remove_action('wp_head', 'wp_generator');
    remove_action('wp_head', 'wlwmanifest_link');
    remove_action('wp_head', 'rsd_link');
    remove_action('wp_head', 'wp_shortlink_wp_head');
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_print_styles', 'print_emoji_styles');

    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
    wp_dequeue_style('global-styles');
    wp_dequeue_style('classic-theme-styles');
}
add_action('wp_enqueue_scripts', 'samudra_cleanup_head', 100);

// ─── Enable CORS for REST API (dev only) ────────────────────────────
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
        }
        return $value;
    });
});

// ─── Rewrite Rules: Send all front-end routes to index.php ──────────
// robots.txt, favicon.ico, .well-known and *.xml (core sitemaps) are left to
// WordPress; otherwise the catch-all hands crawlers the SPA shell instead.
function samudra_rewrite_rules() {
    add_rewrite_rule('^(?!wp-admin|wp-json|wp-login|wp-content|wp-includes|robots\.txt|favicon\.ico|\.well-known|.*\.xml).*', 'index.php', 'top');
}
add_action('init', 'samudra_rewrite_rules');

// ─── The SPA owns every front-end URL ───────────────────────────────
//
// Without this, redirect_canonical bounces /services to /services/ on every
// deep link and refresh — an extra round trip per navigation, and canonical
// URLs that disagree with the paths React Router generates.
add_filter('redirect_canonical', function ($redirect_url) {
    return is_admin() ? $redirect_url : false;
});

/** Front-end paths with no slug, as served by React Router (src/App.jsx). */
function samudra_spa_routes() {
    return [
        '/',
        '/about',
        '/people',
        '/services',
        '/events',
        '/contact',
        '/career',
        '/privacy-policy',
    ];
}

/**
 * Pages of the old site that the redesign merged into others. Answered with
 * a permanent redirect so old links and search results keep working.
 */
function samudra_legacy_redirects() {
    return [
        '/about/history'    => '/about',
        '/about/company'    => '/about',
        '/about/vision'     => '/about',
        '/about/values'     => '/about',
        '/about/awards'     => '/about',
        '/about/management' => '/people',
    ];
}

add_action('template_redirect', function () {
    if (is_admin()) {
        return;
    }
    $path = rtrim((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');
    $map = samudra_legacy_redirects();
    if (isset($map[$path])) {
        wp_safe_redirect(home_url($map[$path]), 301);
        exit;
    }
}, 1);

/** True when a published post of $type has this slug. */
function samudra_published_slug_exists($slug, $type) {
    $ids = get_posts([
        'name'          => sanitize_title(rawurldecode($slug)),
        'post_type'     => $type,
        'post_status'   => 'publish',
        'numberposts'   => 1,
        'fields'        => 'ids',
        'no_found_rows' => true,
    ]);
    return !empty($ids);
}

/**
 * Whether React Router renders real content for a path. Detail routes only
 * count when the portfolio / news post behind the slug actually exists, so a
 * mistyped slug is a 404 too, not a soft 404.
 */
function samudra_spa_route_exists($path) {
    if (in_array($path, samudra_spa_routes(), true)) {
        return true;
    }
    if (preg_match('#^/services/([^/]+)$#', $path, $m)) {
        return samudra_published_slug_exists($m[1], 'portfolio');
    }
    if (preg_match('#^/events/([^/]+)$#', $path, $m)) {
        return samudra_published_slug_exists($m[1], 'post');
    }
    return false;
}

/**
 * Anything React Router does not serve gets a real 404 status (the SPA still
 * renders its NotFound page), so unknown URLs are not indexed as soft 404s.
 */
function samudra_spa_status() {
    if (is_admin() || is_feed() || is_robots()) {
        return;
    }
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    $path = rtrim((string) $path, '/');
    if ($path === '') {
        $path = '/';
    }
    if (!samudra_spa_route_exists($path)) {
        status_header(404);
    }
}
add_action('template_redirect', 'samudra_spa_status', 5);

// ─── Serve static assets from theme/dist ────────────────────────────
function samudra_serve_static_assets() {
    $request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $static_prefixes = ['/images/', '/assets/', '/Logo.png'];

    foreach ($static_prefixes as $prefix) {
        if (strpos($request_uri, $prefix) === 0) {
            $file_path = get_template_directory() . '/dist' . rawurldecode($request_uri);
            // Never let a crafted path escape the dist directory.
            $real = realpath($file_path);
            $root = realpath(get_template_directory() . '/dist');
            if ($real === false || $root === false || strpos($real, $root) !== 0) {
                return;
            }
            if (is_file($real)) {
                $mime_types = [
                    'png'   => 'image/png',
                    'jpg'   => 'image/jpeg',
                    'jpeg'  => 'image/jpeg',
                    'gif'   => 'image/gif',
                    'svg'   => 'image/svg+xml',
                    'webp'  => 'image/webp',
                    'json'  => 'application/json',
                    'woff'  => 'font/woff',
                    'woff2' => 'font/woff2',
                    'ttf'   => 'font/ttf',
                    'css'   => 'text/css',
                    'js'    => 'application/javascript',
                    'ico'   => 'image/x-icon',
                ];
                $ext = strtolower(pathinfo($real, PATHINFO_EXTENSION));
                $content_type = $mime_types[$ext] ?? 'application/octet-stream';

                header('Content-Type: ' . $content_type);
                // Files under /images/ keep their filename across builds (unlike
                // the content-hashed JS/CSS), so a long immutable cache would
                // pin visitors to a stale photo after an asset is replaced.
                header('Cache-Control: public, max-age=3600');
                readfile($real);
                exit;
            }
        }
    }
}
add_action('init', 'samudra_serve_static_assets', 1);

// ─── Cache policy: never cache the SPA shell or REST data ───────────
//
// The HTML shell links to content-hashed JS/CSS that change on every
// `build:wp` (old files are deleted). If a cache layer stores the shell it
// keeps pointing at deleted asset hashes -> 404 -> white page.
function samudra_no_cache_html_shell() {
    if (is_admin()) {
        return;
    }
    header_remove('Cache-Control');
    nocache_headers();
    header('X-LiteSpeed-Cache-Control: no-cache');
}
add_action('template_redirect', 'samudra_no_cache_html_shell');

function samudra_no_cache_rest($response) {
    if ($response instanceof WP_REST_Response) {
        $response->header('Cache-Control', 'no-cache, no-store, must-revalidate');
        $response->header('X-LiteSpeed-Cache-Control', 'no-cache');
    }
    return $response;
}
add_filter('rest_post_dispatch', 'samudra_no_cache_rest', 10, 1);

// ─── Flush rewrite rules on theme activation ────────────────────────
function samudra_activate() {
    samudra_rewrite_rules();
    flush_rewrite_rules();
}
add_action('after_switch_theme', 'samudra_activate');

// ─── Site data (seeded from theme/data/*.json) ──────────────────────

/**
 * Content sections. Every key needs a matching src/data/<key>.json seed file
 * (copied to theme/data by `npm run build:wp`) and automatically gets its own
 * admin page under "Site Content", in this order.
 */
function samudra_get_seed_keys() {
    return [
        'global',
        'home',
        'about',
        'people',
        'services',
        'news',
        'contact',
        'career',
        'privacyPolicy',
        'notFound',
    ];
}

function samudra_section_labels() {
    return [
        'global'        => 'Global (Header & Footer)',
        'home'          => 'Home Page',
        'about'         => 'About Page',
        'people'        => 'People Page',
        'services'      => 'Services Page',
        'news'          => 'News Page',
        'contact'       => 'Contact (Request a Proposal)',
        'career'        => 'Career Page',
        'privacyPolicy' => 'Privacy Policy',
        'notFound'      => '404 Page',
    ];
}

function samudra_get_default_seeds() {
    $data_dir = get_template_directory() . '/data/';
    $seeds = [];
    foreach (samudra_get_seed_keys() as $key) {
        $file_path = $data_dir . $key . '.json';
        if (file_exists($file_path)) {
            $seeds[$key] = json_decode(file_get_contents($file_path), true);
        } else {
            $seeds[$key] = [];
        }
    }
    return $seeds;
}

/**
 * Recursively generate an empty template matching an array schema, so new
 * repeater rows start with the right field structure. Nested lists start
 * empty (the admin renderer still knows their row shape from the seed).
 */
function samudra_get_empty_template($item) {
    if (!is_array($item)) {
        return "";
    }
    $template = [];
    foreach ($item as $k => $v) {
        if (samudra_is_list($v)) {
            $template[$k] = [];
        } else {
            $template[$k] = is_array($v) ? samudra_get_empty_template($v) : "";
        }
    }
    return $template;
}

/**
 * True when an array is meant to be a sequential list (all keys numeric or
 * "new_"-prefixed, as produced by the add-row JS).
 */
function samudra_is_numeric_array($data) {
    if (!is_array($data)) {
        return false;
    }
    foreach (array_keys($data) as $key) {
        if (!is_int($key) && !ctype_digit((string) $key) && strpos((string) $key, 'new_') !== 0) {
            return false;
        }
    }
    return true;
}

/** True when a seed node is a list (a repeater), including an empty one. */
function samudra_is_list($data) {
    return is_array($data) && ($data === [] || array_keys($data) === range(0, count($data) - 1));
}

/**
 * Recursively reindex numerical arrays so JSON output stays sequential.
 *
 * Row order follows the order fields appear in the POST body (i.e. DOM order),
 * which is what makes the ▲/▼ reorder buttons work.
 */
function samudra_reindex_arrays($data) {
    if (!is_array($data)) {
        return $data;
    }

    $clean = [];
    foreach ($data as $k => $v) {
        if ($k === '__INDEX__') {
            continue;
        }
        $clean[$k] = samudra_reindex_arrays($v);
    }

    if (samudra_is_numeric_array($clean) && !empty($clean)) {
        return array_values($clean);
    }

    return $clean;
}

/** True when every leaf of a value is an empty string. */
function samudra_is_blank($value) {
    if (is_array($value)) {
        foreach ($value as $v) {
            if (!samudra_is_blank($v)) {
                return false;
            }
        }
        return true;
    }
    return trim((string) $value) === '';
}

/**
 * Drop list rows the editor added but left completely empty, so a stray
 * "+ Add" click does not put a blank nav item or office line on the site.
 */
function samudra_drop_blank_rows($data) {
    if (!is_array($data)) {
        return $data;
    }
    $is_list = samudra_is_list($data);
    $clean = [];
    foreach ($data as $k => $v) {
        if ($is_list && samudra_is_blank($v)) {
            continue;
        }
        $clean[$k] = samudra_drop_blank_rows($v);
    }
    return $is_list ? array_values($clean) : $clean;
}

/**
 * Restore keys a form submission cannot carry. A repeater whose rows were all
 * removed posts nothing at all, so without this the key would vanish from the
 * option — the site would fall back to the seed rows and the admin page would
 * lose the repeater entirely. Missing lists become [], missing groups are
 * rebuilt from the seed's shape, missing scalars become "".
 */
function samudra_fill_missing($data, $schema) {
    if (!is_array($schema) || samudra_is_list($schema)) {
        return $data;
    }
    if (!is_array($data)) {
        $data = [];
    }
    foreach ($schema as $k => $v) {
        if (!array_key_exists($k, $data)) {
            if (samudra_is_list($v)) {
                $data[$k] = [];
            } elseif (is_array($v)) {
                $data[$k] = samudra_fill_missing([], $v);
            } else {
                $data[$k] = '';
            }
        } elseif (is_array($v) && !samudra_is_list($v)) {
            $data[$k] = samudra_fill_missing($data[$k], $v);
        }
    }
    return $data;
}

/**
 * Get site data for a section, seeding it from JSON if the option is empty.
 */
function samudra_get_site_data($key = null) {
    $seeds = samudra_get_default_seeds();

    $resolve = function ($k, $default) {
        $option_name = 'samudra_data_' . $k;
        $val = get_option($option_name, null);

        if ($val === null || $val === false || $val === '') {
            update_option($option_name, $default);
            $val = $default;
        } elseif (is_string($val)) {
            $decoded = json_decode($val, true);
            $val = (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) ? $decoded : $default;
        } elseif (!is_array($val)) {
            $val = $default;
        }

        return samudra_reindex_arrays($val);
    };

    if ($key !== null) {
        if (!array_key_exists($key, $seeds)) {
            return null;
        }
        return $resolve($key, $seeds[$key]);
    }

    $all = [];
    foreach ($seeds as $k => $default) {
        $all[$k] = $resolve($k, $default);
    }
    return $all;
}

// ─── REST API ───────────────────────────────────────────────────────
add_action('rest_api_init', function () {
    // GET /samudra/v1/data
    register_rest_route('samudra/v1', '/data', [
        'methods'             => WP_REST_Server::READABLE,
        'callback'            => function () {
            return new WP_REST_Response(samudra_get_site_data(), 200);
        },
        'permission_callback' => '__return_true',
    ]);

    // GET /samudra/v1/data/<key>
    register_rest_route('samudra/v1', '/data/(?P<key>[a-zA-Z0-9_\-]+)', [
        'methods'             => WP_REST_Server::READABLE,
        'callback'            => function ($request) {
            $data = samudra_get_site_data($request['key']);
            if ($data === null) {
                return new WP_Error('samudra_invalid_key', 'Invalid data key requested', ['status' => 404]);
            }
            return new WP_REST_Response($data, 200);
        },
        'permission_callback' => '__return_true',
    ]);
});

// ─── One-off upgrades of stored data ────────────────────────────────
//
// Runs once per version bump, on the first request after a deploy.
// v2 (redesign, Oct 2026): the six About sub-pages became one About page and
// /people, and "Special Projects" became "Special Project".
// v3: the footer shows the Samudra mark, a new Site Content field
// (Global → Footer → Logo). Stored content gets it added, everything else
// edited in wp-admin is kept.
// v4: the News & Event page background photo arrived; an empty News Page →
// Background Image gets it.
// v5: the Career page has the team photo as background; it replaces the old
// default (a photo picked in wp-admin stays).
function samudra_maybe_upgrade() {
    $version = (int) get_option('samudra_schema_version', 1);
    if ($version >= 5) {
        return;
    }
    if ($version < 2) {
        foreach (['aboutHistory', 'aboutCompany', 'aboutVision', 'aboutValues', 'aboutManagement', 'aboutAwards'] as $key) {
            delete_option('samudra_data_' . $key);
        }
        $old = get_term_by('slug', 'special-projects', 'portfolio_category');
        if ($old && !term_exists('special-project', 'portfolio_category')) {
            wp_update_term($old->term_id, 'portfolio_category', ['name' => 'Special Project', 'slug' => 'special-project']);
        }
        samudra_rewrite_rules();
        flush_rewrite_rules();
    }
    if ($version < 3) {
        $global = samudra_get_site_data('global');
        $seed = samudra_get_default_seeds()['global']['footer']['logo'] ?? '';
        if (is_array($global) && empty($global['footer']['logo']) && $seed !== '') {
            $global['footer'] = ['logo' => $seed] + (is_array($global['footer'] ?? null) ? $global['footer'] : []);
            update_option('samudra_data_global', $global);
        }
    }
    if ($version < 4) {
        $news = samudra_get_site_data('news');
        $seed = samudra_get_default_seeds()['news']['backgroundImage'] ?? '';
        if (is_array($news) && empty($news['backgroundImage']) && $seed !== '') {
            $news['backgroundImage'] = $seed;
            update_option('samudra_data_news', $news);
        }
    }
    if ($version < 5) {
        $career = samudra_get_site_data('career');
        $seed = samudra_get_default_seeds()['career']['heroImage'] ?? '';
        $old = $career['heroImage'] ?? '';
        if (is_array($career) && $seed !== '' && ($old === '' || $old === '/images/career/hero.webp')) {
            $career['heroImage'] = $seed;
            update_option('samudra_data_career', $career);
        }
    }
    update_option('samudra_schema_version', 5);
}
add_action('init', 'samudra_maybe_upgrade', 20);

// ─── Custom Post Types (Portfolio / Career) + News relabel ──────────
require_once get_template_directory() . '/inc/post-types.php';

// ─── Request a Proposal + Career Application forms ──────────────────
require_once get_template_directory() . '/inc/forms.php';

// ─── Admin: "Site Content" pages ────────────────────────────────────
require_once get_template_directory() . '/inc/admin-sections.php';
