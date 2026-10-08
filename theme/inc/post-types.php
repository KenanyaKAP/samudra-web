<?php
/**
 * Custom post types for the Samudra site.
 *
 * - portfolio (+ portfolio_category): projects shown on /services and
 *   /services/<slug>. Featured image = card cover.
 * - career: open positions listed on /career.
 * - post: native posts, relabelled "News" (/events and /events/<slug>).
 *
 * One field-definition array drives meta registration (REST), the generic
 * meta box and saving. Meta keys are "<cpt>_<field>". Image fields store an
 * attachment URL (root-relative, "/wp-content/uploads/…", when picked from
 * the Media Library); gallery fields store a JSON array of URLs; date fields
 * store "YYYY-MM-DD".
 */

if (!defined('ABSPATH')) {
    exit;
}

// ─── Field definitions (rendered by the generic meta box) ───────────
function samudra_cpt_fields() {
    return [
        'portfolio' => [
            'description'    => ['label' => 'Card Summary (2–3 lines on the Services card; also the detail text while the editor above is empty)', 'type' => 'textarea'],
            'hero_image'     => ['label' => 'Main Image (top of the detail page; the Featured Image is used when empty)', 'type' => 'image'],
            'gallery_images' => ['label' => 'Gallery (photos under the text on the detail page)', 'type' => 'gallery'],
        ],
        'career' => [
            'location'     => ['label' => 'Location', 'type' => 'text', 'placeholder' => 'e.g. Jakarta, Indonesia'],
            'type'         => ['label' => 'Employment Type', 'type' => 'select', 'options' => ['Full-time', 'Part-time', 'Contract', 'Internship']],
            'level'        => ['label' => 'Level', 'type' => 'text', 'placeholder' => 'e.g. Managerial Position'],
            'description'  => ['label' => 'Short Description (one or two sentences on the card)', 'type' => 'textarea'],
            'closing_date' => ['label' => 'Application Closes On (the position disappears from the site the day after; leave empty to keep it open)', 'type' => 'date'],
        ],
    ];
}

/** Default portfolio categories, with the copy shown for each on /services. */
function samudra_default_portfolio_categories() {
    return [
        'Exhibition Construction' => 'Focusing in Exhibition Stand Design and Construction, Exhibition Division\'s services start from design concept through project planning up to implementation. Our Service include Standard Booth R8 & Maxima System, Custom Booth, Organizer Job, Interior Design and Exhibition Facilities.',
        'Interior Design & Build' => 'We provide the best support for Interior Design consultant that deliver creative interior design, ranging from residential, showrooms to office interiors. As experience and professional construction company, we have full-service solutions from design to build with the best quality.',
        'Special Project'         => 'Special Projects Division as a Professional Convention and Event’s Management Organizer is a certified Professional Convention Organizer (PCO). The certificate was issued by Jakarta Tourism & Culture Office for companies whose expertise in managing events: seminars, conventions, exhibitions, and other specialty events.',
        'Tent Service'            => 'Realizing that the world of tomorrow demands more and more mobility, in 1997 SAMUDRA established a Tent Division to provide services and support for outdoor corporate events, sports events, hospitality and celebratory events, and mobile exhibitions. Today, the foremost outdoor systems provider in Indonesia, Tent Division offers a wide range of tent sizes up to 20,000 square meters.',
    ];
}

/** Create any missing default category. Existing ones are left untouched. */
function samudra_seed_portfolio_categories() {
    foreach (samudra_default_portfolio_categories() as $name => $description) {
        if (!term_exists($name, 'portfolio_category')) {
            wp_insert_term($name, 'portfolio_category', ['description' => $description]);
        }
    }
}
add_action('after_switch_theme', 'samudra_seed_portfolio_categories');

