<?php
/**
 * "Site Content" admin pages — one page per section key.
 *
 * A single recursive renderer covers every field in the site. On top of the
 * plain scalar/group/repeater handling it understands:
 *
 *  - image fields     — Media Library picker with a live preview, for keys
 *                       like `image`, `logo` or anything ending in `Image`,
 *                       and for every row of an image list such as `logos`
 *  - dropdowns        — `category` lists the live Portfolio Categories,
 *                       `platform` lists the supported social networks,
 *                       `nameSide` places a director's name left or right,
 *                       `headingColor` picks dark or light heading text
 *  - reorderable rows — ▲/▼ move repeater rows; PHP rebuilds the array in the
 *                       order the fields arrive in the POST body
 *
 * The seed JSON (theme/data/<key>.json) is passed alongside the stored value
 * as a schema, so a repeater whose rows were all removed still knows what a
 * new row looks like.
 */

if (!defined('ABSPATH')) {
    exit;
}

// ─── Menu ───────────────────────────────────────────────────────────
add_action('admin_menu', function () {
    $keys = samudra_get_seed_keys();
    $labels = samudra_section_labels();

    add_menu_page(
        'Samudra Site Content',
        'Site Content',
        'manage_options',
        'samudra-site-content',
        'samudra_admin_section_page',
        'dashicons-admin-site-alt3',
        3
    );

    foreach ($keys as $key) {
        $label = $labels[$key] ?? ucfirst($key);
        add_submenu_page(
            'samudra-site-content',
            $label,
            $label,
            'manage_options',
            'samudra-site-content' . ($key === $keys[0] ? '' : '-' . $key),
            'samudra_admin_section_page'
        );
    }
});

// Media Library for the image pickers.
add_action('admin_enqueue_scripts', function () {
    $page = isset($_GET['page']) ? sanitize_text_field($_GET['page']) : '';
    if (strpos($page, 'samudra-site-content') === 0) {
        wp_enqueue_media();
    }
});

/** Resolve the active section key from the admin page slug. */
function samudra_active_section_key() {
    $page = isset($_GET['page']) ? sanitize_text_field($_GET['page']) : '';
    $keys = samudra_get_seed_keys();
    if ($page === 'samudra-site-content') {
        return $keys[0];
    }
    $prefix = 'samudra-site-content-';
    if (strpos($page, $prefix) === 0) {
        $key = substr($page, strlen($prefix));
        if (in_array($key, $keys, true)) {
            return $key;
        }
    }
    return $keys[0];
}

/** Extra guidance shown under a section's title. */
function samudra_section_notes() {
    $categories = admin_url('edit-tags.php?taxonomy=portfolio_category&post_type=portfolio');
    $form_settings = admin_url('admin.php?page=samudra-form-settings');
    return [
        'global'   => 'The offices below are shown in the footer of every page. <strong>Whatsapp</strong>: the floating "Chat with Samudra" button appears on every page once a <strong>Number</strong> is filled in (with country code, e.g. 62812…).',
        'home'     => 'Each service card links to /services with its <strong>Category</strong> preselected. The News strip shows the latest posts from <strong>News</strong>. In headings a line break is a new line on the site.',
        'about'    => 'A blank line in a text starts a new paragraph. In headings a line break is a new line on the site.',
        'people'   => 'Portraits look best at 4:5 (e.g. 800 × 1000 px) on a black background. <strong>Name Side</strong> puts a director\'s name on the left or right of the photo.',
        'services' => 'The <strong>Intro</strong> shows while "All" is selected. The text for each category is that category\'s <strong>Description</strong> under <a href="' . esc_url($categories) . '">Portfolios → Categories</a>. The project cards come from <strong>Portfolios</strong>. <strong>Logos</strong>: white on a transparent background, cropped tight to the logo (no empty margin), about 240 px tall; wide and square logos are balanced automatically.',
        'news'     => 'The articles themselves are managed under <strong>News</strong>. <strong>Background Image</strong> is the photo behind the News & Event page.',
        'contact'  => 'Texts of the Request a Proposal form. Submissions are listed under <strong>Proposal Requests</strong>; who gets the e-mail is set in <a href="' . esc_url($form_settings) . '">Form Settings</a>.',
        'career'   => 'Open positions are managed under <strong>Career</strong> (a position disappears from the site after its closing date). Applications are listed under <strong>Applications</strong>; who gets the e-mail is set in <a href="' . esc_url($form_settings) . '">Form Settings</a>.',
        'privacyPolicy' => 'Linked from both forms. A blank line starts a new paragraph.',
    ];
}

