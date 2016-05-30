require 'yaml'

namespace :deploy do
  desc 'Deploy to staging'
  task :staging do
    destination = '/home/adobemax/Websites/max-stage.coverallcrew.com'
    servers = %w{ miles.retrix.com }

    CoverallCrew.deploy(:staging, servers, destination)
  end

  desc 'Deploy to preview'
  task :preview do
    destination = '/home/adobemax/Websites/max-preview.coverallcrew.com'
    servers = %w{ oscar.retrix.com }

    CoverallCrew.deploy(:preview, servers, destination)
  end

  desc 'Deploy to production'
  task :production do |args|
    destination = ENV['destination_override'].nil? ? '/home/adobemax/Websites/max.adobe.com' : ENV['destination_override']
    servers = []

    puts "Finding all Amazon EC2 servers for deployment..."
    servers += CoverallCrew::AWS::EC2.get_ec2_servers

    CoverallCrew.deploy(:production, servers, destination)

    # if we're deploying from deploybot, update a cached repo for automated builds
    if `whoami`.strip == 'deploybot' && ENV['no_update'].nil?
      puts "Updating automatic deployment repo... (delayed if there's an active deploy)"
      attempts = 3
      begin
        Bundler.with_clean_env do
          `/usr/bin/lockf -t 180 /tmp/deploy-adobemax2015.lock /home/deploybot/scheduled_deploys/update_adobemax2015.sh`
          if $?.exitstatus != 0
            puts "\a ! Could not update automated repo. Will try again in 3 seconds..."
            raise "Failed to update automated repo."
          else
            puts "Automated deployment repo successfully updated."
          end
        end
      rescue => e
        if attempts > 0
          attempts -= 1
          sleep 3
          retry
        else
          puts "Attempt to update repo was unsuccessful. Please reploy again."
          puts e.message
        end
      end
    else
      if ENV['no_update'].nil?
        puts "ALERT: not updating the automated deploy repo because it appears you are deploying outside of Deploybot. The next automated deploy will overwrite this deployment"
        sleep 1
        puts "Did you hear me?"
        sleep 1
        puts "Seriously. Did you hear me?"
        sleep 1
        puts "I hope you heard me!"
      end
    end
  end
end

module CoverallCrew
  def self.deploy(environment, servers, destination)
    if File.exists?("_site")
      FileUtils.rm_r("_site")
    end

    Rake::Task['build'].invoke(environment)

    crash_detected = false
    Dir.glob('**/**.core').each do |f|
      crash_detected = true
      FileUtils.rm(f)
    end

    raise "Jekyll build failed because ruby crashed. :(" if crash_detected
    raise "Jekyll did not successfully build the site. Time to panic!" unless File.exists?("_site/index.html")

    # gzip our HTML
    `find _site -name '*.html' -exec gzip -k {} \\;`

    servers.each do |s|
      puts "Deploying to #{s}..."
      attempts = 3
      begin
        puts `rsync -av --delete _site/ adobemax@#{s}:#{destination}/`
        if $?.exitstatus != 0
          puts "\a \a \a"
          puts "Did not deploy to #{s}. Will try again..."
          raise "Failed to deploy to #{s}"
        else
          puts "Deployed to #{s}..."
        end
      rescue
        if attempts > 0
          attempts -= 1
          retry
        else
          puts "Giving up on deployment to #{s} after 3 attempts. \a"
          sleep 1
        end
      end
    end

    checksum_file = File.join('/tmp', 'max-checksums.yaml')
    if environment == :production
      checksums = parse_checksums(`find _site -name '*.html' -exec md5 {} \\;`)
      diff = checksums.clone
      if File.exists?(checksum_file)
        puts "Loading previous checksums"
        last_checksums = YAML.load_file(checksum_file)

        last_checksums.each do |k, v|
          if v == checksums[k]
            diff.delete(k)
          else
            puts "#{k} is changed"
          end
        end
      end

      if diff.length > 0
        #response = CoverallCrew::AWS::CloudFront.create_invalidation(diff.keys.map { |m| "/#{m}".gsub(/index.html/, '') })
        #puts "Status: #{response[:status]}"
      end

      File.open(checksum_file, 'w') do |f|
        f.write(checksums.to_yaml)
      end
    end
  end

  def self.parse_checksums(raw)
    checksums = {}
    # MD5 (index.html) = 87bb6abefc159213344d986ba4ca6108
    raw.split("\n").each do |line|
      match = line.match(/^MD5 \((.+)\) = ([a-z0-9]+)$/)
      if match
        checksums[match[1][6..-1]] = match[2]
      end
    end
    checksums
  end
end