// ─── Register the post types + taxonomy ─────────────────────────────
add_action('init', function () {
    register_post_type('portfolio', [
        'labels' => [
            'name'               => 'Portfolios',
            'singular_name'      => 'Portfolio',
            'add_new'            => 'Add New Portfolio',
            'add_new_item'       => 'Add New Portfolio',
            'edit_item'          => 'Edit Portfolio',
            'new_item'           => 'New Portfolio',
            'view_item'          => 'View Portfolio',
            'search_items'       => 'Search Portfolios',
            'not_found'          => 'No portfolios found',
            'not_found_in_trash' => 'No portfolios found in trash',
            'all_items'          => 'All Portfolios',
            'menu_name'          => 'Portfolios',
        ],
        'public'        => true,
        'has_archive'   => false,
        'rewrite'       => ['slug' => 'services'],
        'menu_icon'     => 'dashicons-portfolio',
        'menu_position' => 5,
        // Editor = the article on the detail page; Featured Image = card photo.
        'supports'      => ['title', 'editor', 'thumbnail', 'custom-fields'],
        'show_in_rest'  => true,
        'taxonomies'    => ['portfolio_category'],
    ]);

    register_taxonomy('portfolio_category', 'portfolio', [
        'labels' => [
            'name'          => 'Portfolio Categories',
            'singular_name' => 'Portfolio Category',
            'search_items'  => 'Search Categories',
            'all_items'     => 'All Categories',
            'edit_item'     => 'Edit Category',
            'update_item'   => 'Update Category',
            'add_new_item'  => 'Add New Category',
            'new_item_name' => 'New Category Name',
            'menu_name'     => 'Categories',
        ],
        'description'       => 'The Description of each category is the text shown under the filter on /services while that category is selected.',
        'hierarchical'      => true,
        'public'            => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'rewrite'           => ['slug' => 'portfolio-category'],
    ]);

    register_post_type('career', [
        'labels' => [
            'name'               => 'Career Positions',
            'singular_name'      => 'Career Position',
            'add_new'            => 'Add New Position',
            'add_new_item'       => 'Add New Position',
            'edit_item'          => 'Edit Position',
            'new_item'           => 'New Position',
            'view_item'          => 'View Position',
            'search_items'       => 'Search Positions',
            'not_found'          => 'No positions found',
            'not_found_in_trash' => 'No positions found in trash',
            'all_items'          => 'All Positions',
            'menu_name'          => 'Career',
        ],
        // Listed on /career only; positions have no page of their own.
        // Featured Image = the photo on the card.
        'public'              => false,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'exclude_from_search' => true,
        'menu_icon'           => 'dashicons-businessperson',
        'menu_position'       => 6,
        'supports'            => ['title', 'thumbnail', 'custom-fields'],
        'show_in_rest'        => true,
    ]);
});

// ─── Posts are the site's "News" ────────────────────────────────────
add_action('init', function () {
    $type = get_post_type_object('post');
    if (!$type) {
        return;
    }
    $l = $type->labels;
    $l->name           = 'News';
    $l->singular_name  = 'News';
    $l->add_new        = 'Add News';
    $l->add_new_item   = 'Add News';
    $l->edit_item      = 'Edit News';
    $l->new_item       = 'New News';
    $l->view_item      = 'View News';
    $l->view_items     = 'View News';
    $l->search_items   = 'Search News';
    $l->not_found      = 'No news found';
    $l->all_items      = 'All News';
    $l->menu_name      = 'News';
    $l->name_admin_bar = 'News';
    $type->menu_icon   = 'dashicons-megaphone';
});

// ─── Titles exactly as typed ────────────────────────────────────────
// WordPress "texturizes" titles (" - " becomes an en dash, quotes curl), so
// "Sales - Governments" would read differently on the site than in wp-admin
// and in the design, and no longer match the Position Applied For options.
remove_filter('the_title', 'wptexturize');

// ─── Permalinks match the React routes ──────────────────────────────
// So "View Post", the editor permalink and the REST `link` field all open the
// page React Router actually serves.
add_filter('post_link', function ($permalink, $post) {
    if ($post instanceof WP_Post && $post->post_type === 'post' && $post->post_name !== '') {
        return home_url('/events/' . $post->post_name);
    }
    return $permalink;
}, 10, 2);

add_filter('post_type_link', function ($permalink, $post) {
    if ($post instanceof WP_Post && $post->post_type === 'portfolio' && $post->post_name !== '') {
        return home_url('/services/' . $post->post_name);
    }
    return $permalink;
}, 10, 2);

// ─── Expose meta to REST ────────────────────────────────────────────
add_action('init', function () {
    foreach (samudra_cpt_fields() as $cpt => $fields) {
        foreach ($fields as $key => $spec) {
            register_post_meta($cpt, $cpt . '_' . $key, [
                'type'          => 'string',
                'single'        => true,
                'default'       => $spec['type'] === 'gallery' ? '[]' : '',
                'show_in_rest'  => true,
                'auth_callback' => function () { return current_user_can('edit_posts'); },
            ]);
        }
    }
});