/** "teamMembers" → "Team Members", "our_principle" → "Our Principle". */
function samudra_humanize_key($k) {
    $s = preg_replace('/([a-z0-9])([A-Z])/', '$1 $2', (string) $k);
    $s = str_replace(['_', '-'], ' ', $s);
    return ucwords(trim($s));
}

/** Naive singulariser for "+ Add <thing>" buttons (display only). */
function samudra_singularize($label) {
    $label = trim($label);
    if ($label === '') return 'Item';
    if (substr($label, -3) === 'ies') return substr($label, 0, -3) . 'y';
    if (substr($label, -1) === 's' && substr($label, -2) !== 'ss') return substr($label, 0, -1);
    return $label;
}

/** True when the field should use the Media Library picker. */
function samudra_is_image_key($key) {
    $key = (string) $key;
    return (bool) (preg_match('/^(image|img|photo|picture|logo|banner|cover)$/i', $key)
        || preg_match('/[a-z](Image|Photo|Logo|Banner|Cover)$/', $key));
}

/**
 * The shape of one row of a list: every row merged, so a field that is an
 * empty list in the first row (Home has no nav children) still takes its row
 * shape from a later row that has entries (About's children).
 */
function samudra_list_item_schema($list) {
    if (!is_array($list) || empty($list)) {
        return "";
    }
    $merged = null;
    foreach ($list as $item) {
        if (!is_array($item)) {
            return $merged ?? $item;
        }
        if ($merged === null) {
            $merged = $item;
            continue;
        }
        foreach ($item as $k => $v) {
            if (!array_key_exists($k, $merged)) {
                $merged[$k] = $v;
            } elseif (is_array($v) && samudra_is_list($v) && samudra_is_list($merged[$k])) {
                if (empty($merged[$k]) && !empty($v)) {
                    $merged[$k] = $v;
                }
            } elseif (is_array($v) && is_array($merged[$k])) {
                $merged[$k] = samudra_list_item_schema([$merged[$k], $v]);
            }
        }
    }
    return $merged;
}

/** True when every row of a string list is an image (e.g. `logos`). */
function samudra_is_image_list_key($key) {
    return (bool) preg_match('/^(images|logos|photos|gallery)$/i', (string) $key);
}

/**
 * Dropdown options for a field key, or null when the field is free text.
 * $ctx carries section-level lookups (the live portfolio category list).
 */
function samudra_select_options($key, $ctx = []) {
    if ($key === 'platform') {
        return [
            'facebook'  => 'Facebook',
            'instagram' => 'Instagram',
            'youtube'   => 'YouTube',
            'linkedin'  => 'LinkedIn',
        ];
    }
    if ($key === 'headingColor') {
        return ['dark' => 'Dark (for a light background image)', 'light' => 'Light (for a dark background image)'];
    }
    if ($key === 'nameSide') {
        return ['right' => 'Right', 'left' => 'Left'];
    }
    if ($key === 'category') {
        $opts = ['' => '— none (opens "All") —'];
        foreach ($ctx['categories'] ?? [] as $slug => $name) {
            $opts[$slug] = $name;
        }
        return $opts;
    }
    return null;
}

/** Media Library picker for one image URL. */
function samudra_render_image_input($name_path, $value) {
    $uid = 'samimg_' . substr(md5($name_path), 0, 10);
    echo '<input type="hidden" id="' . esc_attr($uid) . '" name="' . esc_attr($name_path) . '" value="' . esc_attr($value) . '" class="sam-img-input" />';
    echo '<div class="sam-img-preview">';
    if ($value !== '') {
        echo '<img src="' . esc_url($value) . '" alt="" />';
    }
    echo '</div>';
    echo '<button type="button" class="button sam-img-pick" data-target="' . esc_attr($uid) . '">Select Image</button> ';
    echo '<button type="button" class="button sam-img-clear" data-target="' . esc_attr($uid) . '">Remove</button>';
}

/**
 * Render a single repeater row. Must output exactly one root
 * `.samudra-array-row-wrapper` element (the add-row JS clones firstElementChild).
 */
