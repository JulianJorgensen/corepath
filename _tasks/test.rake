require 'html-proofer'

task :test do
  sh "bundle exec jekyll build"
  HTMLProofer.check_directory("./_site", {
    :check_html => true,
    :check_favicon => true,
    :url_ignore => [
      # ignore "synthetic" links
      '/sessions/#track/creative-careers',
      '/sessions/#track/graphic-design',
      '/sessions/#track/photography',
      '/sessions/#track/video',
      '/sessions/#track/web-app-design'
    ]
  }).run

end