// featured_image_url on posts + CPTs, so lists need no second request.
add_action('rest_api_init', function () {
    foreach (['post', 'portfolio', 'career'] as $type) {
        register_rest_field($type, 'featured_image_url', [
            'get_callback' => function ($obj) {
                $id = get_post_thumbnail_id($obj['id']);
                if (!$id) return '';
                $src = wp_get_attachment_image_src($id, 'full');
                return $src ? $src[0] : '';
            },
            'schema' => [
                'description' => 'URL of the featured image',
                'type'        => 'string',
            ],
        ]);
    }
});

// ─── Generic meta box ───────────────────────────────────────────────
add_action('add_meta_boxes', function () {
    $titles = ['portfolio' => 'Portfolio Details', 'career' => 'Position Details'];
    foreach (samudra_cpt_fields() as $cpt => $fields) {
        add_meta_box(
            'samudra_' . $cpt . '_details',
            $titles[$cpt] ?? ucfirst($cpt) . ' Details',
            'samudra_render_cpt_metabox',
            $cpt,
            'normal',
            'high',
            ['cpt' => $cpt, 'fields' => $fields]
        );
    }
});

// Hide the raw "Custom Fields" box (meta is edited through our own box).
add_action('admin_menu', function () {
    foreach (array_keys(samudra_cpt_fields()) as $cpt) {
        remove_meta_box('postcustom', $cpt, 'normal');
    }
});

