<?php
/**
 * The two site forms (New Design.pdf + the form specs in the design brief):
 *
 *  - Request a Proposal  /contact  → POST samudra/v1/forms/proposal
 *  - Career Application  /career   → POST samudra/v1/forms/application
 *
 * Every submission is stored as a private post (wp-admin → Proposal Requests
 * / Applications) with its attachments, and announced by e-mail to the
 * addresses in Site Content → Form Settings. Attachments live in
 * uploads/samudra-forms/, which the web server refuses to serve; admins
 * download them through admin-post.php.
 *
 * Mail goes through wp_mail(). On a server without working mail, configure
 * SMTP with a plugin such as WP Mail SMTP, or define SAMUDRA_SMTP_HOST (and
 * optionally _PORT, _USER, _PASS, _SECURE) plus SAMUDRA_MAIL_FROM in
 * wp-config.php — the local Docker setup does this to deliver to Mailpit.
 */

if (!defined('ABSPATH')) {
    exit;
}

const SAMUDRA_FORM_DIR = 'samudra-forms';
const SAMUDRA_FORM_MAX_FILE = 10 * 1024 * 1024;

// ─── What each form accepts ─────────────────────────────────────────
//
// `options` names the list a value must come from; `max` is a character
// limit. Labels come from Site Content so the admin and the e-mail use the
// same wording as the site.
function samudra_form_specs() {
    return [
        'proposal' => [
            'post_type' => 'proposal_request',
            'section'   => 'contact',
            'fields'    => [
                'company'       => ['required' => true, 'max' => 200],
                'contactPerson' => ['required' => true, 'max' => 200],
                'jobTitle'      => ['max' => 200],
                'email'         => ['required' => true, 'type' => 'email'],
                'phone'         => ['required' => true, 'max' => 60],
                'service'       => ['required' => true, 'options' => 'service'],
                'projectName'   => ['required' => true, 'max' => 300],
                'location'      => ['required' => true, 'max' => 300],
                'date'          => ['required' => true, 'max' => 150],
                'scale'         => ['required' => true, 'max' => 300],
                'budget'        => ['required' => true, 'max' => 200],
                'source'        => ['options' => 'source'],
                'brief'         => ['required' => true, 'max' => 2000, 'type' => 'textarea'],
            ],
            'files'     => [
                'documents' => ['max_files' => 5, 'ext' => ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']],
            ],
            'columns'   => ['contactPerson' => 'Contact Person', 'service' => 'Service', 'projectName' => 'Event / Project'],
        ],
        'application' => [
            'post_type' => 'job_application',
            'section'   => 'career',
            'fields'    => [
                'firstName'    => ['required' => true, 'max' => 100],
                'lastName'     => ['required' => true, 'max' => 100],
                'email'        => ['required' => true, 'type' => 'email'],
                'phone'        => ['required' => true, 'max' => 60],
                'position'     => ['required' => true, 'options' => 'position'],
                'location'     => ['required' => true, 'max' => 200],
                'jobTitle'     => ['max' => 200],
                'experience'   => ['max' => 50],
                'linkedin'     => ['type' => 'url'],
                'portfolioUrl' => ['type' => 'url'],
                'motivation'   => ['max' => 1000, 'type' => 'textarea'],
            ],
            'files'     => [
                'resume'        => ['max_files' => 1, 'ext' => ['pdf', 'doc', 'docx'], 'required' => true],
                'portfolioFile' => ['max_files' => 1, 'ext' => ['pdf', 'doc', 'docx']],
            ],
            'columns'   => ['position' => 'Position', 'email' => 'Email', 'phone' => 'Phone'],
        ],
    ];
}

/** Field label as shown on the site (Site Content → Contact / Career → Form). */
function samudra_form_label($kind, $field) {
    $specs = samudra_form_specs();
    $data = samudra_get_site_data($specs[$kind]['section']);
    $label = $data['form']['fields'][$field]['label'] ?? '';
    return $label !== '' ? $label : samudra_humanize_key($field);
}

/** Open positions: published, no closing date or closing today or later. */
function samudra_open_positions() {
    $today = wp_date('Y-m-d');
    $titles = [];
    foreach (get_posts(['post_type' => 'career', 'post_status' => 'publish', 'numberposts' => -1]) as $post) {
        $closes = get_post_meta($post->ID, 'career_closing_date', true);
        if (!$closes || $closes >= $today) {
            // Same text the site shows (title.rendered, decoded).
            $titles[] = html_entity_decode(get_the_title($post), ENT_QUOTES, 'UTF-8');
        }
    }
    return $titles;
}

/** The allowed values of a dropdown field. */
function samudra_form_options($name) {
    if ($name === 'service' || $name === 'source') {
        $form = samudra_get_site_data('contact')['form'] ?? [];
        return array_values(array_filter((array) ($form[$name . 'Options'] ?? []), 'strlen'));
    }
    if ($name === 'position') {
        $general = samudra_get_site_data('career')['form']['generalApplicationLabel'] ?? '';
        return array_values(array_filter(array_merge(samudra_open_positions(), [$general]), 'strlen'));
    }
    return [];
}

// ─── Post types that hold the submissions ───────────────────────────
add_action('init', function () {
    $common = [
        'public'              => false,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'show_in_rest'        => false,
        'exclude_from_search' => true,
        'supports'            => ['title'],
        'capability_type'     => 'post',
        // Submissions only come from the site, never from "Add New".
        'capabilities'        => ['create_posts' => 'do_not_allow'],
        'map_meta_cap'        => true,
    ];
    register_post_type('proposal_request', $common + [
        'labels'        => [
            'name'          => 'Proposal Requests',
            'singular_name' => 'Proposal Request',
            'edit_item'     => 'Proposal Request',
            'all_items'     => 'All Proposal Requests',
            'search_items'  => 'Search Proposal Requests',
            'not_found'     => 'No proposal requests yet',
            'menu_name'     => 'Proposal Requests',
        ],
        'menu_icon'     => 'dashicons-email-alt',
        'menu_position' => 7,
    ]);
    register_post_type('job_application', $common + [
        'labels'        => [
            'name'          => 'Applications',
            'singular_name' => 'Application',
            'edit_item'     => 'Application',
            'all_items'     => 'All Applications',
            'search_items'  => 'Search Applications',
            'not_found'     => 'No applications yet',
            'menu_name'     => 'Applications',
        ],
        'menu_icon'     => 'dashicons-id-alt',
        'menu_position' => 8,
    ]);
});

function samudra_form_kind_of_post_type($post_type) {
    foreach (samudra_form_specs() as $kind => $spec) {
        if ($spec['post_type'] === $post_type) {
            return $kind;
        }
    }
    return null;
}

// ─── Attachments directory (never served directly) ──────────────────
function samudra_form_dir() {
    $dir = trailingslashit(wp_upload_dir()['basedir']) . SAMUDRA_FORM_DIR;
    if (!is_dir($dir) && !wp_mkdir_p($dir)) {
        error_log('[samudra] cannot create ' . $dir . ' — is wp-content/uploads writable by the web server?');
        return $dir;
    }
    if (!file_exists($dir . '/.htaccess')) {
        file_put_contents($dir . '/.htaccess', "Require all denied\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
    }
    if (!file_exists($dir . '/index.php')) {
        file_put_contents($dir . '/index.php', "<?php\n// Silence is golden.\n");
    }
    return $dir;
}

/** Normalise $_FILES[field] into a list of single-file arrays. */
function samudra_form_file_list($entry) {
    if (!is_array($entry) || !isset($entry['name'])) {
        return [];
    }
    if (!is_array($entry['name'])) {
        return $entry['error'] === UPLOAD_ERR_NO_FILE ? [] : [$entry];
    }
    $list = [];
    foreach (array_keys($entry['name']) as $i) {
        if ($entry['error'][$i] === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        $list[] = [
            'name'     => $entry['name'][$i],
            'type'     => $entry['type'][$i],
            'tmp_name' => $entry['tmp_name'][$i],
            'error'    => $entry['error'][$i],
            'size'     => $entry['size'][$i],
        ];
    }
    return $list;
}

/** Biggest file the server accepts, capped at 10 MB. */
function samudra_form_max_file() {
    return min(SAMUDRA_FORM_MAX_FILE, (int) wp_max_upload_size());
}

/** Error message for one uploaded file, or '' when it is acceptable. */
function samudra_form_check_file($file, $ext_allowed) {
    $name = sanitize_file_name($file['name']);
    if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE || $file['size'] > samudra_form_max_file()) {
        return sprintf('"%s" is larger than %d MB.', $name, floor(samudra_form_max_file() / MB_IN_BYTES));
    }
    if ($file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
        return sprintf('"%s" could not be uploaded. Please try again.', $name);
    }
    $mimes = array_filter(get_allowed_mime_types(), function ($exts) use ($ext_allowed) {
        return (bool) array_intersect(explode('|', $exts), $ext_allowed);
    }, ARRAY_FILTER_USE_KEY);
    $check = wp_check_filetype_and_ext($file['tmp_name'], $file['name'], $mimes);
    if (empty($check['ext']) || !in_array(strtolower($check['ext']), $ext_allowed, true)) {
        return sprintf('"%s" is not an accepted file type.', $name);
    }
    return '';
}

// ─── Submission endpoint ────────────────────────────────────────────
add_action('rest_api_init', function () {
    foreach (array_keys(samudra_form_specs()) as $kind) {
        register_rest_route('samudra/v1', '/forms/' . $kind, [
            'methods'             => WP_REST_Server::CREATABLE,
            'permission_callback' => '__return_true',
            'callback'            => function (WP_REST_Request $request) use ($kind) {
                return samudra_handle_form($kind, $request);
            },
        ]);
    }
});

function samudra_form_error($message, $status = 400, $fields = []) {
    return new WP_Error('samudra_form', $message, ['status' => $status, 'fields' => (object) $fields]);
}

function samudra_handle_form($kind, WP_REST_Request $request) {
    $spec = samudra_form_specs()[$kind];

    // A body over post_max_size reaches PHP as nothing at all.
    if (empty($_POST) && empty($_FILES) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
        return samudra_form_error('The attached files are too large to send together. Please send fewer or smaller files.', 413);
    }

    // Already unslashed by the REST server.
    $params = $request->get_body_params();

    // Bots: the hidden "website" field filled in, or sent within 3 seconds.
    // They get a normal-looking success and nothing is stored or sent.
    if (trim((string) ($params['website'] ?? '')) !== '' || (int) ($params['elapsed'] ?? 0) < 3) {
        return new WP_REST_Response(['ok' => true], 200);
    }

    // At most 5 submissions per form per visitor every 10 minutes.
    $ip = sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? '');
    $rate_key = 'samudra_rl_' . md5($kind . '|' . $ip);
    $count = (int) get_transient($rate_key);
    if ($count >= 5) {
        return samudra_form_error('Too many submissions from this connection. Please try again in a few minutes.', 429);
    }

    // ── Validate fields ─────────────────────────────────────────────
    $values = [];
    $errors = [];
    foreach ($spec['fields'] as $name => $rules) {
        $raw = isset($params[$name]) ? (string) $params[$name] : '';
        $value = ($rules['type'] ?? '') === 'textarea' ? sanitize_textarea_field($raw) : sanitize_text_field($raw);
        $label = samudra_form_label($kind, $name);

        if ($value === '') {
            if (!empty($rules['required'])) {
                $errors[$name] = sprintf('%s is required.', $label);
            }
            $values[$name] = '';
            continue;
        }
        if (!empty($rules['max']) && mb_strlen($value) > $rules['max']) {
            $errors[$name] = sprintf('%s can be at most %d characters.', $label, $rules['max']);
        }
        if (($rules['type'] ?? '') === 'email' && !is_email($value)) {
            $errors[$name] = 'Please enter a valid email address.';
        }
        if (($rules['type'] ?? '') === 'url') {
            $url = esc_url_raw($value, ['http', 'https']);
            if (!$url || !wp_http_validate_url($url)) {
                $errors[$name] = 'Please enter a full link starting with https://';
            }
            $value = $url;
        }
        if (!empty($rules['options']) && !in_array($value, samudra_form_options($rules['options']), true)) {
            $errors[$name] = sprintf('Please choose one of the %s options.', $label);
        }
        $values[$name] = $value;
    }

    if (empty($params['consent'])) {
        $errors['consent'] = 'Please agree before sending.';
    }

    // ── Validate files ──────────────────────────────────────────────
    $uploads = [];
    $file_params = $request->get_file_params();
    foreach ($spec['files'] as $name => $rules) {
        // "documents[]" in the FormData arrives as $_FILES['documents'].
        $list = samudra_form_file_list($file_params[$name] ?? null);
        if (!$list && !empty($rules['required'])) {
            $errors[$name] = sprintf('%s is required.', samudra_form_label($kind, $name));
            continue;
        }
        if (count($list) > $rules['max_files']) {
            $errors[$name] = sprintf('You can attach up to %d file%s.', $rules['max_files'], $rules['max_files'] === 1 ? '' : 's');
            continue;
        }
        foreach ($list as $file) {
            $problem = samudra_form_check_file($file, $rules['ext']);
            if ($problem) {
                $errors[$name] = $problem;
                break;
            }
            $uploads[] = ['field' => $name, 'file' => $file];
        }
    }

    if ($errors) {
        return samudra_form_error('Please check the highlighted fields.', 400, $errors);
    }

    // ── Store ───────────────────────────────────────────────────────
    $dir = samudra_form_dir();
    $stored = [];
    foreach ($uploads as $upload) {
        $original = sanitize_file_name($upload['file']['name']);
        $target = wp_generate_password(24, false) . '-' . $original;
        if (!move_uploaded_file($upload['file']['tmp_name'], $dir . '/' . $target)) {
            foreach ($stored as $s) {
                @unlink($dir . '/' . $s['file']);
            }
            return samudra_form_error('Your files could not be saved. Please try again.', 500);
        }
        $stored[] = [
            'field' => $upload['field'],
            'name'  => $original,
            'file'  => $target,
            'size'  => (int) $upload['file']['size'],
        ];
    }

    $title = $kind === 'proposal'
        ? $values['company'] . ' — ' . $values['projectName']
        : trim($values['firstName'] . ' ' . $values['lastName']) . ' — ' . $values['position'];

    $post_id = wp_insert_post([
        'post_type'   => $spec['post_type'],
        'post_status' => 'publish',
        'post_title'  => wp_strip_all_tags($title),
    ], true);
    if (is_wp_error($post_id)) {
        foreach ($stored as $s) {
            @unlink($dir . '/' . $s['file']);
        }
        return samudra_form_error('Your submission could not be saved. Please try again.', 500);
    }
    foreach ($values as $name => $value) {
        update_post_meta($post_id, '_sf_' . $name, wp_slash($value));
    }
    update_post_meta($post_id, '_sf_files', wp_slash($stored));
    update_post_meta($post_id, '_sf_consent', current_time('mysql'));

    set_transient($rate_key, $count + 1, 10 * MINUTE_IN_SECONDS);

    samudra_form_notify($kind, $post_id, $values, $stored);

    return new WP_REST_Response(['ok' => true], 200);
}

// ─── E-mail ─────────────────────────────────────────────────────────

/** Recipients of a form's notifications (Site Content → Form Settings). */
function samudra_form_recipients($kind) {
    $settings = get_option('samudra_form_settings', []);
    $list = array_filter(array_map('trim', preg_split('/[\s,;]+/', (string) ($settings[$kind] ?? ''))), 'is_email');
    return $list ?: [get_option('admin_email')];
}

function samudra_form_notify($kind, $post_id, $values, $stored) {
    $spec = samudra_form_specs()[$kind];
    $lines = [];
    foreach ($spec['fields'] as $name => $rules) {
        if (($values[$name] ?? '') === '') {
            continue;
        }
        $label = samudra_form_label($kind, $name);
        $lines[] = $label . (preg_match('/[?:]$/', $label) ? '' : ':') . "\n" . $values[$name] . "\n";
    }
    if ($stored) {
        $lines[] = "Attachments (download them in wp-admin):";
        foreach ($stored as $s) {
            $lines[] = sprintf('- %s (%s)', $s['name'], size_format($s['size']));
        }
        $lines[] = '';
    }
    $lines[] = 'Open in wp-admin: ' . admin_url('post.php?post=' . $post_id . '&action=edit');

    if ($kind === 'proposal') {
        $subject = sprintf('New proposal request: %s (%s)', $values['projectName'], $values['company']);
        $reply_name = $values['contactPerson'];
    } else {
        $subject = sprintf('New job application: %s — %s', trim($values['firstName'] . ' ' . $values['lastName']), $values['position']);
        $reply_name = trim($values['firstName'] . ' ' . $values['lastName']);
    }
    $headers = ['Reply-To: ' . str_replace(['"', "\r", "\n"], '', $reply_name) . ' <' . $values['email'] . '>'];

    if (!wp_mail(samudra_form_recipients($kind), $subject, implode("\n", $lines), $headers)) {
        // The submission is safely stored either way.
        error_log('[samudra] notification e-mail for ' . $kind . ' #' . $post_id . ' could not be sent.');
    }
}

add_action('phpmailer_init', function ($mailer) {
    if (!defined('SAMUDRA_SMTP_HOST') || !SAMUDRA_SMTP_HOST) {
        return;
    }
    $mailer->isSMTP();
    $mailer->Host = SAMUDRA_SMTP_HOST;
    $mailer->Port = defined('SAMUDRA_SMTP_PORT') ? (int) SAMUDRA_SMTP_PORT : 587;
    $secure = defined('SAMUDRA_SMTP_SECURE') ? (string) SAMUDRA_SMTP_SECURE : '';
    $mailer->SMTPSecure = $secure;
    $mailer->SMTPAutoTLS = $secure !== '';
    if (defined('SAMUDRA_SMTP_USER') && SAMUDRA_SMTP_USER) {
        $mailer->SMTPAuth = true;
        $mailer->Username = SAMUDRA_SMTP_USER;
        $mailer->Password = defined('SAMUDRA_SMTP_PASS') ? SAMUDRA_SMTP_PASS : '';
    }
});

add_filter('wp_mail_from', function ($from) {
    return defined('SAMUDRA_MAIL_FROM') && SAMUDRA_MAIL_FROM ? SAMUDRA_MAIL_FROM : $from;
});

add_filter('wp_mail_from_name', function ($name) {
    return $name === 'WordPress' ? 'Samudra Website' : $name;
});

// ─── wp-admin: list columns ─────────────────────────────────────────
foreach (samudra_form_specs() as $samudra_kind => $samudra_spec) {
    $type = $samudra_spec['post_type'];

    add_filter("manage_{$type}_posts_columns", function ($columns) use ($samudra_spec) {
        $out = ['cb' => $columns['cb'], 'title' => 'Submission'];
        foreach ($samudra_spec['columns'] as $name => $label) {
            $out['sf_' . $name] = $label;
        }
        $out['sf_files'] = 'Files';
        $out['date'] = 'Received';
        return $out;
    });

    add_action("manage_{$type}_posts_custom_column", function ($column, $post_id) {
        if ($column === 'sf_files') {
            $files = get_post_meta($post_id, '_sf_files', true);
            echo esc_html(is_array($files) ? count($files) : 0);
            return;
        }
        if (strpos($column, 'sf_') === 0) {
            echo esc_html(get_post_meta($post_id, '_' . $column, true));
        }
    }, 10, 2);

}
unset($samudra_kind, $samudra_spec, $type);

// Edit links on the list: "View" makes no sense for a private submission.
add_filter('post_row_actions', function ($actions, $post) {
    if (samudra_form_kind_of_post_type($post->post_type)) {
        unset($actions['view'], $actions['inline hide-if-no-js']);
    }
    return $actions;
}, 10, 2);

// ─── wp-admin: the submission itself ────────────────────────────────
add_action('add_meta_boxes', function () {
    foreach (samudra_form_specs() as $kind => $spec) {
        add_meta_box('samudra_submission', 'Submission', 'samudra_render_submission', $spec['post_type'], 'normal', 'high', ['kind' => $kind]);
    }
});

function samudra_render_submission($post, $box) {
    $kind = $box['args']['kind'];
    $spec = samudra_form_specs()[$kind];
    echo '<style>.sf-table{width:100%;border-collapse:collapse}.sf-table th{width:240px;text-align:left;vertical-align:top;padding:10px 12px 10px 0;color:#50575e;font-weight:600}.sf-table td{padding:10px 0;vertical-align:top;white-space:pre-wrap;word-break:break-word}.sf-table tr+tr th,.sf-table tr+tr td{border-top:1px solid #f0f0f1}</style>';
    echo '<table class="sf-table">';
    foreach ($spec['fields'] as $name => $rules) {
        $value = get_post_meta($post->ID, '_sf_' . $name, true);
        if ($value === '') {
            $value = '—';
        }
        echo '<tr><th>' . esc_html(samudra_form_label($kind, $name)) . '</th><td>';
        if (($rules['type'] ?? '') === 'email' && $value !== '—') {
            echo '<a href="mailto:' . esc_attr($value) . '">' . esc_html($value) . '</a>';
        } elseif (($rules['type'] ?? '') === 'url' && $value !== '—') {
            echo '<a href="' . esc_url($value) . '" target="_blank" rel="noopener noreferrer">' . esc_html($value) . '</a>';
        } else {
            echo esc_html($value);
        }
        echo '</td></tr>';
    }

    $files = get_post_meta($post->ID, '_sf_files', true);
    foreach ($spec['files'] as $field => $rules) {
        echo '<tr><th>' . esc_html(samudra_form_label($kind, $field)) . '</th><td>';
        $any = false;
        foreach ((is_array($files) ? $files : []) as $i => $f) {
            if ($f['field'] !== $field) {
                continue;
            }
            $any = true;
            $url = wp_nonce_url(admin_url('admin-post.php?action=samudra_form_file&post=' . $post->ID . '&file=' . $i), 'samudra_form_file_' . $post->ID . '_' . $i);
            echo '<a class="button" href="' . esc_url($url) . '">⬇ ' . esc_html($f['name']) . '</a> <span style="color:#787c82">' . esc_html(size_format($f['size'])) . '</span><br>';
        }
        echo $any ? '' : '—';
        echo '</td></tr>';
    }

    $consent = get_post_meta($post->ID, '_sf_consent', true);
    echo '<tr><th>Privacy consent</th><td>' . ($consent ? 'Given on ' . esc_html(mysql2date('j F Y, H:i', $consent)) : '—') . '</td></tr>';
    echo '</table>';
}

// Attachment download for admins only.
add_action('admin_post_samudra_form_file', function () {
    $post_id = absint($_GET['post'] ?? 0);
    $index = absint($_GET['file'] ?? 0);
    check_admin_referer('samudra_form_file_' . $post_id . '_' . $index);
    if (!current_user_can('edit_post', $post_id) || !samudra_form_kind_of_post_type(get_post_type($post_id))) {
        wp_die('You are not allowed to download this file.', 403);
    }
    $files = get_post_meta($post_id, '_sf_files', true);
    $f = is_array($files) ? ($files[$index] ?? null) : null;
    $dir = realpath(samudra_form_dir());
    $path = $f ? realpath($dir . '/' . $f['file']) : false;
    if (!$path || strpos($path, $dir . DIRECTORY_SEPARATOR) !== 0 || !is_file($path)) {
        wp_die('File not found.', 404);
    }
    nocache_headers();
    header('Content-Type: ' . (wp_check_filetype($path)['type'] ?: 'application/octet-stream'));
    header('Content-Disposition: attachment; filename="' . str_replace('"', '', $f['name']) . '"');
    header('Content-Length: ' . filesize($path));
    readfile($path);
    exit;
});

// Deleting a submission deletes its files.
add_action('before_delete_post', function ($post_id) {
    if (!samudra_form_kind_of_post_type(get_post_type($post_id))) {
        return;
    }
    $files = get_post_meta($post_id, '_sf_files', true);
    $dir = samudra_form_dir();
    foreach (is_array($files) ? $files : [] as $f) {
        @unlink($dir . '/' . basename($f['file']));
    }
});

// ─── wp-admin: Site Content → Form Settings ─────────────────────────
add_action('admin_menu', function () {
    add_submenu_page('samudra-site-content', 'Form Settings', 'Form Settings', 'manage_options', 'samudra-form-settings', 'samudra_form_settings_page');
}, 20);

function samudra_form_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    $saved = false;
    if (isset($_POST['samudra_form_settings']) && check_admin_referer('samudra_form_settings')) {
        $clean = [];
        foreach (array_keys(samudra_form_specs()) as $kind) {
            $raw = (string) wp_unslash($_POST['samudra_form_settings'][$kind] ?? '');
            $emails = array_filter(array_map('trim', preg_split('/[\s,;]+/', $raw)), 'is_email');
            $clean[$kind] = implode(', ', $emails);
        }
        update_option('samudra_form_settings', $clean, false);
        $saved = true;
    }
    $settings = get_option('samudra_form_settings', []);
    $labels = ['proposal' => 'Request a Proposal → notify', 'application' => 'Career Application → notify'];
    $smtp = defined('SAMUDRA_SMTP_HOST') && SAMUDRA_SMTP_HOST;
    ?>
    <div class="wrap">
        <h1>Form Settings</h1>
        <p style="max-width:760px;">Who receives an e-mail for every new submission. Separate several addresses with commas. When a field is empty, the site administrator (<?php echo esc_html(get_option('admin_email')); ?>) is notified. Submissions are always kept under <strong>Proposal Requests</strong> and <strong>Applications</strong>, even if an e-mail fails.</p>
        <?php if ($saved): ?>
            <div class="notice notice-success is-dismissible"><p><strong>Saved.</strong></p></div>
        <?php endif; ?>
        <form method="post">
            <?php wp_nonce_field('samudra_form_settings'); ?>
            <table class="form-table" role="presentation">
                <?php foreach ($labels as $kind => $label): ?>
                    <tr>
                        <th scope="row"><label for="sfs-<?php echo esc_attr($kind); ?>"><?php echo esc_html($label); ?></label></th>
                        <td><input type="text" class="large-text" id="sfs-<?php echo esc_attr($kind); ?>" name="samudra_form_settings[<?php echo esc_attr($kind); ?>]" value="<?php echo esc_attr($settings[$kind] ?? ''); ?>" placeholder="<?php echo esc_attr(get_option('admin_email')); ?>"></td>
                    </tr>
                <?php endforeach; ?>
            </table>
            <?php submit_button('Save Settings'); ?>
        </form>
        <h2>E-mail delivery</h2>
        <p style="max-width:760px;">
            <?php if ($smtp): ?>
                Sending through SMTP server <code><?php echo esc_html(SAMUDRA_SMTP_HOST); ?></code> (set in wp-config.php).
            <?php else: ?>
                Using the server's default mail. If notifications do not arrive, configure SMTP with a plugin such as <em>WP Mail SMTP</em>, or define <code>SAMUDRA_SMTP_HOST</code> (and <code>_PORT</code>, <code>_USER</code>, <code>_PASS</code>, <code>_SECURE</code>) and <code>SAMUDRA_MAIL_FROM</code> in wp-config.php.
            <?php endif; ?>
            Attachments up to <?php echo esc_html(size_format(samudra_form_max_file())); ?> each are accepted (server limit: <?php echo esc_html(size_format(wp_max_upload_size())); ?>).
        </p>
    </div>
    <?php
}