function samudra_render_repeater_row($name, $item, $schema, $ctx = [], $is_template = false, $image_rows = false) {
    $remove_guard = $is_template ? 'true' : "confirm('Remove this entry?')";
    $move = '<button type="button" class="sam-move" data-dir="up" title="Move up">&#9650;</button>'
          . '<button type="button" class="sam-move" data-dir="down" title="Move down">&#9660;</button>';

    if (!is_array($item)) {
        $value = is_scalar($item) ? (string) $item : '';
        echo '<div class="samudra-array-row-wrapper sam-row sam-row-simple' . ($image_rows ? ' sam-row-image' : '') . '">';
        echo '<span class="sam-handle">' . $move . '</span>';
        if ($image_rows) {
            echo '<div class="sam-field sam-field-inline">';
            samudra_render_image_input($name, $value);
            echo '</div>';
        } else {
            echo '<input type="text" name="' . esc_attr($name) . '" value="' . esc_attr($value) . '" class="sam-input" />';
        }
        echo '<button type="button" class="sam-remove sam-remove-x" title="Delete" onclick="if(' . $remove_guard . ') this.closest(\'.samudra-array-row-wrapper\').remove();">&times;</button>';
        echo '</div>';
        return;
    }

    // Row heading: first human-readable field we can find.
    $title = '';
    foreach (['name', 'title', 'heading', 'label', 'city', 'period', 'platform'] as $tk) {
        if (isset($item[$tk]) && is_string($item[$tk]) && $item[$tk] !== '') { $title = $item[$tk]; break; }
    }
    if ($title === '') { $title = $is_template ? 'New entry' : 'Entry'; }

    echo '<div class="samudra-array-row-wrapper sam-row">';
    echo '  <div class="sam-row-head">';
    echo '    <span class="sam-row-title">' . esc_html($title) . '</span>';
    echo '    <span class="sam-row-actions">' . $move;
    echo '      <button type="button" class="sam-remove" onclick="if(' . $remove_guard . ') this.closest(\'.samudra-array-row-wrapper\').remove();">Remove</button>';
    echo '    </span>';
    echo '  </div>';
    echo '  <div class="sam-row-body">';
    foreach ($item as $k => $v) {
        samudra_render_dynamic_fields($name . '[' . $k . ']', $v, $k, samudra_humanize_key($k), $ctx, is_array($schema) ? ($schema[$k] ?? null) : null);
    }
    echo '  </div>';
    echo '</div>';
}

/**
 * Recursive field renderer.
 *
 * The `.samudra-array-*` class hooks and the `__INDEX__` placeholder are
 * required by the save logic and samudraAddArrayItem() — do not rename them.
 */