function samudra_render_cpt_metabox($post, $box) {
    $cpt = $box['args']['cpt'];
    $fields = $box['args']['fields'];
    wp_nonce_field('samudra_cpt_save', 'samudra_cpt_nonce');
    ?>
    <style>
        .scpt-field { margin: 0 0 18px; }
        .scpt-field > label { display:block; font-weight:600; margin-bottom:6px; }
        .scpt-field input[type=text], .scpt-field input[type=url], .scpt-field textarea, .scpt-field select { width:100%; }
        .scpt-field textarea { min-height:100px; }
        .scpt-img-preview { display:flex; flex-wrap:wrap; gap:8px; margin:8px 0; }
        .scpt-img-preview img { width:90px; height:90px; object-fit:cover; border:1px solid #ccd0d4; border-radius:4px; display:block; }
        .scpt-thumb { display:flex; flex-direction:column; gap:4px; }
        .scpt-thumb-actions { display:flex; justify-content:space-between; }
        .scpt-thumb-actions button { min-width:0; padding:0 6px; line-height:20px; min-height:22px; }
        .scpt-empty { color:#787c82; font-style:italic; }
    </style>
    <div class="scpt-metabox">
        <?php foreach ($fields as $key => $spec):
            $meta_key = $cpt . '_' . $key;
            $val = get_post_meta($post->ID, $meta_key, true);
            $field_id = 'scpt_' . $meta_key;
            $placeholder = $spec['placeholder'] ?? '';
            ?>
            <div class="scpt-field">
                <label for="<?php echo esc_attr($field_id); ?>"><?php echo esc_html($spec['label']); ?></label>
                <?php if ($spec['type'] === 'date'): ?>
                    <input type="date" id="<?php echo esc_attr($field_id); ?>" name="<?php echo esc_attr($meta_key); ?>" value="<?php echo esc_attr($val); ?>" style="max-width:220px;" />
                <?php elseif ($spec['type'] === 'text'): ?>
                    <input type="text" id="<?php echo esc_attr($field_id); ?>" name="<?php echo esc_attr($meta_key); ?>" value="<?php echo esc_attr($val); ?>" placeholder="<?php echo esc_attr($placeholder); ?>" />
                <?php elseif ($spec['type'] === 'url'): ?>
                    <input type="url" id="<?php echo esc_attr($field_id); ?>" name="<?php echo esc_attr($meta_key); ?>" value="<?php echo esc_attr($val); ?>" placeholder="<?php echo esc_attr($placeholder); ?>" />
                <?php elseif ($spec['type'] === 'textarea' || $spec['type'] === 'list'): ?>
                    <textarea id="<?php echo esc_attr($field_id); ?>" name="<?php echo esc_attr($meta_key); ?>"><?php echo esc_textarea($val); ?></textarea>
                <?php elseif ($spec['type'] === 'select'): ?>
                    <select id="<?php echo esc_attr($field_id); ?>" name="<?php echo esc_attr($meta_key); ?>">
                        <?php foreach ($spec['options'] as $opt): ?>
                            <option value="<?php echo esc_attr($opt); ?>" <?php selected($val, $opt); ?>><?php echo esc_html($opt); ?></option>
                        <?php endforeach; ?>
                    </select>
                <?php elseif ($spec['type'] === 'checkbox'): ?>
                    <label style="font-weight:400;">
                        <input type="checkbox" name="<?php echo esc_attr($meta_key); ?>" value="1" <?php checked($val, '1'); ?> /> Enabled
                    </label>
                <?php elseif ($spec['type'] === 'image'): ?>
                    <input type="hidden" id="<?php echo esc_attr($field_id); ?>" name="<?php echo esc_attr($meta_key); ?>" value="<?php echo esc_attr($val); ?>" />
                    <div class="scpt-img-preview"><?php if ($val): ?><img src="<?php echo esc_url($val); ?>" alt="" /><?php endif; ?></div>
                    <button type="button" class="button scpt-img-pick" data-target="<?php echo esc_attr($field_id); ?>">Select Image</button>
                    <button type="button" class="button scpt-img-clear" data-target="<?php echo esc_attr($field_id); ?>">Remove</button>
                <?php elseif ($spec['type'] === 'gallery'): ?>
                    <input type="hidden" id="<?php echo esc_attr($field_id); ?>" name="<?php echo esc_attr($meta_key); ?>" value="<?php echo esc_attr($val ?: '[]'); ?>" class="scpt-gallery-input" />
                    <div class="scpt-img-preview scpt-gallery-preview" data-target="<?php echo esc_attr($field_id); ?>"></div>
                    <button type="button" class="button scpt-gallery-pick" data-target="<?php echo esc_attr($field_id); ?>">Add Images</button>
                    <button type="button" class="button scpt-gallery-clear" data-target="<?php echo esc_attr($field_id); ?>">Clear All</button>
                <?php endif; ?>
            </div>
        <?php endforeach; ?>
    </div>
    <?php
}

// ─── Save meta ──────────────────────────────────────────────────────
add_action('save_post', function ($post_id) {
    if (!isset($_POST['samudra_cpt_nonce']) || !wp_verify_nonce($_POST['samudra_cpt_nonce'], 'samudra_cpt_save')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    $cpt = get_post_type($post_id);
    $all = samudra_cpt_fields();
    if (!isset($all[$cpt])) return;

    foreach ($all[$cpt] as $key => $spec) {
        $meta_key = $cpt . '_' . $key;
        if ($spec['type'] === 'checkbox') {
            update_post_meta($post_id, $meta_key, isset($_POST[$meta_key]) ? '1' : '0');
            continue;
        }
        if (!isset($_POST[$meta_key])) continue;
        $raw = wp_unslash($_POST[$meta_key]);
        if ($spec['type'] === 'textarea' || $spec['type'] === 'list') {
            update_post_meta($post_id, $meta_key, sanitize_textarea_field($raw));
        } elseif ($spec['type'] === 'image' || $spec['type'] === 'url') {
            update_post_meta($post_id, $meta_key, esc_url_raw($raw));
        } elseif ($spec['type'] === 'date') {
            $date = DateTime::createFromFormat('Y-m-d', $raw);
            update_post_meta($post_id, $meta_key, $date && $date->format('Y-m-d') === $raw ? $raw : '');
        } elseif ($spec['type'] === 'select') {
            update_post_meta($post_id, $meta_key, in_array($raw, $spec['options'], true) ? $raw : $spec['options'][0]);
        } elseif ($spec['type'] === 'gallery') {
            $decoded = json_decode($raw, true);
            $clean = [];
            if (is_array($decoded)) {
                foreach ($decoded as $u) {
                    $u = esc_url_raw($u);
                    if ($u) $clean[] = $u;
                }
            }
            // wp_slash because update_post_meta() unslashes internally.
            update_post_meta($post_id, $meta_key, wp_slash(wp_json_encode($clean)));
        } else {
            update_post_meta($post_id, $meta_key, sanitize_text_field($raw));
        }
    }
});

// ─── Career list: show the closing date and whether it is still open ──
add_filter('manage_career_posts_columns', function ($columns) {
    $date = $columns['date'] ?? null;
    unset($columns['date']);
    $columns['samudra_closes'] = 'Closes';
    if ($date) {
        $columns['date'] = $date;
    }
    return $columns;
});

add_action('manage_career_posts_custom_column', function ($column, $post_id) {
    if ($column !== 'samudra_closes') {
        return;
    }
    $closes = get_post_meta($post_id, 'career_closing_date', true);
    if (!$closes) {
        echo '<span style="color:#008a20;">Open (no closing date)</span>';
        return;
    }
    $open = $closes >= wp_date('Y-m-d');
    printf(
        '%s<br><span style="color:%s;">%s</span>',
        esc_html(wp_date('j F Y', strtotime($closes))),
        $open ? '#008a20' : '#d63638',
        $open ? 'Open' : 'Closed — hidden on the site'
    );
}, 10, 2);

// ─── Media picker JS for the meta boxes ─────────────────────────────
add_action('admin_enqueue_scripts', function () {
    $screen = get_current_screen();
    if (!$screen) return;
    if (in_array($screen->post_type, array_keys(samudra_cpt_fields()), true)) {
        wp_enqueue_media();
        add_action('admin_print_footer_scripts', 'samudra_cpt_media_js');
    }
});

function samudra_cpt_media_js() {
    ?>
    <script>
    (function ($) {
        function preview(target) { return $('#' + target).closest('.scpt-field').find('.scpt-img-preview'); }

        // Images of this site are stored as "/wp-content/uploads/…", without
        // the host they were picked on, so they keep working when the site is
        // opened through another address or moved to another domain.
        function sitePath(url) {
            var u = new URL(url, location.href);
            return u.host === location.host ? u.pathname + u.search : url;
        }

        // ── Single image ────────────────────────────────────────────
        $(document).on('click', '.scpt-img-pick', function (e) {
            e.preventDefault();
            var target = $(this).data('target');
            var frame = wp.media({ title: 'Select Image', multiple: false, library: { type: 'image' } });
            frame.on('select', function () {
                var att = frame.state().get('selection').first().toJSON();
                $('#' + target).val(sitePath(att.url));
                preview(target).empty().append($('<img alt="">').attr('src', att.url));
            });
            frame.open();
        });
        $(document).on('click', '.scpt-img-clear', function (e) {
            e.preventDefault();
            var target = $(this).data('target');
            $('#' + target).val('');
            preview(target).empty();
        });

        // ── Gallery: add, remove one, reorder ───────────────────────
        function read(target) {
            try { var v = JSON.parse($('#' + target).val() || '[]'); return Array.isArray(v) ? v : []; }
            catch (err) { return []; }
        }
        function write(target, urls) {
            $('#' + target).val(JSON.stringify(urls));
            draw(target);
        }
        function draw(target) {
            var urls = read(target);
            var box = preview(target).empty();
            if (!urls.length) { box.append('<span class="scpt-empty">No images yet.</span>'); return; }
            urls.forEach(function (url, i) {
                var thumb = $('<span class="scpt-thumb"></span>');
                thumb.append($('<img alt="">').attr('src', url));
                var actions = $('<span class="scpt-thumb-actions"></span>');
                actions.append($('<button type="button" class="button" title="Move left">&#9664;</button>').on('click', function () {
                    if (i === 0) return; var u = read(target); var t = u[i - 1]; u[i - 1] = u[i]; u[i] = t; write(target, u);
                }));
                actions.append($('<button type="button" class="button" title="Remove">&times;</button>').on('click', function () {
                    var u = read(target); u.splice(i, 1); write(target, u);
                }));
                actions.append($('<button type="button" class="button" title="Move right">&#9654;</button>').on('click', function () {
                    var u = read(target); if (i >= u.length - 1) return; var t = u[i + 1]; u[i + 1] = u[i]; u[i] = t; write(target, u);
                }));
                thumb.append(actions);
                box.append(thumb);
            });
        }
        $('.scpt-gallery-preview').each(function () { draw($(this).data('target')); });

        $(document).on('click', '.scpt-gallery-pick', function (e) {
            e.preventDefault();
            var target = $(this).data('target');
            var frame = wp.media({ title: 'Select Images', multiple: 'add', library: { type: 'image' } });
            frame.on('select', function () {
                var urls = frame.state().get('selection').map(function (a) { return sitePath(a.toJSON().url); });
                var merged = read(target).concat(urls).filter(function (v, i, a) { return a.indexOf(v) === i; });
                write(target, merged);
            });
            frame.open();
        });
        $(document).on('click', '.scpt-gallery-clear', function (e) {
            e.preventDefault();
            if (confirm('Remove every image from this gallery?')) write($(this).data('target'), []);
        });
    })(jQuery);
    </script>
    <?php
}
