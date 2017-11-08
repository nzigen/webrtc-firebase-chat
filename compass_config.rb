# Set this to the root of your project when deployed:
http_path = '/'
http_stylesheets_path = '/public/css'
http_javascripts_path = '/public/js'
http_images_path = '/public/img'

css_dir = File.join('public', 'css')
sass_dir = File.join('templates', 'css', 'sass')
images_dir = File.join('public', 'img')
javascripts_dir = File.join('public', 'js')
generated_images_dir = File.join('public', 'img')

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed
output_style = :compact

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false
line_comments = false

# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass
