$basepath = File.expand_path(File.join(File.dirname(__FILE__), '..'))

desc 'Build MAX'
task :build, [:environment] do |t, args|
  require 'jekyll'
  args.with_defaults(:environment => nil)

  helper = CoverallCrew::JekyllHelper.new(args[:environment])

  FileUtils.rm_r(helper.site.config['destination']) if File.exists?(helper.site.config['destination'])

  helper.build
  raise "Failed to build MAX site" unless File.exists?(helper.site.config['destination'])
end

module CoverallCrew
  class JekyllHelper
    def initialize(environment)
      @environment = environment
      @config = {}
      @config['source'] = File.join($basepath, '_source')
      @config['destination'] = File.join($basepath, '_site')
      @config['plugins'] = File.join($basepath, '_plugins')
      @config['layouts'] = '_layouts'
      @config['safe'] = false
    end

    def site
      overrides = {}
      if @site.nil?
        config_file_original = File.join($basepath, "_config.yml")
        overrides = YAML::load_file(config_file_original)

        unless @environment.nil?
          environment_config = File.join($basepath, "_config-#{@environment}.yml")

          if File.exists?(environment_config)
            overrides = overrides.deep_merge(YAML::load_file(environment_config))
            puts "Merging #{"_config-#{@environment}.yml".green} into config..."
          end
          overrides['env'] = @environment.to_s
        end
        overrides = overrides.deep_merge(@config)
      end

      # puts overrides
      @site ||= Jekyll::Site.new(Jekyll.configuration(overrides))
    end

    def build
      puts "Building MAX site"
      puts "url_prefix: #{site.config['url_prefix']}"
      puts `DEPLOYBOT=#{ENV['DEPLOYBOT_ENVIRONMENT']} gulp build`
      raise "gulp failed" unless $?.exitstatus == 0
      [ '_source/_assets/app.js', '_source/_assets/app.css' ].each do |f|
        raise "#{f} didn't build." unless File.exists?(f)
      end
      site.process

      raise "Failed to build MAX site" unless File.exists?(site.config['destination'])
    end
  end
end
