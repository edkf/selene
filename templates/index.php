<?php if (!have_posts()) : ?>
	<div class="alert alert--warning">
		<?php _e('Sorry, no results were found.', 'sepha'); ?>
	</div>
	<?php get_search_form(); ?>
<?php endif; ?>

<?php while (have_posts()) : the_post(); ?>
	<?php get_template_part('partials/content'); ?>
<?php endwhile; ?>

<?php the_posts_navigation(); ?>
