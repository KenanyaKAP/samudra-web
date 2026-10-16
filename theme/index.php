<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Samudra - Your Exhibition Partner. Professional exhibition, event management, and creative solutions.">

    <link rel="icon" type="image/png" href="<?php echo esc_url(get_template_directory_uri() . '/dist/Logo.png?v=2'); ?>">

    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

    <!-- React root -->
    <div id="root"></div>

<?php wp_footer(); ?>
</body>
</html>