function samudra_render_dynamic_fields($name_path, $value, $key = '', $label = '', $ctx = [], $schema = null) {
    // A list the editor emptied comes back as "" or []; render it as a list.
    if (samudra_is_list($schema) && !samudra_is_list($value)) {
        $value = [];
    }

    // ── Leaf (scalar) ────────────────────────────────────────────────
    if (!is_array($value)) {
        $value = is_scalar($value) ? (string) $value : '';
        $options = samudra_select_options($key, $ctx);
        if ($options !== null) {
            echo '<div class="sam-field">';
            echo '<label class="sam-field-label">' . esc_html($label) . '</label>';
            echo '<select name="' . esc_attr($name_path) . '" class="sam-input sam-select">';
            if ($value !== '' && !array_key_exists($value, $options)) {
                // Keep a value whose option has since been deleted visible.
                $options = [$value => $value . ' (missing)'] + $options;
            }
            foreach ($options as $val => $text) {
                echo '<option value="' . esc_attr($val) . '"' . selected($value, (string) $val, false) . '>' . esc_html($text) . '</option>';
            }
            echo '</select>';
            echo '</div>';
            return;
        }

        if (samudra_is_image_key($key)) {
            echo '<div class="sam-field">';
            echo '<label class="sam-field-label">' . esc_html($label) . '</label>';
            samudra_render_image_input($name_path, $value);
            echo '</div>';
            return;
        }

        $is_long = strlen($value) > 70 || strpos($value, "\n") !== false;
        echo '<div class="sam-field">';
        if ($label !== '') {
            echo '<label class="sam-field-label">' . esc_html($label) . '</label>';
        }
        if ($is_long) {
            echo '<textarea name="' . esc_attr($name_path) . '" rows="4" class="sam-textarea">' . esc_textarea($value) . '</textarea>';
        } else {
            echo '<input type="text" name="' . esc_attr($name_path) . '" value="' . esc_attr($value) . '" class="sam-input" />';
        }
        echo '</div>';
        return;
    }

    // ── Associative group ────────────────────────────────────────────
    if (!samudra_is_list($value)) {
        echo '<div class="sam-group">';
        if ($label !== '') {
            echo '<div class="sam-group-title">' . esc_html($label) . '</div>';
        }
        echo '<div class="sam-group-body">';
        foreach ($value as $k => $v) {
            samudra_render_dynamic_fields($name_path . '[' . $k . ']', $v, $k, samudra_humanize_key($k), $ctx, is_array($schema) ? ($schema[$k] ?? null) : null);
        }
        echo '</div>';
        echo '</div>';
        return;
    }

    // ── Indexed array (repeater) ─────────────────────────────────────
    $image_rows = samudra_is_image_list_key($key);
    $row_schema = samudra_list_item_schema(is_array($schema) && !empty($schema) ? $schema : $value);
    $schema_item = $row_schema !== "" ? $row_schema : samudra_list_item_schema($value);

    echo '<div class="sam-repeater">';
    if ($label !== '') {
        echo '<div class="sam-repeater-title">' . esc_html($label) . ' <span class="sam-count">' . count($value) . '</span></div>';
    }

    echo '<div class="samudra-array-items-list sam-rows">';
    foreach ($value as $index => $item) {
        samudra_render_repeater_row($name_path . '[' . $index . ']', $item, $row_schema, $ctx, false, $image_rows);
    }
    echo '</div>';

    // Hidden template cloned by samudraAddArrayItem().
    echo '<div class="samudra-array-template" style="display:none;" data-placeholder="__INDEX__" data-path="' . esc_attr($name_path) . '">';
    samudra_render_repeater_row(
        $name_path . '[__INDEX__]',
        is_array($schema_item) ? samudra_get_empty_template($schema_item) : "",
        $row_schema,
        $ctx,
        true,
        $image_rows
    );
    echo '</div>';

    $add_label = $label ? samudra_singularize($label) : 'Item';
    echo '<div class="sam-add-wrap"><button type="button" class="button sam-add" onclick="samudraAddArrayItem(this)">+ Add ' . esc_html($add_label) . '</button></div>';
    echo '</div>';
}

// ─── The page ───────────────────────────────────────────────────────
function samudra_admin_section_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $seeds = samudra_get_default_seeds();
    $active_key = samudra_active_section_key();
    $labels = samudra_section_labels();
    $section_label = $labels[$active_key] ?? ucfirst($active_key);
    $schema = $seeds[$active_key] ?? [];

    $message = '';

    if (isset($_POST['samudra_save_data']) && check_admin_referer('samudra_save_nonce')) {
        $form_data = isset($_POST['samudra_form_data']) ? wp_unslash($_POST['samudra_form_data']) : [];
        $form_data = samudra_fill_missing(samudra_drop_blank_rows(samudra_reindex_arrays($form_data)), $schema);
        update_option('samudra_data_' . $active_key, $form_data);
        $message = 'Content for "' . $section_label . '" updated successfully!';
    }

    if (isset($_POST['samudra_reset_data']) && check_admin_referer('samudra_save_nonce')) {
        update_option('samudra_data_' . $active_key, $seeds[$active_key]);
        $message = 'Content for "' . $section_label . '" reset to defaults successfully!';
    }

    $current_val = samudra_get_site_data($active_key);

    // Section-level context: category dropdowns read the live term list.
    $ctx = ['categories' => []];
    $terms = get_terms(['taxonomy' => 'portfolio_category', 'hide_empty' => false, 'orderby' => 'name', 'order' => 'ASC']);
    if (!is_wp_error($terms)) {
        foreach ($terms as $t) {
            $ctx['categories'][$t->slug] = html_entity_decode($t->name, ENT_QUOTES, 'UTF-8');
        }
    }

    $notes = samudra_section_notes();
    ?>
    <div class="wrap sam-admin">
        <style>
            .sam-admin h1 { font-weight:700; font-size:23px; color:#1d2327; margin-bottom:4px; }
            .sam-admin .sam-intro { margin-top:0; color:#50575e; font-size:13px; margin-bottom:6px; max-width:900px; }

            .sam-card { margin-top:18px; background:#fff; border:1px solid #ccd0d4; padding:24px 28px; box-shadow:0 1px 1px rgba(0,0,0,.04); border-radius:8px; }
            .sam-field { margin-bottom:14px; }
            .sam-field-inline { margin:0; flex:1; }
            .sam-field-label { display:block; font-weight:600; font-size:13px; color:#1d2327; margin-bottom:5px; }
            .sam-input, .sam-textarea, .sam-select { width:100%; max-width:840px; padding:8px 11px; border-radius:6px; border:1px solid #c3c4c7; background:#fff; font-size:14px; box-sizing:border-box; }
            .sam-input:focus, .sam-textarea:focus, .sam-select:focus { border-color:#2271b1; box-shadow:0 0 0 1px #2271b1; outline:none; }
            .sam-textarea { line-height:1.5; resize:vertical; }
            .sam-select { max-width:420px; }

            .sam-group { margin:14px 0; }
            .sam-group-title { font-size:14px; font-weight:700; color:#1d2327; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid #f0f0f1; }
            .sam-group-body { padding-left:16px; border-left:2px solid #f0f0f1; }

            .sam-repeater { margin:14px 0; padding:16px 18px; background:#f6f7f7; border:1px solid #e0e0e0; border-radius:10px; }
            .sam-repeater-title { font-size:14px; font-weight:700; color:#1d2327; margin-bottom:12px; display:flex; align-items:center; gap:8px; }
            .sam-count { background:#2271b1; color:#fff; font-size:11px; font-weight:700; border-radius:999px; padding:1px 9px; }
            .sam-rows { display:flex; flex-direction:column; gap:12px; }

            .sam-row { background:#fff; border:1px solid #dcdcde; border-radius:8px; padding:14px 16px; }
            .sam-row-simple { display:flex; align-items:center; gap:10px; padding:8px 10px; }
            .sam-row-image { align-items:flex-start; }
            .sam-row-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; padding-bottom:8px; border-bottom:1px dashed #e0e0e0; }
            .sam-row-title { font-weight:700; color:#2271b1; font-size:13px; }
            .sam-row-actions, .sam-handle { display:inline-flex; align-items:center; gap:6px; flex:0 0 auto; }

            .sam-move { cursor:pointer; border:1px solid #c3c4c7; background:#fff; color:#50575e; border-radius:5px; font-size:11px; line-height:1; padding:5px 8px; }
            .sam-move:hover { background:#2271b1; border-color:#2271b1; color:#fff; }

            .sam-remove { cursor:pointer; border:1px solid #d63638; background:#fff; color:#d63638; border-radius:5px; font-size:12px; font-weight:600; padding:3px 12px; line-height:1.7; }
            .sam-remove:hover { background:#d63638; color:#fff; }
            .sam-remove-x { padding:0 9px; font-size:18px; line-height:1.4; }
            .sam-add-wrap { margin-top:12px; }
            .sam-add.button { background:#fff; border:1px dashed #2271b1; color:#2271b1; font-weight:600; }
            .sam-add.button:hover { background:#2271b1; color:#fff; border-style:solid; }

            .sam-img-preview { margin:8px 0; }
            .sam-img-preview img { max-width:220px; max-height:150px; border:1px solid #ccd0d4; border-radius:6px; display:block; background:#f0f0f1; }
        </style>

        <h1><?php echo esc_html($section_label); ?></h1>
        <p class="sam-intro">
            Edit the content shown on this part of the website. Add, remove or reorder rows with ▲ ▼, then <strong>Save Changes</strong>.
        </p>
        <?php if (!empty($notes[$active_key])): ?>
            <p class="sam-intro"><?php echo wp_kses_post($notes[$active_key]); ?></p>
        <?php endif; ?>

        <?php if (!empty($message)): ?>
            <div class="notice notice-success is-dismissible">
                <p><strong><?php echo esc_html($message); ?></strong></p>
            </div>
        <?php endif; ?>

        <div class="sam-card">
            <form method="post" action="">
                <?php wp_nonce_field('samudra_save_nonce'); ?>

                <div class="samudra-form-fields">
                    <?php samudra_render_dynamic_fields('samudra_form_data', $current_val, '', '', $ctx, $schema); ?>
                </div>

                <p class="submit" style="display:flex; gap:12px; border-top:1px solid #f0f0f1; padding-top:20px; margin-top:30px; margin-bottom:0;">
                    <input type="submit" name="samudra_save_data" class="button button-primary button-large" value="Save Changes">
                    <input type="submit" name="samudra_reset_data" class="button button-secondary button-large" onclick="return confirm('Reset this section to its default seed data? Any custom edits will be lost.');" value="Reset to Default">
                </p>
            </form>
        </div>
    </div>

    <script>
        function samudraAddArrayItem(button) {
            // button → .sam-add-wrap → .sam-repeater. Scope to THIS repeater's own
            // direct list/template so nested repeaters don't interfere.
            var repeater = button.closest('.sam-repeater');
            if (!repeater) return;
            var container = repeater.querySelector(':scope > .samudra-array-items-list');
            var templateContainer = repeater.querySelector(':scope > .samudra-array-template');
            if (!container || !templateContainer) return;

            var placeholder = templateContainer.getAttribute('data-placeholder');
            var path = templateContainer.getAttribute('data-path');
            var html = templateContainer.innerHTML;

            // Unique index so new rows never collide with existing ones. Only
            // this repeater's own "<path>[__INDEX__]" is replaced: a nested
            // repeater inside the row keeps its __INDEX__ placeholder until its
            // own "+ Add" is clicked.
            var newIndex = 'new_' + Date.now();
            var finalHtml = html.split(path + '[' + placeholder + ']').join(path + '[' + newIndex + ']');

            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = finalHtml;
            var row = tempDiv.firstElementChild;
            // Image picker ids are derived from the field name; make them unique.
            row.querySelectorAll('.sam-img-input').forEach(function (input, i) {
                var id = 'samimg_new_' + Date.now() + '_' + i;
                var field = input.parentNode;
                field.querySelectorAll('[data-target="' + input.id + '"]').forEach(function (b) { b.setAttribute('data-target', id); });
                input.id = id;
            });
            container.appendChild(row);
        }

        (function () {
            // ── Reorder rows ────────────────────────────────────────
            // Row order is derived from the order fields appear in the POST
            // body, so moving the DOM node is all that is needed.
            document.addEventListener('click', function (e) {
                var move = e.target.closest('.sam-move');
                if (!move) return;
                e.preventDefault();
                var row = move.closest('.samudra-array-row-wrapper');
                if (!row) return;
                if (move.getAttribute('data-dir') === 'up') {
                    var prev = row.previousElementSibling;
                    if (prev) row.parentNode.insertBefore(row, prev);
                } else {
                    var next = row.nextElementSibling;
                    if (next) row.parentNode.insertBefore(next, row);
                }
                row.scrollIntoView({ block: 'nearest' });
            });

            // ── Media Library picker ────────────────────────────────
            function preview(input) {
                var field = input.parentNode;
                return field ? field.querySelector('.sam-img-preview') : null;
            }
            document.addEventListener('click', function (e) {
                var pick = e.target.closest('.sam-img-pick');
                if (pick) {
                    e.preventDefault();
                    var input = document.getElementById(pick.getAttribute('data-target'));
                    if (!input || typeof wp === 'undefined' || !wp.media) return;
                    var frame = wp.media({ title: 'Select Image', multiple: false, library: { type: 'image' } });
                    frame.on('select', function () {
                        var att = frame.state().get('selection').first().toJSON();
                        input.value = att.url;
                        var p = preview(input);
                        if (p) {
                            p.innerHTML = '';
                            var img = document.createElement('img');
                            img.src = att.url;
                            img.alt = '';
                            p.appendChild(img);
                        }
                    });
                    frame.open();
                    return;
                }
                var clear = e.target.closest('.sam-img-clear');
                if (clear) {
                    e.preventDefault();
                    var inp = document.getElementById(clear.getAttribute('data-target'));
                    if (!inp) return;
                    inp.value = '';
                    var pv = preview(inp);
                    if (pv) pv.innerHTML = '';
                }
            });
        })();
    </script>
    <?php
}
